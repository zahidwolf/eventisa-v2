"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  organizerApplyLoggedInSchema,
  organizerApplySignupSchema,
  type OrganizerApplyLoggedInData,
  type OrganizerApplySignupData,
} from "@/lib/validators/organizer-apply.schema";
import {
  applyAsOrganizer,
  registerAndApplyAsOrganizer,
} from "@/services/organizers/organizer-apply.service";
import { apiClient, getApiErrorMessage } from "@/services/api/client";
import { fetchOrganizerApprovalStatus } from "@/lib/auth/get-dashboard-route";
import { useAuthStore } from "@/store/auth.store";
import { routes } from "@/config/routes";
import { ROLES } from "@/constants/roles";

function OrganizationFields({
  register,
  errors,
  emailReadOnly,
}: {
  register: UseFormRegister<OrganizerApplyLoggedInData>;
  errors: FieldErrors<OrganizerApplyLoggedInData>;
  emailReadOnly?: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input
          id="organizationName"
          placeholder="e.g. Dhaka Live Events"
          autoComplete="organization"
          {...register("organizationName")}
        />
        {errors.organizationName && (
          <p className="text-xs text-destructive">{errors.organizationName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          readOnly={emailReadOnly}
          className={emailReadOnly ? "opacity-80" : undefined}
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="01XXXXXXXXX" autoComplete="tel" {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>
    </>
  );
}

function GuestApplyForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizerApplySignupData>({
    resolver: zodResolver(organizerApplySignupSchema),
  });

  const onSubmit = async (data: OrganizerApplySignupData) => {
    try {
      await apiClient.post("/auth/logout").catch(() => undefined);
      const result = await registerAndApplyAsOrganizer(data);
      sessionStorage.setItem("pendingVerificationEmail", result.email);
      toast.success("Check your email to verify your account.");
      router.push(
        `${routes.checkEmail}?email=${encodeURIComponent(result.email)}&portal=organizer`
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input
          id="organizationName"
          placeholder="e.g. Dhaka Live Events"
          autoComplete="organization"
          {...register("organizationName")}
        />
        {errors.organizationName && (
          <p className="text-xs text-destructive">{errors.organizationName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="01XXXXXXXXX" autoComplete="tel" {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href={`${routes.organizer.login}?next=${encodeURIComponent(routes.organizer.register)}`}
          className="font-medium text-[#FF3EA5] hover:underline"
        >
          Sign in first
        </Link>
      </p>
    </form>
  );
}

function LoggedInApplyForm({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrganizerApplyLoggedInData>({
    resolver: zodResolver(organizerApplyLoggedInSchema),
    defaultValues: { email: userEmail ?? "" },
  });

  useEffect(() => {
    if (userEmail) setValue("email", userEmail);
  }, [userEmail, setValue]);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/auth/me")
      .then(() => {
        if (!cancelled) setSessionOk(true);
      })
      .catch(() => {
        if (!cancelled) setSessionOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: OrganizerApplyLoggedInData) => {
    try {
      await applyAsOrganizer(data);
      if (user) {
        setUser({
          ...user,
          role: ROLES.ORGANIZER,
          organizerApprovalStatus: "pending",
        });
      }
      toast.success("Application submitted! We will review it shortly.");
      router.push(routes.organizer.pending);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (sessionOk === false) {
    return (
      <div className="space-y-4 text-center text-sm text-zinc-400">
        <p>
          Your browser has an admin session but no user login. Sign out of admin or use a normal
          account to apply.
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" asChild>
            <Link href="/admin/login">Admin portal</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              clearAuth();
              router.refresh();
            }}
          >
            Continue as guest
          </Button>
        </div>
      </div>
    );
  }

  if (sessionOk === null) {
    return <p className="text-center text-sm text-zinc-500">Checking session…</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <OrganizationFields register={register} errors={errors} emailReadOnly={!!userEmail} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}

export function OrganizerApplyForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [checkingProfile, setCheckingProfile] = useState(!!user);

  useEffect(() => {
    if (!user) {
      setCheckingProfile(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const status = await fetchOrganizerApprovalStatus();
      if (cancelled) return;
      if (status === "pending") {
        router.replace(routes.organizer.pending);
        return;
      }
      if (status === "rejected") {
        router.replace(routes.organizer.rejected);
        return;
      }
      if (status === "approved") {
        router.replace(routes.organizer.dashboard);
        return;
      }
      setCheckingProfile(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  if (checkingProfile) {
    return (
      <Card className="glass-panel border-brand/20">
        <CardContent className="py-10 text-center text-sm text-zinc-500">Loading…</CardContent>
      </Card>
    );
  }

  const isGuest = !user;

  return (
    <Card className="glass-panel border-brand/20">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {isGuest ? "Apply as organizer" : "Complete your application"}
        </CardTitle>
        <CardDescription>
          {isGuest
            ? "Organization name, email, phone, and password — all in one step."
            : "Submit your organization name, email, and phone for admin review."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGuest ? <GuestApplyForm /> : <LoggedInApplyForm userEmail={user?.email} />}
      </CardContent>
    </Card>
  );
}
