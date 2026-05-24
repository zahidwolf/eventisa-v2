import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <Container className="py-8">
      <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
      <Skeleton className="mt-8 h-12 w-3/4" />
      <Skeleton className="mt-4 h-6 w-1/2" />
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </Container>
  );
}
