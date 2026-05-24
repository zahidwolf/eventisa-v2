"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromoCodeForm } from "@/components/organizer/promo/PromoCodeForm";
import { PromoCodeStats } from "@/components/organizer/promo/PromoCodeStats";
import { PromoCodeTable } from "@/components/organizer/promo/PromoCodeTable";
import {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  getSegments,
  updatePromoCode,
} from "@/services/eventBuilder.service";
import {
  adminSegmentOptionsFromOverview,
  createAdminPromoCode,
  deleteAdminPromoCode,
  fetchAdminEventOverview,
  getAdminPromoCodes,
  updateAdminPromoCode,
} from "@/services/admin/admin-event-detail.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PromoCode, PromoCodeFormData, SegmentOption } from "@/types/promoCode.types";

interface PromoCodeManagerProps {
  eventId: string;
  apiMode?: "organizer" | "admin";
}

export function PromoCodeManager({ eventId, apiMode = "organizer" }: PromoCodeManagerProps) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [segmentOptions, setSegmentOptions] = useState<SegmentOption[]>([]);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["promo-codes", eventId, apiMode],
    queryFn: () => (apiMode === "admin" ? getAdminPromoCodes(eventId) : getPromoCodes(eventId)),
  });

  const loadSegments = useCallback(async () => {
    try {
      if (apiMode === "admin") {
        const overview = await fetchAdminEventOverview(eventId);
        setSegmentOptions(adminSegmentOptionsFromOverview(overview));
      } else {
        const segments = await getSegments(eventId);
        setSegmentOptions(segments.map((s) => ({ segmentId: s.segmentId, name: s.name })));
      }
    } catch {
      setSegmentOptions([]);
    }
  }, [eventId, apiMode]);

  useEffect(() => {
    loadSegments();
  }, [loadSegments]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["promo-codes", eventId] });

  const handleSubmit = async (data: PromoCodeFormData) => {
    setSaving(true);
    try {
      if (apiMode === "admin") {
        if (editing) {
          await updateAdminPromoCode(eventId, editing._id, data);
          toast.success("Promo code updated");
        } else {
          await createAdminPromoCode(eventId, data);
          toast.success("Promo code created");
        }
      } else if (editing) {
        await updatePromoCode(eventId, editing._id, data);
        toast.success("Promo code updated");
      } else {
        await createPromoCode(eventId, data);
        toast.success("Promo code created");
      }
      setModalOpen(false);
      setEditing(null);
      refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (codeId: string) => {
    try {
      if (apiMode === "admin") await deleteAdminPromoCode(eventId, codeId);
      else await deletePromoCode(eventId, codeId);
      toast.success("Promo code deleted");
      refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (code: PromoCode) => {
    setEditing(code);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promo codes</h2>
          <p className="text-sm text-zinc-500">Discount codes for this event at checkout</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Code
        </Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <>
          <PromoCodeStats codes={codes} />
          <PromoCodeTable
            codes={codes}
            segments={segmentOptions}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit promo code" : "Create promo code"}</DialogTitle>
          </DialogHeader>
          <PromoCodeForm
            segments={segmentOptions}
            initial={editing}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
