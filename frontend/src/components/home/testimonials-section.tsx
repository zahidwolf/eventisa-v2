import { Container } from "@/components/common/container";
import { SectionHeader } from "@/components/home/section-header";

const QUOTES = [
  { name: "Rafi K.", city: "Dhaka", text: "Booked a stadium concert in under a minute. Feels world-class." },
  { name: "Nadia S.", city: "Chattogram", text: "Our company summit registration was seamless on Eventisa." },
  { name: "Arif H.", city: "Sylhet", text: "From food festivals to tech meetups — one platform for everything." },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-white/[0.06] py-8 md:py-16">
      <Container>
        <SectionHeader title="Trusted nationwide" subtitle="Fans, professionals & organizers" />
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <blockquote
              key={q.name}
              className="glass-panel rounded-2xl p-6"
            >
              <p className="text-sm text-zinc-300">&ldquo;{q.text}&rdquo;</p>
              <footer className="mt-4 text-xs text-zinc-500">
                {q.name} · {q.city}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
