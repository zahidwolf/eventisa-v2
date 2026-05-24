import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as teamMemberService from "@/modules/about/services/team-member.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const members = await teamMemberService.listTeamMembersAdmin();
  res.json({ success: true, data: { members } });
});

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const members = await teamMemberService.listActiveTeamMembers();
  res.set("Cache-Control", "public, max-age=300");
  res.json({ success: true, data: { members } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamMemberService.createTeamMember(req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "team_member.create",
    resource: "team_member",
    metadata: { memberId: member._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.status(201).json({ success: true, data: { member }, message: "Team member added" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamMemberService.updateTeamMember(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "team_member.update",
    resource: "team_member",
    metadata: { memberId: member._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { member }, message: "Team member updated" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await teamMemberService.deleteTeamMember(req.params.id as string);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "team_member.delete",
    resource: "team_member",
    metadata: { memberId: req.params.id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, message: "Team member removed" });
});
