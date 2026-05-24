import { getApiBaseUrl } from "@/lib/api-base-url";
import type { OrganizerPublicProfile } from "@/types/models/organizer";

export async function fetchOrganizerProfile(slug: string): Promise<OrganizerPublicProfile | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/organizers/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: OrganizerPublicProfile };
    return json.data ?? null;
  } catch {
    return null;
  }
}
