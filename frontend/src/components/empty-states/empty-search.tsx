import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function EmptySearch({
  query,
  hasFilters,
  onClearFilters,
}: {
  query?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <SearchX className="h-14 w-14 text-[#FF3EA5]/60" />
      <h3 className="mt-6 font-display text-xl">No matches found</h3>
      <p className="mt-2 text-sm text-zinc-500">
        {query
          ? `Nothing for "${query}". Try another city or category.`
          : hasFilters
            ? "No events match your filters. Try clearing them."
            : "No events are available yet. Run the demo seed or start the API server."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="default" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Button variant="secondary" asChild>
          <Link href={routes.events}>Browse all events</Link>
        </Button>
      </div>
    </div>
  );
}
