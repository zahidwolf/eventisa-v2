import Link from "next/link";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function CtaSection() {
  return (
    <section className="py-12 md:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-[#FF3EA5]/25 bg-gradient-to-br from-[#151B31] via-[#10162A] to-[#070B1A] p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,62,165,0.15),transparent_60%)]" />
          <h2 className="relative font-display text-3xl font-bold md:text-4xl">
            Experience events like never before
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-zinc-400">
            From arena concerts to executive summits — secure, premium ticketing for every kind of
            event.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={routes.events}>Find events</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href={routes.register}>Create account</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
