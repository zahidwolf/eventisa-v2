import { AuditLog } from "@/modules/audit/models/audit-log.model.js";

export async function createAuditLog(input: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  return AuditLog.create(input);
}

export async function listAuditLogs(query: {
  action?: string;
  resource?: string;
  page?: number;
  limit?: number;
}) {
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 50, 100);
  const filter: Record<string, unknown> = {};
  if (query.action) filter.action = query.action;
  if (query.resource) filter.resource = query.resource;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, total, page, limit };
}
