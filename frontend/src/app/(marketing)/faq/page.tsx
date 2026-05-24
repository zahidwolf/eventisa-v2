import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { routes } from "@/config/routes";
import { FAQ_SECTIONS } from "@/lib/faq/faq-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  description: `Answers to common questions about buying tickets, event access, refunds, and support on ${siteConfig.name}.`,
});

export default function FaqPage() {
  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#FF3EA5]">Help center</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            Everything you need to know about buying tickets, accessing your passes, and getting support on{" "}
            {siteConfig.name}.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl space-y-14">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-bold text-white md:text-3xl">{section.title}</h2>
              <div className="mt-6">
                <FaqAccordion items={section.items} />
              </div>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#FF3EA5]/10 to-transparent p-8 text-center md:p-10">
          <h2 className="font-display text-xl font-bold text-white">Still have questions?</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Our support team is here to help. Reach out through the Contact Us page and we&apos;ll get back to you
            within 24 hours on business days.
          </p>
          <Link
            href={routes.contact}
            className="mt-6 inline-flex rounded-full bg-[#FF3EA5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF3EA5]/90"
          >
            Contact Us
          </Link>
        </div>
      </Container>
    </Section>
  );
}
