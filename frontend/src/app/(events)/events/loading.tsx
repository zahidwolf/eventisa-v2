import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="h-10 w-64" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}
