import type { Metadata } from "next";
import { Cpu, Sparkles, Ticket } from "lucide-react";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { CoverImage } from "@/components/media/cover-image";
import { fetchPublicTeamMembers } from "@/lib/about/fetch-team-members";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import type { TeamMember } from "@/types/models/team-member";

const VALUES = [
  {
    icon: Sparkles,
    title: "Seamless Experiences",
    description:
      "We make event access effortless with automated ticketing, instant verification, and smooth entry-exit management that keeps events moving.",
  },
  {
    icon: Ticket,
    title: "Built for Organizers",
    description:
      "We give event organizers complete control with powerful, flexible tools to manage ticket sales, attendee data, custom forms, pricing, and event operations.",
  },
  {
    icon: Cpu,
    title: "Innovation & Reliability",
    description:
      "We continuously improve our technology to provide secure, scalable, and dependable event automation for events of every size.",
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "About Us",
  description: `Learn about ${siteConfig.name} and meet the innovators behind Bangladesh's premier event platform.`,
});

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-[#FF3EA5]/30 hover:bg-white/[0.05]">
      <div className="relative mb-5 h-32 w-32 overflow-hidden rounded-full ring-2 ring-[#FF3EA5]/30 ring-offset-2 ring-offset-[#12121e]">
        {member.imageUrl ? (
          <CoverImage src={member.imageUrl} alt={member.name} fill sizes="128px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center bg-zinc-800 text-2xl font-bold text-zinc-500">
            {member.name.charAt(0)}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-white">{member.name}</h3>
      <p className="mt-1 text-sm font-medium text-[#FF3EA5]">{member.designation}</p>
    </article>
  );
}

export default async function AboutPage() {
  const members = await fetchPublicTeamMembers();

  return (
    <Section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#FF3EA5]">About {siteConfig.name}</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Connecting Bangladesh through unforgettable events
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            {siteConfig.name} is the platform where organizers publish live experiences and audiences discover
            concerts, festivals, workshops, and community gatherings — all in one place.
          </p>
        </div>

        <div className="mx-auto mt-24 max-w-5xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              The Values That Drive Us
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#FF3EA5]/25 hover:bg-white/[0.05]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF3EA5]/15 text-[#FF3EA5]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-4xl">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Meet the Innovators</h2>
          </div>

          {members.length === 0 ? (
            <p className="mt-12 text-center text-sm text-zinc-500">
              Our team profiles are coming soon. Check back shortly.
            </p>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <TeamCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-24 max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#FF3EA5]/10 to-transparent p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-bold text-white">Our mission</h2>
          <p className="mt-4 text-zinc-400">
            We believe every great event starts with the right tools and the right people. From ticketing to
            check-in, we build technology that helps organizers focus on what matters — creating moments people
            remember.
          </p>
        </div>
      </Container>
    </Section>
  );
}
