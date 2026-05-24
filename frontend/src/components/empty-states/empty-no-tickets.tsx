import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function EmptyNoTickets() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="rounded-full bg-primary-dark/30 p-5">
        <Ticket className="h-12 w-12 text-primary-neon" />
      </div>
      <h3 className="mt-6 font-display text-xl">No tickets yet</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Your purchased tickets will appear here after checkout.
      </p>
      <Button className="mt-6" asChild>
        <Link href={routes.events}>Discover events</Link>
      </Button>
    </div>
  );
}
