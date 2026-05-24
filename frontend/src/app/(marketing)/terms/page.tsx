import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { routes } from "@/config/routes";
import {
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/lib/legal/terms-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "Terms & Conditions",
  description: `Read the Terms and Conditions for using ${siteConfig.name}, Bangladesh's event ticketing and management platform.`,
});

export default function TermsPage() {
  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#FF3EA5]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-zinc-500">Last updated {TERMS_LAST_UPDATED}</p>
          <p className="mt-8 text-base leading-relaxed text-zinc-400">{TERMS_INTRO}</p>

          <div className="mt-14 space-y-12">
            {TERMS_SECTIONS.map((section, index) => (
              <section key={section.title} className="scroll-mt-24">
                <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                  {index + 1}. {section.title}
                </h2>

                {section.subsections?.map((subsection) => (
                  <div key={subsection.title} className="mt-6">
                    <h3 className="text-sm font-semibold text-white">{subsection.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{subsection.body}</p>
                  </div>
                ))}

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-6 text-sm leading-relaxed text-zinc-400">
                    {section.title === "Privacy" ? (
                      <>
                        Your use of Eventisa is also governed by our{" "}
                        <Link href={routes.privacy} className="text-[#FF3EA5] hover:underline">
                          Privacy Policy
                        </Link>
                        , which is incorporated into these Terms and Conditions by reference. By using
                        Eventisa, you consent to the collection and use of your information as described in
                        the Privacy Policy.
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}

                {section.listItems && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
