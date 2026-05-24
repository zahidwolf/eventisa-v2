import Link from "next/link";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function OrganizerPendingPage() {
  return (
    <Container className="py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Application under review</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500">
        Your organizer account is pending admin approval. We will notify you once you can publish
        events.
      </p>
      <Button variant="secondary" className="mt-8" asChild>
        <Link href={routes.home}>Back to home</Link>
      </Button>
    </Container>
  );
}
