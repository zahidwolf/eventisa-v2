import type { Metadata } from "next";
import Link from "next/link";
import { OrganizerApplyForm } from "@/components/auth/organizer-apply-form";
import { createPageMetadata } from "@/lib/seo/metadata";
import { routes } from "@/config/routes";

export const metadata: Metadata = createPageMetadata({
  title: "Apply as organizer",
  description: "Apply to host and sell tickets for your events on Eventisa",
});

export default function OrganizerRegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-4 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF3EA5]/25 bg-[#FF3EA5]/10 px-3 py-1 text-xs font-medium text-[#FF3EA5]">
          🎯 Organizer Portal
        </span>
      </div>
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Apply as Organizer</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter your organization name, email, phone, and password. We will review your application
          before you can publish events.
        </p>
      </div>
      <OrganizerApplyForm />
      <p className="mt-6 text-center text-sm text-zinc-500">
        Already an organizer?{" "}
        <Link href={routes.organizer.login} className="font-medium text-[#FF3EA5] hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-zinc-500">
        Buying tickets?{" "}
        <Link href={routes.login} className="text-[#FF3EA5] hover:underline">
          User login
        </Link>
      </p>
    </div>
  );
}
