import { AdminActivityLog } from "@/modules/admin/models/admin-activity-log.model.js";

export async function logAdminActivity(input: {
  adminId: string;
  adminName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  meta?: Record<string, unknown>;
}) {
  return AdminActivityLog.create(input);
}

export async function listAdminActivity(limit = 50): Promise<
  Array<{
    _id: string;
    adminId: string;
    adminName: string;
    action: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    meta?: Record<string, unknown>;
    createdAt: Date;
  }>
> {
  const logs = await AdminActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .lean();
  return logs.map((log) => ({
    ...log,
    _id: log._id.toString(),
  }));
}

export function formatActivityMessage(log: {
  adminName: string;
  action: string;
  targetName?: string;
}): string {
  const target = log.targetName ? ` ${log.targetName}` : "";
  const actionLabels: Record<string, string> = {
    "event.approve": "approved event",
    "event.reject": "rejected event",
    "organizer.approve": "approved organizer",
    "organizer.reject": "rejected organizer",
    "settings.update": "updated platform settings",
    "admin.invite": "invited admin",
    "admin.deactivate": "deactivated admin",
    "admin.role_change": "changed admin role",
    "refund.issue": "issued refund",
    "user.suspend": "suspended user",
  };
  const label = actionLabels[log.action] ?? log.action.replace(/\./g, " ");
  return `${log.adminName} ${label}${target}`;
}
