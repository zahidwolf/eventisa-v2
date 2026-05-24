import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { AttendeeSubmission } from "@/modules/events/models/attendeeSubmission.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { rowsToCSV, rowsToExcelBuffer } from "@/modules/events/services/attendeeExport.service.js";
import {
  collectFormFieldLabels,
  collectFormFieldLabelsForSubmission,
  matchesSearch,
  segmentIdsMatchingFilter,
  segmentMeta,
  toAttendeeRow,
  type AttendeeSubmissionRow,
} from "@/modules/events/utils/attendee-row.util.js";
import { getSegmentCountsForEvent } from "@/modules/events/utils/attendee-stats.util.js";

export interface SaveSubmissionInput {
  orderId: string;
  eventId: string;
  segmentId: string;
  userId?: string;
  answers: Record<string, unknown>;
}

export interface AttendeeListFilters {
  page?: number;
  limit?: number;
  search?: string;
  segmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

async function loadEventForAccess(eventId: string, userId: string, role: Role) {
  if (role === Role.Admin || role === Role.SuperAdmin) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    return event;
  }
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function buildDateQuery(filters: AttendeeListFilters) {
  if (!filters.dateFrom && !filters.dateTo) return undefined;
  const range: Record<string, Date> = {};
  if (filters.dateFrom) range.$gte = new Date(filters.dateFrom);
  if (filters.dateTo) range.$lte = new Date(filters.dateTo);
  return range;
}

async function fetchSubmissionDocs(
  event: InstanceType<typeof Event>,
  filters: AttendeeListFilters
) {
  const query: Record<string, unknown> = {
    eventId: event._id,
  };
  if (filters.segmentId) {
    query.segmentId = { $in: segmentIdsMatchingFilter(event, filters.segmentId) };
  }
  const dateQ = buildDateQuery(filters);
  if (dateQ) query.submittedAt = dateQ;
  if (filters.search?.trim()) {
    query.orderId = { $regex: filters.search.trim(), $options: "i" };
  }
  return AttendeeSubmission.find(query).sort({ submittedAt: -1 }).lean();
}

async function fetchOrderFallback(
  event: InstanceType<typeof Event>,
  filters: AttendeeListFilters
) {
  const orderQuery: Record<string, unknown> = {
    eventId: event._id,
    paymentStatus: PaymentStatus.Paid,
  };
  if (filters.segmentId) {
    orderQuery["ticketItems.sectionId"] = {
      $in: segmentIdsMatchingFilter(event, filters.segmentId),
    };
  }
  const dateQ = buildDateQuery(filters);
  if (dateQ) orderQuery.createdAt = dateQ;

  const orders = await Order.find(orderQuery).sort({ createdAt: -1 }).limit(5000).lean();
  return orders.map((o) => ({
    _id: o._id,
    orderId: o.orderId,
    segmentId: o.ticketItems[0]?.sectionId ?? "",
    answers: Object.fromEntries(
      (o.customFormResponses ?? []).map((r) => [r.fieldKey, r.value])
    ),
    submittedAt: o.createdAt,
    guestName: o.guestName,
    guestEmail: o.guestEmail,
    guestPhone: o.guestPhone,
  }));
}

type RawSubmissionDoc = {
  _id: { toString(): string };
  orderId: string;
  segmentId: string;
  answers?: Record<string, unknown>;
  submittedAt: Date;
};

function orderGuestFallback(order?: {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}) {
  if (!order) return undefined;
  return {
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
  };
}

async function buildRows(eventId: string, userId: string, role: Role, filters: AttendeeListFilters) {
  const event = await loadEventForAccess(eventId, userId, role);
  const [docs, orders] = await Promise.all([
    fetchSubmissionDocs(event, filters),
    fetchOrderFallback(event, filters),
  ]);

  const orderByRef = new Map(orders.map((o) => [o.orderId, o]));
  const submissionByOrder = new Map(
    (docs as RawSubmissionDoc[]).map((d) => [d.orderId, d])
  );
  const orderIds = new Set<string>([
    ...submissionByOrder.keys(),
    ...orders.map((o) => o.orderId),
  ]);

  let rows: AttendeeSubmissionRow[] = [];
  for (const orderId of orderIds) {
    const submission = submissionByOrder.get(orderId);
    const order = orderByRef.get(orderId);
    const fallback = orderGuestFallback(order);

    if (submission) {
      rows.push(toAttendeeRow(event, submission, fallback));
    } else if (order) {
      rows.push(toAttendeeRow(event, order, fallback));
    }
  }

  rows.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  if (filters.search?.trim()) {
    rows = rows.filter((r) => matchesSearch(r, filters.search!.trim()));
  }
  return rows;
}

export async function getSubmissionsByEvent(
  eventId: string,
  userId: string,
  role: Role,
  filters: AttendeeListFilters = {}
) {
  try {
    await loadEventForAccess(eventId, userId, role);
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
    const event = await loadEventForAccess(eventId, userId, role);
    const allRows = await buildRows(eventId, userId, role, filters);
    const total = allRows.length;
    const rows = allRows.slice((page - 1) * limit, page * limit);
    const slimRows = rows.map((r) => ({
      _id: r.id,
      id: r.id,
      orderId: r.orderId,
      segmentName: r.segmentName,
      segmentId: r.segmentId,
      submittedAt: r.submittedAt,
      buyerName: r.name,
      buyerEmail: r.email,
      name: r.name,
      email: r.email,
      phone: r.phone,
      answers: r.answers,
      segmentColor: r.segmentColor,
    }));
    const segmentCounts = await getSegmentCountsForEvent(event);
    const formFields = collectFormFieldLabels(event, {
      segmentFilterId: filters.segmentId,
      rows: allRows,
    });

    return { rows: slimRows, page, limit, total, segmentCounts, formFields };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to fetch submissions", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function getSubmissionsBySegment(
  eventId: string,
  userId: string,
  role: Role,
  segmentId: string,
  pagination: { page?: number; limit?: number } = {}
) {
  return getSubmissionsByEvent(eventId, userId, role, { ...pagination, segmentId });
}

export async function searchSubmissions(
  eventId: string,
  userId: string,
  role: Role,
  query: string
) {
  return getSubmissionsByEvent(eventId, userId, role, { search: query, limit: 50, page: 1 });
}

export async function getSubmissionById(
  eventId: string,
  userId: string,
  role: Role,
  submissionId: string
) {
  try {
    const event = await loadEventForAccess(eventId, userId, role);
    const submissionDoc = await AttendeeSubmission.findOne({
      _id: submissionId,
      eventId: event._id,
    }).lean();

    let raw: RawSubmissionDoc;
    let order =
      submissionDoc &&
      (await Order.findOne({ orderId: submissionDoc.orderId, eventId: event._id }).lean());

    if (submissionDoc) {
      raw = submissionDoc as RawSubmissionDoc;
    } else {
      const orderOnly = await Order.findOne({
        ...(mongoose.isValidObjectId(submissionId) ? { _id: submissionId } : {}),
        eventId: event._id,
      }).lean();
      if (!orderOnly) throw new AppError("Submission not found", 404, ErrorCodes.NOT_FOUND);
      order = orderOnly;
      raw = {
        _id: orderOnly._id,
        orderId: orderOnly.orderId,
        segmentId: orderOnly.ticketItems[0]?.sectionId ?? "",
        answers: Object.fromEntries(
          (orderOnly.customFormResponses ?? []).map((r) => [r.fieldKey, r.value])
        ),
        submittedAt: orderOnly.createdAt,
      };
    }

    const row = toAttendeeRow(event, raw, orderGuestFallback(order ?? undefined));
    const meta = segmentMeta(event, row.segmentId);
    const orderDoc = order ?? (await Order.findOne({ orderId: raw.orderId, eventId: event._id }).lean());
    const ticket = orderDoc
      ? await Ticket.findOne({ orderId: orderDoc._id, eventId: event._id })
          .select("ticketNumber qrCodeData status")
          .lean()
      : null;

    return {
      submission: row,
      segment: meta,
      formFields: collectFormFieldLabelsForSubmission(event, row),
      ticket: ticket
        ? {
            ticketNumber: ticket.ticketNumber,
            qrCodeData: ticket.qrCodeData,
            status: ticket.status,
          }
        : null,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to fetch submission", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function saveSubmission(data: SaveSubmissionInput) {
  try {
    return await AttendeeSubmission.create({
      orderId: data.orderId,
      eventId: data.eventId,
      segmentId: data.segmentId,
      userId: data.userId,
      answers: data.answers,
      submittedAt: new Date(),
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to save attendee submission", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

async function loadExportRows(
  eventId: string,
  userId: string,
  role: Role,
  segmentId?: string | null
) {
  const { rows } = await getSubmissionsByEvent(eventId, userId, role, {
    segmentId: segmentId ?? undefined,
    page: 1,
    limit: 10_000,
  });
  return rows;
}

export async function exportToCSV(
  eventId: string,
  userId: string,
  role: Role,
  segmentId?: string | null
): Promise<string> {
  try {
    const rows = await loadExportRows(eventId, userId, role, segmentId);
    return rowsToCSV(rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to export CSV", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function exportToExcel(
  eventId: string,
  userId: string,
  role: Role,
  segmentId?: string | null
): Promise<Buffer> {
  try {
    const rows = await loadExportRows(eventId, userId, role, segmentId);
    return rowsToExcelBuffer(rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to export Excel", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export type { AttendeeSubmissionRow };
