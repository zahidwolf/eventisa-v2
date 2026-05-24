import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type { TeamMember, TeamMemberInput } from "@/types/models/team-member";

export async function fetchTeamMembersAdmin() {
  const res = await adminApiClient.get<ApiResponse<{ members: TeamMember[] }>>("/admin/team-members");
  return res.data.data!.members;
}

export async function createTeamMember(input: TeamMemberInput) {
  const res = await adminApiClient.post<ApiResponse<{ member: TeamMember }>>(
    "/admin/team-members",
    input
  );
  return res.data.data!.member;
}

export async function updateTeamMember(id: string, input: Partial<TeamMemberInput>) {
  const res = await adminApiClient.patch<ApiResponse<{ member: TeamMember }>>(
    `/admin/team-members/${id}`,
    input
  );
  return res.data.data!.member;
}

export async function deleteTeamMember(id: string) {
  await adminApiClient.delete(`/admin/team-members/${id}`);
}
