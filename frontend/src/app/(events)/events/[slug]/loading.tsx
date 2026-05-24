import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/common/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
    </Container>
  );
}
