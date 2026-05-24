import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
    </Container>
  );
}
