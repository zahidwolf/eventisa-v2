import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  TeamMember,
  type TeamMemberDocument,
} from "@/modules/about/models/team-member.model.js";
import { invalidateTeamMembersCache } from "@/modules/events/utils/event-cache.util.js";

export type TeamMemberInput = {
  name: string;
  designation: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  order?: number;
  isActive?: boolean;
};

function serialize(doc: TeamMemberDocument) {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    designation: doc.designation,
    description: doc.description,
    imageUrl: doc.imageUrl,
    imagePublicId: doc.imagePublicId,
    order: doc.order,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listTeamMembersAdmin() {
  const docs = await TeamMember.find().sort({ order: 1, createdAt: 1 });
  return docs.map(serialize);
}

export async function listActiveTeamMembers() {
  const { cacheGet, cacheSet } = await import("@/shared/cache/cache.service.js");
  const { TEAM_MEMBERS_CACHE_KEY } = await import("@/modules/events/utils/event-cache.util.js");
  type PublicMember = { _id: string; name: string; designation: string; imageUrl: string; order: number };
  const cached = cacheGet<PublicMember[]>(TEAM_MEMBERS_CACHE_KEY);
  if (cached) return cached;

  const docs = await TeamMember.find({ isActive: true })
    .select("name designation imageUrl order")
    .sort({ order: 1, createdAt: 1 })
    .lean();
  const members = docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    designation: d.designation,
    imageUrl: d.imageUrl,
    order: d.order,
  }));
  cacheSet(TEAM_MEMBERS_CACHE_KEY, members, 300);
  return members;
}

export async function createTeamMember(input: TeamMemberInput) {
  const count = await TeamMember.countDocuments();
  const doc = await TeamMember.create({
    ...input,
    order: input.order ?? count,
    isActive: input.isActive ?? true,
  });
  invalidateTeamMembersCache();
  return serialize(doc);
}

export async function updateTeamMember(id: string, input: Partial<TeamMemberInput>) {
  const doc = await TeamMember.findById(id);
  if (!doc) throw new AppError("Team member not found", 404, ErrorCodes.NOT_FOUND);
  Object.assign(doc, input);
  await doc.save();
  invalidateTeamMembersCache();
  return serialize(doc);
}

export async function deleteTeamMember(id: string) {
  const doc = await TeamMember.findByIdAndDelete(id);
  if (!doc) throw new AppError("Team member not found", 404, ErrorCodes.NOT_FOUND);
  invalidateTeamMembersCache();
}
