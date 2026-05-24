import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardTicketsContent from "./tickets-content";

export default function DashboardTicketsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-8 h-64 w-full rounded-xl" />
        </div>
      }
    >
      <DashboardTicketsContent />
    </Suspense>
  );
}
