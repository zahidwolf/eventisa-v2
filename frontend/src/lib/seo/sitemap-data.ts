import { env } from "@/config/env";
import type { EventListItem } from "@/types/models/event";

export async function fetchPublishedEventSlugs(): Promise<
  Pick<EventListItem, "slug" | "startDate">[]
> {
  try {
    const res = await fetch(`${env.apiUrl}/events?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.events ?? []) as Pick<EventListItem, "slug" | "startDate">[];
  } catch {
    return [];
  }
}
