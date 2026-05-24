"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth.schema";
import {
  login,
  logout,
  resendVerificationEmail,
  isEmailNotVerifiedError,
  getEmailNotVerifiedAddress,
} from "@/services/auth/auth.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useAuthStore } from "@/store/auth.store";
import { routes } from "@/config/routes";
import { ROLES } from "@/constants/roles";
import { resolvePostLoginRoute, fetchOrganizerApprovalStatus } from "@/lib/auth/get-dashboard-route";

interface LoginFormProps {
  variant?: "buyer" | "organizer";
  title?: string;
  description?: string;
  hideCardHeader?: boolean;
  hideRegisterLink?: boolean;
}

export function LoginForm({
  variant = "buyer",
  title = "Sign in",
  description = "Access your tickets and orders",
  hideCardHeader = false,
  hideRegisterLink = false,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const setUser = useAuthStore((s) => s.setUser);

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleResendVerification = async () => {
    const email = unverifiedEmail ?? getValues("email");
    if (!email) return;
    setResending(true);
    try {
      await resendVerificationEmail(email);
      setResendSent(true);
      toast.success("Verification email sent!");
    } catch {
      setResendSent(true);
      toast.success("If registered, a verification email was sent.");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setUnverifiedEmail(null);
    setResendSent(false);
    try {
      const res = await login(data);
      const user = res.data!.user;

      if (variant === "organizer") {
        const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
        const isOrganizer = user.role === ROLES.ORGANIZER;
        const organizerStatus =
          user.organizerApprovalStatus ?? (await fetchOrganizerApprovalStatus());

        if (!isOrganizer && !isStaff && !organizerStatus) {
          await logout().catch(() => undefined);
          toast.error("This account is not an organizer. Use buyer login or apply as an organizer.");
          return;
        }

        const enriched = {
          ...user,
          role: isStaff ? user.role : ROLES.ORGANIZER,
          organizerApprovalStatus: organizerStatus ?? user.organizerApprovalStatus ?? "approved",
        };
        setUser(enriched);
        toast.success("Welcome back!");

        const destination = nextPath?.startsWith("/")
          ? nextPath
          : await resolvePostLoginRoute(enriched, { preferOrganizer: true });
        router.replace(destination);
        return;
      }

      setUser(user);
      toast.success("Welcome back!");

      const destination = nextPath?.startsWith("/")
        ? nextPath
        : await resolvePostLoginRoute(user);

      router.replace(destination);
    } catch (error) {
      if (isEmailNotVerifiedError(error)) {
        const email = getEmailNotVerifiedAddress(error) ?? data.email;
        setUnverifiedEmail(email);
        toast.error("Please verify your email before signing in.");
        return;
      }
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div>
      <Card className="glass-panel border-brand/20">
        {!hideCardHeader && (
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )}
        <CardContent className={hideCardHeader ? "pt-6" : undefined}>
          {unverifiedEmail && (
            <div
              className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100"
              role="alert"
            >
              <p className="font-medium">Email not verified</p>
              <p className="mt-1 text-amber-200/90">
                Please check your inbox for the verification email sent to{" "}
                <span className="font-semibold">{unverifiedEmail}</span>.
              </p>
              <Button
                type="button"
                variant="link"
                className="mt-2 h-auto p-0 text-[#FF3EA5]"
                disabled={resending || resendSent}
                onClick={handleResendVerification}
              >
                {resendSent ? "Verification email sent!" : "Resend verification email"}
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@email.com" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link href={routes.forgotPassword} className="text-xs text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          {!hideRegisterLink && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href={routes.register} className="font-medium text-brand hover:underline">
                Create an account
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
