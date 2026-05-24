import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  PaymentMethod,
  PaymentProviderName,
  PaymentRecordStatus,
} from "@/modules/payments/types/payment.types.js";

export interface PaymentDocument extends Document {
  paymentId: string;
  orderId: mongoose.Types.ObjectId;
  orderRef: string;
  sessionId: string;
  provider: PaymentProviderName;
  method: PaymentMethod;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  gatewayPayload: Record<string, unknown>;
  verificationPayload: Record<string, unknown>;
  paidAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderRef: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    provider: { type: String, enum: Object.values(PaymentProviderName), required: true },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    transactionId: { type: String, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: {
      type: String,
      enum: Object.values(PaymentRecordStatus),
      default: PaymentRecordStatus.Initiated,
      index: true,
    },
    gatewayPayload: { type: Schema.Types.Mixed, default: {} },
    verificationPayload: { type: Schema.Types.Mixed, default: {} },
    paidAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

export const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ?? mongoose.model<PaymentDocument>("Payment", paymentSchema);
