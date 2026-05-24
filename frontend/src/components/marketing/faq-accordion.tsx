"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FaqItem } from "@/lib/faq/faq-content";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-${index}`;

        return (
          <div key={item.question} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              id={`${panelId}-trigger`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.02]"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="font-medium text-white">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={`${panelId}-trigger`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-zinc-400">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
