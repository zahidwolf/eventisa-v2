"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { TicketPass } from "@/components/tickets/ticket-pass";
import { Skeleton } from "@/components/ui/skeleton";
import { getTicket } from "@/services/tickets/tickets.service";

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id),
  });

  return (
    <Section>
      <Container size="narrow">
        {isLoading && <Skeleton className="mx-auto h-[520px] max-w-md rounded-3xl" />}
        {isError && (
          <p className="text-center text-destructive">Ticket not found or access denied.</p>
        )}
        {data?.data.ticket && <TicketPass ticket={data.data.ticket} />}
      </Container>
    </Section>
  );
}
