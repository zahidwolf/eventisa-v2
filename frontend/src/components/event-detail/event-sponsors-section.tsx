import { CoverImage } from "@/components/media/cover-image";
import type { EventSponsor } from "@/types/models/university";

const TIER_ORDER = ["title", "gold", "silver", "community"] as const;
const TIER_LABEL: Record<string, string> = {
  title: "Title Sponsor",
  gold: "Gold",
  silver: "Silver",
  community: "Community Partner",
};

export function EventSponsorsSection({ sponsors }: { sponsors: EventSponsor[] }) {
  if (!sponsors?.length) return null;

  const sorted = [...sponsors].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Partners & sponsors</h2>
      {TIER_ORDER.map((tier) => {
        const group = sorted.filter((s) => s.tier === tier);
        if (!group.length) return null;
        return (
          <div key={tier} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-neon">
              {TIER_LABEL[tier]}
            </p>
            <div className="flex flex-wrap gap-4">
              {group.map((s) => (
                <a
                  key={s.name}
                  href={s.websiteUrl ?? "#"}
                  target={s.websiteUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="glass-panel flex h-20 w-36 items-center justify-center rounded-xl p-4 transition hover:border-primary-neon/40"
                >
                  <div className="relative h-12 w-full">
                    <CoverImage src={s.logo} alt={s.name} fill className="object-contain" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
