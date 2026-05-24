import Link from "next/link";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function RoutePlaceholder({ title }: { title: string }) {
  return (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-zinc-500">Coming soon.</p>
      <Button className="mt-8" variant="secondary" asChild>
        <Link href={routes.home}>Back to home</Link>
      </Button>
    </Container>
  );
}
