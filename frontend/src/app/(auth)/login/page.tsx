import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to your Eventisa account",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass-panel h-64 animate-pulse rounded-xl border border-white/10" />}>
      <LoginForm />
    </Suspense>
  );
}
