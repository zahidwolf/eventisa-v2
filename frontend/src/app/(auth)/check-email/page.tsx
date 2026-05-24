"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { resendVerificationEmail } from "@/services/auth/auth.service";

function CheckEmailContent() {
  const params = useSearchParams();
  const portal = params.get("portal");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromQuery = params.get("email");
    if (fromQuery) {
      setEmail(fromQuery);
      return;
    }
    const stored = sessionStorage.getItem("pendingVerificationEmail");
    if (stored) setEmail(stored);
  }, [params]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const registerHref =
    portal === "organizer" ? routes.organizer.register : routes.register;

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    try {
      await resendVerificationEmail(email.trim());
      setSent(true);
      setCooldown(60);
    } catch {
      setSent(true);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-panel mx-auto max-w-md border-brand/20">
      <CardHeader className="text-center">
        <Mail className="mx-auto h-14 w-14 text-[#FF3EA5]" />
        <CardTitle className="mt-4 text-2xl">Check your inbox!</CardTitle>
        <CardDescription className="text-base">
          We sent a verification link to:
          <br />
          <span className="mt-2 block font-semibold text-white">{email || "your email"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center text-sm text-muted-foreground">
        <p>
          Click the link in the email to verify your account and start using Eventisa.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left">
          <p className="font-medium text-white">Didn&apos;t receive it?</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">
            <li>Check your spam or promotions folder</li>
            <li>Wait a few minutes and try again</li>
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            disabled={loading || cooldown > 0 || !email.trim()}
            onClick={handleResend}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : loading
                ? "Sending…"
                : "Resend verification email"}
          </Button>
          {sent && (
            <p className="mt-2 text-center text-xs text-emerald-400">
              If this email is registered, a new link was sent.
            </p>
          )}
        </div>
        <p>
          Wrong email?{" "}
          <Link href={registerHref} className="font-medium text-[#FF3EA5] hover:underline">
            Sign up again
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <CheckEmailContent />
      </Suspense>
    </Container>
  );
}
