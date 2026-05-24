import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/config/routes";

export const metadata: Metadata = createPageMetadata({
  title: "Organizer sign in",
  description: "Sign in to manage your events on Eventisa",
});

function LoginFormFallback() {
  return (
    <div className="glass-panel rounded-xl border border-brand/20 p-6 animate-pulse">
      <div className="mb-4 h-8 rounded bg-white/10" />
      <div className="space-y-3">
        <div className="h-11 rounded bg-white/10" />
        <div className="h-11 rounded bg-white/10" />
        <div className="h-11 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function OrganizerLoginPage() {
  return (
    <>
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF3EA5]/25 bg-[#FF3EA5]/10 px-3 py-1 text-xs font-medium text-[#FF3EA5]">
          🎯 Organizer Portal
        </span>
      </div>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Organizer Sign In</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Manage your events, tickets, and check-in
        </p>
      </div>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm
          variant="organizer"
          hideCardHeader
          hideRegisterLink
        />
      </Suspense>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Want to host events?{" "}
        <Link href={routes.organizer.register} className="font-medium text-[#FF3EA5] hover:underline">
          Apply as Organizer
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-zinc-500">
        Buying tickets?{" "}
        <Link href={routes.login} className="text-[#FF3EA5] hover:underline">
          User login
        </Link>
      </p>
    </>
  );
}
