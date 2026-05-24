import Link from "next/link";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl font-bold text-primary-neon">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-500">The page you are looking for does not exist.</p>
      <Button className="mt-8" asChild>
        <Link href={routes.home}>Go home</Link>
      </Button>
    </Container>
  );
}
