import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { getSmtpConfig, isEmailConfigured } from "@/shared/email/email.config.js";
import { uploadConfig } from "@/config/upload.config.js";
import { PaymentGateway } from "@/modules/payments/models/paymentGateway.model.js";
import { getCacheService } from "@/shared/cache/cache.service.js";

async function checkDatabase() {
  const state = mongoose.connection.readyState;
  const connected = state === 1;
  const dbName = mongoose.connection.name || "unknown";
  return {
    status: connected ? "connected" : "error",
    name: dbName,
  };
}

async function checkSmtp() {
  if (!isEmailConfigured()) {
    return { status: "not_configured" as const, from: null };
  }
  try {
    const cfg = getSmtpConfig();
    if (!cfg) return { status: "error" as const, from: null };
    const tx = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await tx.verify();
    return { status: "connected" as const, from: cfg.from };
  } catch {
    return { status: "error" as const, from: null };
  }
}

function checkCloudinary() {
  const { cloudName } = uploadConfig.cloudinary;
  const configured = Boolean(cloudName && uploadConfig.provider === "cloudinary");
  return {
    status: configured ? ("configured" as const) : ("not_set" as const),
    cloudName: cloudName || null,
  };
}

async function checkPayments() {
  const gateways = await PaymentGateway.find({ isActive: true })
    .select("displayName provider isDefault")
    .lean();
  const defaultGw = gateways.find((g) => g.isDefault) ?? gateways[0];
  return {
    activeGateways: gateways.length,
    defaultGateway: defaultGw?.displayName ?? defaultGw?.provider ?? null,
  };
}

export async function getSystemHealth() {
  const [database, email, payment] = await Promise.all([
    checkDatabase(),
    checkSmtp(),
    checkPayments(),
  ]);

  const cache = getCacheService();

  return {
    database,
    email,
    cloudinary: checkCloudinary(),
    payment,
    cache: { status: "ok", keys: cache.keys().length },
    uptime: Math.floor(process.uptime()),
  };
}
