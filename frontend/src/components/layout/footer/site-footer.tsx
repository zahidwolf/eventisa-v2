import Link from "next/link";
import {
  Facebook,
  Home,
  Instagram,
  Mail,
  Phone,
  Sparkles,
  Youtube,
} from "lucide-react";
import { Container } from "@/components/common/container";
import { routes } from "@/config/routes";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

const ACCENT = "#FF3EA5";

const MORE_INFO_LINKS = [
  { href: routes.faq, label: "FAQ" },
  { href: routes.about, label: "About Us" },
  { href: routes.contact, label: "Contact Us" },
] as const;

const LEGAL_LINKS = [
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.refundPolicy, label: "Refund Policy" },
  { href: routes.terms, label: "Terms and Conditions" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  {
    href: "https://tiktok.com",
    label: "TikTok",
    icon: TikTokIcon,
  },
  {
    href: "https://wa.me/8801858057515",
    label: "WhatsApp",
    icon: WhatsAppIcon,
  },
] as const;

function FooterHeading({
  children,
  accent,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  if (accent) {
    return (
      <h3
        className={cn(
          "mb-4 inline-block bg-[#FF3EA5] px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white",
          className,
        )}
      >
        {children}
      </h3>
    );
  }

  return (
    <h3
      className={cn(
        "mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400",
        className,
      )}
    >
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-sm text-zinc-500 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}

function EventisaLogo() {
  return (
    <Link href={routes.home} className="inline-flex items-center gap-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: ACCENT }}
      >
        <Sparkles className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold uppercase tracking-wide text-white">
        {env.appName}
      </span>
    </Link>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function PaymentLogo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      className="flex h-7 items-center opacity-50 grayscale transition-opacity hover:opacity-70"
      title={label}
      aria-label={label}
    >
      {children}
    </span>
  );
}

const PAYMENT_BRANDS = ["bKash", "Nagad", "Upay"] as const;

function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
      {PAYMENT_BRANDS.map((name) => (
        <PaymentLogo key={name} label={name}>
          <span className="text-sm font-bold tracking-tight text-zinc-500">{name}</span>
        </PaymentLogo>
      ))}
      <PaymentLogo label="Visa">
        <svg viewBox="0 0 48 16" className="h-4 w-auto text-zinc-500" fill="currentColor" aria-hidden>
          <path d="M19.5 1.2 16 14.8h-3.4L16.1 1.2h3.4zm9.2 8.5c0-3.3-4.6-3.5-4.6-5 0-.5.4-1 1.3-1.1.4 0 1.6.1 2.3.7l.4-2.4c-.6-.2-1.4-.4-2.5-.4-2.6 0-4.4 1.4-4.4 3.4 0 1.5 1.3 2.3 2.3 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.3 0-2.1-.4-2.7-.7l-.4 2.5c.6.3 1.7.5 2.8.5 2.8 0 4.6-1.4 4.6-3.6zm11.5 5.1h3.1l-2.7-13.6h-2.9c-.7 0-1.2.4-1.5 1l-4.2 12.6h3.5l.6-1.6h4.3l.3 1.6zm-3.7-4.1 1.8-4.9.9 4.9h-2.7zM9.8 1.2 6.3 10.2 6 8.5C5.4 4.6 2.2 1.4-1.8 1.2H-6l7.2 13.6h3.5L9.8 1.2z" />
        </svg>
      </PaymentLogo>
      <PaymentLogo label="Mastercard">
        <svg viewBox="0 0 36 22" className="h-5 w-auto" aria-hidden>
          <circle cx="13" cy="11" r="9" className="fill-zinc-500" />
          <circle cx="23" cy="11" r="9" className="fill-zinc-400" />
        </svg>
      </PaymentLogo>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-surface-elevated/80">
      <Container>
        <div className="grid gap-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <EventisaLogo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
              Bangladesh&apos;s premium destination for discovering and booking events — concerts,
              conferences, festivals, and more.
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
              TRADE LICENSE: TRAD/DNCC/141845/2022
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Follow us
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>More info</FooterHeading>
            <nav className="flex flex-col gap-2.5" aria-label="More information">
              {MORE_INFO_LINKS.map(({ href, label }) => (
                <FooterLink key={href} href={href}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Legals</FooterHeading>
            <nav className="flex flex-col gap-2.5" aria-label="Legal">
              {LEGAL_LINKS.map(({ href, label }) => (
                <FooterLink key={href} href={href}>
                  {label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading accent>Contacts</FooterHeading>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex gap-3">
                <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3EA5]" aria-hidden />
                <span className="leading-relaxed">
                  ICT Tower , Agargaon, Dhaka-1207
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3EA5]" aria-hidden />
                <a
                  href="tel:+8801858057515"
                  className="transition-colors hover:text-white"
                >
                  +88 01858057515
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3EA5]" aria-hidden />
                <a
                  href="mailto:eventisa.contact@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  eventisa.contact@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] py-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <PaymentLogos />
            <p className="text-center text-xs text-zinc-600 sm:text-right">
              © 2026 {env.appName}. All rights reserved. Developed by TrevioIT
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
