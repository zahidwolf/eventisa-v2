import { getApiBaseUrl } from "@/lib/api-base-url";
import type { TeamMember } from "@/types/models/team-member";

export async function fetchPublicTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/team-members`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { members?: TeamMember[] } };
    return json.data?.members ?? [];
  } catch {
    return [];
  }
}
