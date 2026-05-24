import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/legal/privacy-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: `Learn how ${siteConfig.name} collects, uses, and protects your personal information.`,
});

export default function PrivacyPage() {
  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#FF3EA5]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated {PRIVACY_LAST_UPDATED}</p>

          <div className="mt-14 space-y-12">
            {PRIVACY_SECTIONS.map((section, index) => (
              <section key={section.title} className="scroll-mt-24">
                <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                  {index + 1}. {section.title}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-6 text-sm leading-relaxed text-zinc-400">
                    {paragraph}
                  </p>
                ))}

                {section.listItems && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.rights && (
                  <dl className="mt-6 space-y-4">
                    {section.rights.map((right) => (
                      <div key={right.title}>
                        <dt className="text-sm font-semibold text-white">{right.title}</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-zinc-400">{right.body}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.closingParagraph && (
                  <p className="mt-6 text-sm leading-relaxed text-zinc-400">{section.closingParagraph}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
