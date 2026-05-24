"use client";

import { useState } from "react";
import {
  Facebook,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactInfo } from "@/config/contact";
import { cn } from "@/lib/utils";

const ACCENT = "#FF3EA5";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
] as const;

const fieldClass =
  "flex h-11 w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3EA5] disabled:cursor-not-allowed disabled:opacity-50";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email.trim())) next.email = "Enter a valid email address";
    if (!subject.trim()) next.subject = "Subject is required";
    if (!message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFullName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <>
      <section className="border-b border-white/[0.06] bg-gradient-to-br from-[#0d0d18] via-[#151528] to-[#0d0d18] py-14 md:py-20">
        <Container className="text-center">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Contact Us</h1>
          <p className="mt-4 text-lg text-zinc-400">We typically respond within 24 hours</p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Get in Touch</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 md:text-base">
                Have a question, need help with your ticket, or want to host an event? We&apos;re here for you.
              </p>

              <div className="mt-8 space-y-4">
                <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-green-500">
                      <MessageCircle className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300">Chat with us on WhatsApp</p>
                      <p className="mt-1 text-sm text-zinc-500">{contactInfo.phoneDisplay}</p>
                      <a
                        href={contactInfo.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                      >
                        Open WhatsApp
                      </a>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF3EA5]/15 text-[#FF3EA5]">
                      <Mail className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300">Send us an email</p>
                      <p className="mt-1 text-sm text-zinc-500">{contactInfo.email}</p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Send Email
                      </a>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400">
                      <MapPin className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300">Visit us</p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500">{contactInfo.address}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-400">
                      <Phone className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300">Call us</p>
                      <a
                        href={`tel:${contactInfo.phoneTel}`}
                        className="mt-1 block text-sm text-zinc-500 transition hover:text-white"
                      >
                        {contactInfo.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </article>
              </div>

              <div className="mt-10">
                <p className="text-sm font-medium text-zinc-400">Follow us on</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:border-[#FF3EA5]/40 hover:text-[#FF3EA5]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-white">Send a Message</h2>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Full Name <span className="text-[#FF3EA5]">*</span>
                  </label>
                  <Input
                    id="contact-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={cn(fieldClass, "border-white/10 bg-[#1a1a2e] text-white focus-visible:ring-[#FF3EA5]")}
                    placeholder="Your name"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Email Address <span className="text-[#FF3EA5]">*</span>
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(fieldClass, "border-white/10 bg-[#1a1a2e] text-white focus-visible:ring-[#FF3EA5]")}
                    placeholder="you@example.com"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Subject <span className="text-[#FF3EA5]">*</span>
                  </label>
                  <Input
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={cn(fieldClass, "border-white/10 bg-[#1a1a2e] text-white focus-visible:ring-[#FF3EA5]")}
                    placeholder="How can we help?"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.subject)}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Message <span className="text-[#FF3EA5]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    placeholder="Tell us more..."
                    aria-invalid={Boolean(errors.message)}
                    className={cn(
                      fieldClass,
                      "min-h-[120px] resize-y py-3 focus-visible:ring-[#FF3EA5]",
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                {submitted && (
                  <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    ✅ Message sent! We&apos;ll get back to you within 24 hours.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-lg bg-[#FF3EA5] text-white hover:bg-[#FF3EA5]/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
