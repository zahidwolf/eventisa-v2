"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StepProgressBar } from "@/components/organizer/event-builder/StepProgressBar";
import { Step1BasicInfo } from "@/components/organizer/event-builder/steps/Step1BasicInfo";
import { Step2MediaVenue } from "@/components/organizer/event-builder/steps/Step2MediaVenue";
import { SegmentCreator } from "@/components/organizer/event-builder/SegmentCreator";
import { FormSetup } from "@/components/organizer/event-builder/FormSetup";
import { EventReview } from "@/components/organizer/event-builder/EventReview";
import {
  buildAdminUpdatePayload,
  buildCreatePayload,
  buildUpdatePayload,
  createInitialWizardState,
  eventToWizardState,
  validateForPublish,
} from "@/components/organizer/event-builder/wizard-mappers";
import type { EventWizardState, WizardStep } from "@/components/organizer/event-builder/wizard.types";
import {
  createOrganizerEvent,
  fetchOrganizerEvent,
  submitEventForReview,
  updateOrganizerEvent,
} from "@/services/organizer/organizer-events.service";
import { approveEvent, fetchAdminEvent, updateAdminEvent } from "@/services/admin/admin-events.service";
import { getApiErrorMessage } from "@/services/api/client";
import { routes } from "@/config/routes";
import { adminRoutes } from "@/config/admin-routes";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";

interface EventCreationWizardProps {
  eventId?: string;
  isAdmin?: boolean;
}

function step1Errors(state: EventWizardState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!state.title.trim()) e.title = "Title is required";
  if (!state.startDate) e.startDate = "Start date is required";
  if (!state.endDate) e.endDate = "End date is required";
  else if (state.startDate && state.endDate && state.endDate <= state.startDate) {
    e.endDate = "End must be after start";
  }
  if (!state.registrationStart) {
    e.registrationStart = "Registration open date is required";
  }
  if (!state.registrationEnd) {
    e.registrationEnd = "Registration close date is required";
  } else if (
    state.registrationStart &&
    state.registrationEnd &&
    state.registrationEnd <= state.registrationStart
  ) {
    e.registrationEnd = "Must be after registration opens";
  } else if (state.registrationEnd && state.endDate && state.registrationEnd > state.endDate) {
    e.registrationEnd = "Cannot close after the event ends";
  }
  return e;
}

