"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/container";
import { routes } from "@/config/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-14 w-14 text-accent-magenta" />
      <h1 className="mt-6 font-display text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        We hit an unexpected error. Try again or return to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" asChild>
          <Link href={routes.home}>Go home</Link>
        </Button>
      </div>
    </Container>
  );
}
