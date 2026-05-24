import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Event, type EventDocument } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import {
  findSectionBySegmentRef,
  segmentIdsMatchingFilter,
} from "@/modules/events/utils/attendee-row.util.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";

async function loadEventForAccess(eventId: string, userId: string, role: Role) {
  const leanSelect = "_id organizer ticketSections.segmentId ticketSections.title ticketSections.name ticketSections.capacity ticketSections.ticketColor";
  if (role === Role.Admin || role === Role.SuperAdmin) {
    const event = await Event.findById(eventId).select(leanSelect).lean();
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    return event;
  }
  const organizer = await Organizer.findOne({ userId }).select("_id").lean();
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id })
    .select(leanSelect)
    .lean();
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function getCheckInStats(eventId: string, userId: string, role: Role) {
  try {
    const event = await loadEventForAccess(eventId, userId, role);
    const ticketSections = event.ticketSections ?? [];
    const totalCapacity = ticketSections.reduce((s, sec) => s + (sec.capacity ?? 0), 0);
    const successFilter = { eventId: event._id, status: CheckInRecordStatus.Success };
    const totalCheckedIn = await CheckIn.countDocuments(successFilter);
    const agg = await CheckIn.aggregate([
      { $match: { eventId: event._id, status: CheckInRecordStatus.Success } },
      { $group: { _id: "$segmentId", checkedIn: { $sum: 1 } } },
    ]);
    const checkedMap = new Map(agg.map((a) => [a._id as string, a.checkedIn as number]));

    const perSegment = ticketSections.map((sec) => {
      const id = sectionDocId(sec as (typeof ticketSections)[0]);
      const capacity = sec.capacity ?? 0;
      const docId = (sec as { _id?: { toString(): string } })._id?.toString() ?? "";
      const checkedIn = checkedMap.get(id) ?? checkedMap.get(docId) ?? 0;
      return {
        segmentId: id,
        name: sec.name ?? sec.title,
        capacity,
        checkedIn,
        remaining: Math.max(0, capacity - checkedIn),
      };
    });

    return {
      totalCapacity,
      totalCheckedIn,
      percentage: totalCapacity ? Math.round((totalCheckedIn / totalCapacity) * 100) : 0,
      perSegment,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to load check-in stats", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function getCheckInLog(
  eventId: string,
  userId: string,
  role: Role,
  filters: { page?: number; limit?: number; segmentId?: string; status?: CheckInRecordStatus } = {}
) {
  try {
    const event = await loadEventForAccess(eventId, userId, role);
    const eventDoc = event as unknown as EventDocument;
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 30));
    const query: Record<string, unknown> = {
      eventId: new mongoose.Types.ObjectId(eventId),
    };
    if (filters.segmentId) {
      query.segmentId = { $in: segmentIdsMatchingFilter(eventDoc, filters.segmentId) };
    }
    if (filters.status) query.status = filters.status;

    const [rows, total] = await Promise.all([
      CheckIn.find(query).sort({ scannedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      CheckIn.countDocuments(query),
    ]);

    const entries = rows.map((r) => {
      const section = findSectionBySegmentRef(eventDoc, r.segmentId);
      return {
        id: r._id.toString(),
        ticketId: r.ticketId,
        attendeeName: r.attendeeName ?? "—",
        segmentId: r.segmentId,
        segmentName: section?.name ?? section?.title ?? r.segmentId,
        segmentColor: section?.ticketColor,
        status: r.status,
        deviceId: r.deviceId,
        scannedAt: r.scannedAt,
      };
    });

    return { rows: entries, page, limit, total };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to load check-in log", 500, ErrorCodes.INTERNAL_ERROR);
  }
}
