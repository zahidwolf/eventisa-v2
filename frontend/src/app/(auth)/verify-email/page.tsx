"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailWarning, XCircle } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { verifyEmail, resendVerificationEmail } from "@/services/auth/auth.service";
import { getApiErrorMessage } from "@/services/api/client";

type VerifyState = "loading" | "success" | "already" | "expired" | "invalid";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const emailParam = params.get("email") ?? "";
  const portal = params.get("portal");

  const [state, setState] = useState<VerifyState>("loading");
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendSent, setResendSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const loginHref =
    portal === "organizer" ? routes.organizer.login : routes.login;

  useEffect(() => {
    if (!token || !emailParam) {
      setState("invalid");
      return;
    }

    verifyEmail({ token, email: emailParam })
      .then((res) => {
        if (res.data?.alreadyVerified) setState("already");
        else setState("success");
      })
      .catch((err) => {
        const msg = getApiErrorMessage(err).toLowerCase();
        if (msg.includes("expired")) setState("expired");
        else setState("invalid");
      });
  }, [token, emailParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!resendEmail.trim() || resendCooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail(resendEmail.trim());
      setResendSent(true);
      setResendCooldown(60);
    } catch {
      setResendSent(true);
      setResendCooldown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="glass-panel mx-auto max-w-md border-brand/20">
      <CardHeader className="text-center">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#FF3EA5]" />
            <CardTitle className="mt-4 text-xl">Verifying your email…</CardTitle>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <CardTitle className="mt-4 text-xl">Email verified successfully!</CardTitle>
          </>
        )}
        {state === "already" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <CardTitle className="mt-4 text-xl">Already verified</CardTitle>
          </>
        )}
        {state === "expired" && (
          <>
            <MailWarning className="mx-auto h-14 w-14 text-amber-400" />
            <CardTitle className="mt-4 text-xl">Link expired</CardTitle>
          </>
        )}
        {state === "invalid" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-400" />
            <CardTitle className="mt-4 text-xl">Invalid verification link</CardTitle>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
        {state === "success" && (
          <p>Your account is now active. You can sign in and start using Eventisa.</p>
        )}
        {state === "already" && <p>Your email is already verified. You can sign in anytime.</p>}
        {state === "expired" && (
          <>
            <p>Verification links expire after 24 hours.</p>
            <div className="space-y-2 text-left">
              <Label htmlFor="resend-email">Email</Label>
              <Input
                id="resend-email"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </div>
          </>
        )}
        {state === "invalid" && (
          <p>This link may have already been used or is incorrect. Request a new link below.</p>
        )}

        {(state === "expired" || state === "invalid") && (
          <div className="space-y-2">
            {state === "invalid" && (
              <div className="space-y-2 text-left">
                <Label htmlFor="resend-email-invalid">Email</Label>
                <Input
                  id="resend-email-invalid"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
              </div>
            )}
            <Button
              className="w-full bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
              disabled={resending || resendCooldown > 0 || !resendEmail.trim()}
              onClick={handleResend}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resending
                  ? "Sending…"
                  : "Resend verification email"}
            </Button>
            {resendSent && (
              <p className="text-xs text-emerald-400">If registered, a new link was sent.</p>
            )}
          </div>
        )}

        {(state === "success" || state === "already") && (
          <Button className="w-full" onClick={() => router.push(loginHref)}>
            Sign in
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </Container>
  );
}
