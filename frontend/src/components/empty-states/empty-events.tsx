import Link from "next/link";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function EmptyEvents() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-neon/10">
        <CalendarX className="h-10 w-10 text-primary-neon" />
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold">No events yet</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        New concerts, sports, and festivals are added daily across Bangladesh.
      </p>
      <Button className="mt-8" asChild>
        <Link href={routes.home}>Back to home</Link>
      </Button>
    </div>
  );
}
