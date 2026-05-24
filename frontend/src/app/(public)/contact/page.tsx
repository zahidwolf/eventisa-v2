import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} for ticket support, organizer inquiries, and general questions.`,
});

export default function Page() {
  return <ContactPage />;
}
