import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import {
  PromoCode,
  PromoCodeType,
  type PromoCodeDocument,
} from "@/modules/events/models/promoCode.model.js";
import {
  calculateDiscount,
  formatCodeStats,
  generateCode,
  normalizePromoCode,
  promoStatusLabel,
} from "@/modules/events/utils/promoCode.util.js";
export interface ValidateCodeResult {
  valid: boolean;
  type?: PromoCodeType;
  value?: number;
  discountAmount: number;
  finalPrice: number;
  message?: string;
  code?: string;
}

function toObjectId(id: string) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id;
}

async function loadEventForOrganizer(eventId: string, userId: string, role: Role) {
  if (!mongoose.isValidObjectId(eventId)) {
    throw new AppError("Invalid event id", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (role === Role.Admin || role === Role.SuperAdmin) {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    return event;
  }
  const organizer = await Organizer.findOne({ userId: toObjectId(userId) });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function validateValueRange(type: PromoCodeType, value: number) {
  if (type === PromoCodeType.Percentage && (value < 1 || value > 100)) {
    throw new AppError("Percentage must be between 1 and 100", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (type === PromoCodeType.Flat && value <= 0) {
    throw new AppError("Flat discount must be greater than 0", 400, ErrorCodes.VALIDATION_ERROR);
  }
}

async function uniqueCodeForEvent(eventId: string, preferred?: string): Promise<string> {
  const eventRef = toObjectId(eventId);
  if (preferred) {
    const code = normalizePromoCode(preferred);
    const exists = await PromoCode.findOne({ code, eventId: eventRef });
    if (exists) {
      throw new AppError("Promo code already exists for this event", 400, ErrorCodes.VALIDATION_ERROR);
    }
    return code;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    const exists = await PromoCode.findOne({ code, eventId: eventRef });
    if (!exists) return code;
  }
  throw new AppError("Could not generate unique promo code", 500, ErrorCodes.INTERNAL_ERROR);
}

async function countUserUses(
  promoCode: string,
  eventId: mongoose.Types.ObjectId,
  userId?: string,
  guestEmail?: string
) {
  const query: Record<string, unknown> = {
    eventId,
    coupon: promoCode,
    paymentStatus: PaymentStatus.Paid,
  };
  if (userId && mongoose.isValidObjectId(userId)) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else if (guestEmail) {
    query.guestEmail = guestEmail.toLowerCase();
  }
  return Order.countDocuments(query);
}

function segmentAllowed(doc: PromoCodeDocument, segmentId: string) {
  if (!doc.segmentIds?.length) return true;
  return doc.segmentIds.includes(segmentId);
}

export async function createCode(
  organizerUserId: string,
  role: Role,
  eventId: string,
  data: {
    code?: string;
    type: PromoCodeType;
    value: number;
    maxUses?: number;
    perUserLimit?: number;
    validFrom: Date;
    validUntil: Date;
    segmentIds?: string[];
    isActive?: boolean;
  }
) {
  try {
    await loadEventForOrganizer(eventId, organizerUserId, role);
    validateValueRange(data.type, data.value);
    if (data.validFrom >= data.validUntil) {
      throw new AppError("validFrom must be before validUntil", 400, ErrorCodes.VALIDATION_ERROR);
    }

    const code = await uniqueCodeForEvent(eventId, data.code);
    const doc = await PromoCode.create({
      code,
      eventId: toObjectId(eventId),
      segmentIds: data.segmentIds ?? [],
      type: data.type,
      value: data.value,
      maxUses: data.maxUses ?? 0,
      perUserLimit: data.perUserLimit ?? 1,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: data.isActive ?? true,
      createdBy: toObjectId(organizerUserId),
    });
    return doc;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to create promo code", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function updateCode(
  codeId: string,
  organizerUserId: string,
  role: Role,
  updates: Partial<{
    type: PromoCodeType;
    value: number;
    maxUses: number;
    perUserLimit: number;
    validFrom: Date;
    validUntil: Date;
    segmentIds: string[];
    isActive: boolean;
  }>
) {
  try {
    const doc = await PromoCode.findById(codeId);
    if (!doc) throw new AppError("Promo code not found", 404, ErrorCodes.NOT_FOUND);
    await loadEventForOrganizer(doc.eventId.toString(), organizerUserId, role);

    if (updates.type != null && updates.value != null) {
      validateValueRange(updates.type, updates.value);
    } else if (updates.value != null) {
      validateValueRange(doc.type, updates.value);
    }

    const validFrom = updates.validFrom ?? doc.validFrom;
    const validUntil = updates.validUntil ?? doc.validUntil;
    if (validFrom >= validUntil) {
      throw new AppError("validFrom must be before validUntil", 400, ErrorCodes.VALIDATION_ERROR);
    }

    Object.assign(doc, { ...updates, usedCount: doc.usedCount });
    await doc.save();
    return doc;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to update promo code", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function deleteCode(codeId: string, organizerUserId: string, role: Role) {
  try {
    const doc = await PromoCode.findById(codeId);
    if (!doc) throw new AppError("Promo code not found", 404, ErrorCodes.NOT_FOUND);
    await loadEventForOrganizer(doc.eventId.toString(), organizerUserId, role);
    await doc.deleteOne();
    return { deleted: true, hadUses: doc.usedCount > 0 };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to delete promo code", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function validateCode(
  code: string,
  eventId: string,
  segmentId: string,
  unitPrice: number,
  quantity: number,
  options?: { userId?: string; guestEmail?: string; serviceFeeRate?: number }
): Promise<ValidateCodeResult> {
  const normalized = normalizePromoCode(code);
  const subtotal = Math.max(0, unitPrice * quantity);
  const feeRate = options?.serviceFeeRate ?? 0.05;
  const serviceFee = Math.round(subtotal * feeRate);
  const grossTotal = subtotal + serviceFee;

  const eventRef = mongoose.isValidObjectId(eventId)
    ? new mongoose.Types.ObjectId(eventId)
    : eventId;
  const doc = await PromoCode.findOne({ code: normalized, eventId: eventRef });
  if (!doc) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Invalid promo code" };
  }

  const now = new Date();
  if (!doc.isActive) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Code is inactive" };
  }
  if (now < doc.validFrom) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Code is not active yet" };
  }
  if (now > doc.validUntil) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Code has expired" };
  }
  if (doc.maxUses > 0 && doc.usedCount >= doc.maxUses) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Code usage limit reached" };
  }
  if (!segmentAllowed(doc, segmentId)) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Code not valid for this segment" };
  }

  const userUses = await countUserUses(normalized, doc.eventId, options?.userId, options?.guestEmail);
  if (userUses >= doc.perUserLimit) {
    return { valid: false, discountAmount: 0, finalPrice: grossTotal, message: "Per-user limit reached" };
  }

  const discountAmount = calculateDiscount(doc.type, doc.value, unitPrice, quantity);
  const finalPrice = Math.max(0, grossTotal - discountAmount);

  return {
    valid: true,
    type: doc.type,
    value: doc.value,
    discountAmount,
    finalPrice,
    code: doc.code,
    message: "Code applied",
  };
}

export async function applyCode(code: string, eventId: string) {
  const normalized = normalizePromoCode(code);
  const eventRef = mongoose.isValidObjectId(eventId)
    ? new mongoose.Types.ObjectId(eventId)
    : eventId;
  return PromoCode.findOneAndUpdate(
    { code: normalized, eventId: eventRef },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
}

export async function revertCode(code: string, eventId: string) {
  const normalized = normalizePromoCode(code);
  await PromoCode.findOneAndUpdate(
    { code: normalized, eventId, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  );
}

export async function getCodesByEvent(eventId: string, organizerUserId: string, role: Role) {
  try {
    await loadEventForOrganizer(eventId, organizerUserId, role);
    const codes = await PromoCode.find({ eventId: toObjectId(eventId) })
      .select(
        "code type value maxUses usedCount perUserLimit validFrom validUntil isActive segmentIds eventId"
      )
      .sort({ createdAt: -1 })
      .lean();
    return codes.map((c) => ({
      _id: String(c._id),
      code: c.code,
      type: c.type,
      value: c.value,
      maxUses: c.maxUses,
      usedCount: c.usedCount,
      perUserLimit: c.perUserLimit,
      validFrom: c.validFrom,
      validUntil: c.validUntil,
      isActive: c.isActive,
      segmentIds: c.segmentIds ?? [],
      isPlatformWide: false,
      status: promoStatusLabel(c),
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to list promo codes", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function getCodeStats(codeId: string, organizerUserId: string, role: Role) {
  try {
    const doc = await PromoCode.findById(codeId);
    if (!doc) throw new AppError("Promo code not found", 404, ErrorCodes.NOT_FOUND);
    await loadEventForOrganizer(doc.eventId.toString(), organizerUserId, role);

    const orders = await Order.find({
      eventId: doc.eventId,
      coupon: doc.code,
    }).select("discount paymentStatus");

    return {
      code: doc,
      status: promoStatusLabel(doc),
      ...formatCodeStats(doc, orders),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to load promo stats", 500, ErrorCodes.INTERNAL_ERROR);
  }
}
