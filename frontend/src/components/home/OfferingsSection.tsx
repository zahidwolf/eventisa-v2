import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  LayoutDashboard,
  Mail,
  QrCode,
  ScanLine,
  Ticket,
} from "lucide-react";
import { Container } from "@/components/common/container";

interface OfferingItem {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const OFFERINGS: OfferingItem[] = [
  {
    title: "Easy Ticket Purchase",
    icon: Ticket,
    accent: "#FF3EA5",
    description:
      "Browse concerts, conferences, workshops, and more — then buy your ticket in seconds, right from your phone or browser.",
  },
  {
    title: "Instant Ticket Delivery",
    icon: Mail,
    accent: "#9B5CFF",
    description:
      "Your tickets arrive immediately via email the moment your payment clears. Prefer WhatsApp? We support that too.",
  },
  {
    title: "Multiple Payment Methods",
    icon: CreditCard,
    accent: "#4F8CFF",
    description:
      "Pay with bKash, Nagad, Upay, Visa, Mastercard, and more. Fast, secure, and flexible checkout every time.",
  },
  {
    title: "Tickipass Feature",
    icon: QrCode,
    accent: "#22C55E",
    description:
      "Your ticket is a QR code. Show it at the gate — no printing needed. Entry is instant, smooth, and contactless.",
  },
  {
    title: "Organizer Dashboard",
    icon: LayoutDashboard,
    accent: "#F59E0B",
    description:
      "Powerful tools for event creators — manage ticket tiers, track sales in real time, and view attendee analytics all in one hub.",
  },
  {
    title: "Smooth Check-in Scanning",
    icon: ScanLine,
    accent: "#14B8A6",
    description:
      "Venue staff scan QR tickets with any device. Fast validation, zero queues, and live check-in stats for organizers.",
  },
];

export default function OfferingsSection() {
  return (
    <section className="border-t border-white/[0.06] py-8 md:py-16">
      <Container className="text-center">
        <div className="mb-6 md:mb-8">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Spotlight Events</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-500">
            Discover the events everyone&apos;s talking about — before they sell out.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {OFFERINGS.map(({ title, description, icon: Icon, accent }) => (
            <article
              key={title}
              className="glass-panel flex h-full flex-col items-center rounded-2xl border border-white/[0.08] p-6 text-center transition hover:border-[#FF3EA5]/25"
            >
              <span
                className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${accent}22`,
                  color: accent,
                }}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-zinc-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