export function EventCreationWizard({
  eventId: initialEventId,
  isAdmin,
}: EventCreationWizardProps) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string | undefined>(initialEventId);
  const [state, setState] = useState<EventWizardState>(createInitialWizardState);
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(!!initialEventId);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [eventStatus, setEventStatus] = useState<string | undefined>();
  const lastSaved = useRef<string>("");

  const lockedForOrganizer =
    !isAdmin && (eventStatus === "live" || eventStatus === "ended");

  const buildSavePayload = useCallback(
    () => (isAdmin ? buildAdminUpdatePayload(state) : buildUpdatePayload(state)),
    [isAdmin, state]
  );

  const updateEvent = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      if (isAdmin) {
        await updateAdminEvent(id, payload);
      } else {
        await updateOrganizerEvent(id, payload);
      }
    },
    [isAdmin]
  );

  const patch = useCallback((p: Partial<EventWizardState>) => {
    setState((s) => {
      const next = { ...s, ...p };
      if (p.registrationStart !== undefined || p.registrationEnd !== undefined) {
        next.segments = s.segments.map((seg) => ({
          ...seg,
          saleStart: undefined,
          saleEnd: undefined,
        }));
      }
      return next;
    });
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!initialEventId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = isAdmin
          ? await fetchAdminEvent(initialEventId)
          : await fetchOrganizerEvent(initialEventId);
        const event = res.data?.event;
        if (!cancelled && event) {
          const ws = eventToWizardState(event as Parameters<typeof eventToWizardState>[0]);
          setState(ws);
          setEventStatus((event as { status?: string }).status);
          lastSaved.current = JSON.stringify(ws);
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialEventId, isAdmin]);

  const markStepComplete = (s: WizardStep) => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(s) ? prev.completedSteps : [...prev.completedSteps, s],
    }));
  };

  const persist = async (silent = false): Promise<string | undefined> => {
    if (lockedForOrganizer) {
      const message = "Live and ended events cannot be edited. Contact an admin for changes.";
      if (!silent) toast.error(message);
      throw new Error(message);
    }
    setSaving(true);
    try {
      if (!eventId) {
        const res = await createOrganizerEvent(buildCreatePayload(state));
        const id = res.data?.event._id;
        if (!id) {
          if (!silent) toast.error("Could not create event draft");
          return undefined;
        }
        setEventId(id);
        lastSaved.current = JSON.stringify(state);
        setDirty(false);
        if (!silent) toast.success("Draft saved");
        return id;
      }

      await updateEvent(eventId, buildSavePayload());
      lastSaved.current = JSON.stringify(state);
      setDirty(false);
      if (!silent) toast.success("Draft saved");
      return eventId;
    } catch (e) {
      const message = getApiErrorMessage(e);
      if (!silent) toast.error(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (lockedForOrganizer) return;
    const id = setInterval(() => {
      if (dirty && state.title.trim()) {
        void persist(true).catch(() => {
          /* silent auto-save failure */
        });
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [dirty, state, eventId, lockedForOrganizer]);

  const validateCurrentStep = (): boolean => {
    if (step === 1) {
      const e = step1Errors(state);
      setFieldErrors(e);
      return Object.keys(e).length === 0;
    }
    setFieldErrors({});
    return true;
  };

  const goNext = async () => {
    if (!validateCurrentStep()) return;
    markStepComplete(step);
    const nextStep = (step + 1) as WizardStep;

    if (step < 5) setStep(nextStep);

    if (step === 1 && !eventId) {
      try {
        const id = await persist(true);
        if (!id) {
          toast.error("Could not save draft. Check your connection and try Save draft.");
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      }
      return;
    }

    if (eventId) {
      try {
        await persist(true);
      } catch (e) {
        toast.error(getApiErrorMessage(e));
      }
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  const handleStepClick = (target: WizardStep) => {
    if (state.completedSteps.includes(target)) setStep(target);
  };

  const saveEventForPublish = async (): Promise<string> => {
    const id = eventId ?? (await persist(false));
    if (!id) {
      throw new Error("Could not save event. Fix any errors and try again.");
    }
    if (!eventId) setEventId(id);
    await updateEvent(id, buildSavePayload());
    return id;
  };

  const handleSubmitReview = async () => {
    const errs = validateForPublish(state, isAdmin);
    if (errs.length) {
      toast.error(errs.join(" · "));
      return;
    }
    setSaving(true);
    try {
      const id = await saveEventForPublish();
      await submitEventForReview(id);
      toast.success("Your event has been submitted for admin approval");
      router.replace(routes.organizer.eventOverview(id));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handlePublishImmediately = async () => {
    const errs = validateForPublish(state, isAdmin);
    if (errs.length) {
      toast.error(errs.join(" · "));
      return;
    }
    setSaving(true);
    try {
      const id = await saveEventForPublish();
      await approveEvent(id);
      toast.success("Event published");
      router.replace(adminRoutes.eventOverview(id));
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    const errs = validateForPublish(state, isAdmin);
    if (errs.length) {
      toast.error(errs.join(" · "));
      return;
    }
    setSaving(true);
    try {
      await saveEventForPublish();
      toast.success("Changes saved");
      setDirty(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-[480px] w-full rounded-2xl" />;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070B1A]/80 p-4 sm:p-6">
      {lockedForOrganizer && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          This event is <strong>{eventStatus}</strong> and cannot be edited as an organizer. Only
          admins can change live or ended events.
        </div>
      )}
      {isAdmin && (eventStatus === "live" || eventStatus === "ended") && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Admin mode: you can edit this {eventStatus} event.
        </div>
      )}
      <StepProgressBar
        current={step}
        completedSteps={state.completedSteps}
        hasUnsavedChanges={dirty}
        onStepClick={handleStepClick}
      />

      <div className="min-h-[360px] py-4">
        {step === 1 && <Step1BasicInfo state={state} errors={fieldErrors} onChange={patch} />}
        {step === 2 && (
          <Step2MediaVenue
            state={state}
            errors={fieldErrors}
            onChange={patch}
            onCoverUploaded={(url) => {
              if (!eventId || lockedForOrganizer) return;
              const coverImage = resolveUploadUrl(url) || url;
              void updateEvent(eventId, { coverImage })
                .then(() => toast.success("Banner saved"))
                .catch((e) => toast.error(getApiErrorMessage(e)));
            }}
          />
        )}
        {step === 3 && (
          <SegmentCreator
            segments={state.segments}
            allowForceDelete={isAdmin}
            onChange={(segments) => patch({ segments })}
            onSetForm={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <FormSetup
            allowEditLockedFields={isAdmin}
            globalFormFields={state.globalFormFields}
            segments={state.segments}
            onGlobalChange={(globalFormFields) => patch({ globalFormFields })}
            onSegmentChange={(segmentId, formFields) =>
              patch({
                segments: state.segments.map((s) =>
                  s.segmentId === segmentId ? { ...s, formFields } : s
                ),
              })
            }
          />
        )}
        {step === 5 && (
          <EventReview
            state={state}
            isAdmin={isAdmin}
            isEdit={!!initialEventId}
            saving={saving}
            onSaveDraft={() => {
              if (!lockedForOrganizer) void persist();
            }}
            onSubmitForReview={handleSubmitReview}
            onPublishImmediately={handlePublishImmediately}
            onSaveChanges={handleSaveChanges}
          />
        )}
      </div>

      {step < 5 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <Button type="button" variant="ghost" disabled={step === 1} onClick={goBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving || lockedForOrganizer}
              onClick={() => void persist()}
            >
              Save draft
            </Button>
            <Button
              type="button"
              className="bg-accent-magenta"
              disabled={saving || lockedForOrganizer}
              onClick={() => void goNext()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="border-t border-white/10 pt-4">
          <Button type="button" variant="ghost" onClick={goBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
