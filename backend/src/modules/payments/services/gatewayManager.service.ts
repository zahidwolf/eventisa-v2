import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import {
  PaymentGateway,
  type PaymentGatewayDocument,
} from "@/modules/payments/models/paymentGateway.model.js";
import {
  PaymentGatewayProvider,
  type GatewayPublicInfo,
} from "@/modules/payments/types/gateway.types.js";
import { paymentConfig } from "@/config/payment.config.js";
import { PaymentProviderName } from "@/modules/payments/types/payment.types.js";

export interface CreateGatewayInput {
  name: string;
  provider: PaymentGatewayProvider;
  displayName: string;
  logo?: string;
  isActive?: boolean;
  isDefault?: boolean;
  credentials: Record<string, unknown>;
}

function toPublicInfo(gw: PaymentGatewayDocument): GatewayPublicInfo {
  return {
    displayName: gw.displayName,
    logo: gw.logo,
    provider: gw.provider,
    isDefault: gw.isDefault,
  };
}

function envFallbackGateway(): PaymentGatewayDocument {
  const ssl = paymentConfig.providers.sslcommerz;
  return {
    _id: new mongoose.Types.ObjectId(),
    name: "Platform SSLCommerz (env)",
    provider: PaymentGatewayProvider.Sslcommerz,
    displayName: "SSLCommerz",
    isActive: true,
    isDefault: true,
    credentials: {
      storeId: ssl.storeId,
      storePass: ssl.storePassword,
      sandbox: paymentConfig.mode !== "live",
    },
    createdBy: new mongoose.Types.ObjectId(),
  } as unknown as PaymentGatewayDocument;
}

export async function createGateway(adminId: string, data: CreateGatewayInput) {
  if (data.isDefault) {
    await PaymentGateway.updateMany({ isDefault: true }, { $set: { isDefault: false } });
  }
  return PaymentGateway.create({
    ...data,
    isActive: data.isActive ?? true,
    isDefault: data.isDefault ?? false,
    createdBy: adminId,
  });
}

export async function updateGateway(
  gatewayId: string,
  _adminId: string,
  updates: Partial<CreateGatewayInput>
) {
  const gw = await PaymentGateway.findById(gatewayId);
  if (!gw) throw new AppError("Gateway not found", 404, ErrorCodes.NOT_FOUND);

  if (updates.isDefault) {
    await PaymentGateway.updateMany({ _id: { $ne: gw._id }, isDefault: true }, { $set: { isDefault: false } });
  }

  Object.assign(gw, updates);
  if (updates.credentials) gw.credentials = updates.credentials;
  await gw.save();
  return gw;
}

export async function deleteGateway(gatewayId: string, _adminId: string) {
  const inUse = await Event.countDocuments({
    paymentGatewayId: gatewayId,
    status: EventStatus.Live,
  });
  if (inUse > 0) {
    throw new AppError(
      "Cannot delete: gateway is assigned to published live events",
      400,
      ErrorCodes.CONFLICT
    );
  }
  const gw = await PaymentGateway.findByIdAndDelete(gatewayId);
  if (!gw) throw new AppError("Gateway not found", 404, ErrorCodes.NOT_FOUND);
  return gw;
}

export async function getAllGateways() {
  return PaymentGateway.find().sort({ isDefault: -1, createdAt: -1 });
}

export async function setDefaultGateway(gatewayId: string, _adminId: string) {
  const gw = await PaymentGateway.findById(gatewayId);
  if (!gw) throw new AppError("Gateway not found", 404, ErrorCodes.NOT_FOUND);
  await PaymentGateway.updateMany({}, { $set: { isDefault: false } });
  gw.isDefault = true;
  gw.isActive = true;
  await gw.save();
  return gw;
}

export async function assignGatewayToEvent(
  eventId: string,
  gatewayId: string,
  adminId: string
) {
  const gw = await PaymentGateway.findById(gatewayId);
  if (!gw || !gw.isActive) {
    throw new AppError("Gateway not found or inactive", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  event.paymentGatewayId = gw._id as mongoose.Types.ObjectId;
  event.paymentGatewayAssignedBy = new mongoose.Types.ObjectId(adminId);
  event.paymentGatewayAssignedAt = new Date();
  await event.save();
  return { event, gateway: gw };
}

export async function removeGatewayFromEvent(eventId: string, _adminId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  event.paymentGatewayId = undefined;
  event.paymentGatewayAssignedBy = undefined;
  event.paymentGatewayAssignedAt = undefined;
  await event.save();
  return event;
}

export async function getEventGateway(eventId: string): Promise<PaymentGatewayDocument> {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  if (event.paymentGatewayId) {
    const assigned = await PaymentGateway.findById(event.paymentGatewayId);
    if (assigned?.isActive) return assigned;
  }

  const platformDefault = await PaymentGateway.findOne({ isDefault: true, isActive: true });
  if (platformDefault) return platformDefault;

  const anyActive = await PaymentGateway.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (anyActive) return anyActive;

  if (paymentConfig.providers.sslcommerz.storeId) {
    return envFallbackGateway();
  }

  throw new AppError(
    "No payment gateway configured. Add a gateway in admin settings.",
    503,
    ErrorCodes.INTERNAL_ERROR
  );
}

export async function getEventGatewayPublicInfo(eventId: string): Promise<GatewayPublicInfo> {
  const gw = await getEventGateway(eventId);
  return toPublicInfo(gw);
}

export async function getEventGatewayAssignment(eventId: string) {
  const event = await Event.findById(eventId)
    .populate("paymentGatewayId")
    .populate("paymentGatewayAssignedBy", "name email")
    .lean();
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  const assigned = event.paymentGatewayId as unknown as PaymentGatewayDocument | null;
  const defaultGw = await PaymentGateway.findOne({ isDefault: true, isActive: true }).lean();
  const effective = assigned?.isActive
    ? assigned
    : defaultGw ?? (await PaymentGateway.findOne({ isActive: true }).lean());

  return {
    assigned: assigned
      ? {
          id: assigned._id.toString(),
          name: assigned.name,
          displayName: assigned.displayName,
          provider: assigned.provider,
          isDefault: assigned.isDefault,
        }
      : null,
    effective: effective
      ? {
          displayName: effective.displayName,
          provider: effective.provider,
          isDefault: effective.isDefault,
        }
      : null,
    assignedBy: event.paymentGatewayAssignedBy as { name?: string; email?: string } | undefined,
    assignedAt: event.paymentGatewayAssignedAt,
    usesPlatformDefault: !assigned || !assigned.isActive,
  };
}

export function providerNameFromGateway(provider: PaymentGatewayProvider): PaymentProviderName {
  switch (provider) {
    case PaymentGatewayProvider.Bkash:
      return PaymentProviderName.Bkash;
    case PaymentGatewayProvider.Nagad:
      return PaymentProviderName.Nagad;
    default:
      return PaymentProviderName.Sslcommerz;
  }
}

export function paymentMethodFromGateway(provider: PaymentGatewayProvider): string {
  switch (provider) {
    case PaymentGatewayProvider.Bkash:
      return "bkash";
    case PaymentGatewayProvider.Nagad:
      return "nagad";
    default:
      return "card";
  }
}
