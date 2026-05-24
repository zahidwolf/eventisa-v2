import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeader } from "@/components/home/section-header";
import { POPULAR_EVENT_CATEGORIES } from "@/lib/categories/event-categories";
import { routes } from "@/config/routes";

const ICON_COLORS = [
  "#9B5CFF",
  "#FF3EA5",
  "#4F8CFF",
  "#F59E0B",
  "#22C55E",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
] as const;

const HOMEPAGE_CATEGORIES = POPULAR_EVENT_CATEGORIES.slice(0, 8);

export function CategoriesSection() {
  return (
    <section className="border-t border-white/[0.06] py-8 md:py-14">
      <Container>
        <SectionHeader title="Browse by categories" href={routes.categories} linkLabel="View all" />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-9 lg:gap-4">
          {HOMEPAGE_CATEGORIES.map(({ slug, label, icon: Icon }, i) => (
            <Link
              key={slug}
              href={`${routes.events}?category=${encodeURIComponent(slug)}`}
              className="flex w-[100px] shrink-0 flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-surface-card p-4 transition hover:border-[#FF3EA5]/30 sm:w-auto"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${ICON_COLORS[i % ICON_COLORS.length]}22`,
                  color: ICON_COLORS[i % ICON_COLORS.length],
                }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-center text-xs font-semibold leading-tight text-zinc-200">
                {label}
              </span>
            </Link>
          ))}
          <Link
            href={routes.categories}
            className="flex w-[100px] shrink-0 flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-surface-card p-4 transition hover:border-[#FF3EA5]/30 sm:w-auto"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
              <LayoutGrid className="h-6 w-6" />
            </span>
            <span className="text-center text-xs font-semibold text-zinc-400">More</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
