import { getApiBaseUrl } from "@/lib/api-base-url";
import type { OrganizerShowcaseItem } from "@/types/models/organizer-showcase";

export async function fetchOrganizerShowcaseServer(): Promise<OrganizerShowcaseItem[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/organizers/showcase`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { organizers?: OrganizerShowcaseItem[] } };
    return json.data?.organizers ?? [];
  } catch {
    return [];
  }
}
