import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Create account",
  description: "Register for Eventisa event ticketing",
});

export default function RegisterPage() {
  return <RegisterForm />;
}
