"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import {
  EVENT_CATEGORY_TAXONOMY,
  POPULAR_EVENT_CATEGORIES,
} from "@/lib/categories/event-categories";
import { routes } from "@/config/routes";

export default function CategoriesPage() {
  return (
    <Section>
      <Container>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Explore by <span className="text-gradient-luxury">category</span>
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-500">
            Concerts, conferences, university fests, food festivals & more — every event type in
            Bangladesh, one trusted platform.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_EVENT_CATEGORIES.map(({ slug, label, icon: Icon }, i) => {
            const tax = EVENT_CATEGORY_TAXONOMY.find((t) => t.category === slug);
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`${routes.events}?category=${encodeURIComponent(slug)}`}
                  className="card-lift glow-hover block rounded-2xl border border-white/10 bg-surface-card p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-[#9B5CFF]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-semibold">{label}</p>
                      {tax?.subcategories && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {tax.subcategories.slice(0, 3).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
