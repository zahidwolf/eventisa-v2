import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PaymentGatewayProvider } from "@/modules/payments/types/gateway.types.js";

export interface PaymentGatewayDocument extends Document {
  name: string;
  provider: PaymentGatewayProvider;
  displayName: string;
  logo?: string;
  isActive: boolean;
  isDefault: boolean;
  credentials: Record<string, unknown>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentGatewaySchema = new Schema<PaymentGatewayDocument>(
  {
    name: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: Object.values(PaymentGatewayProvider),
      required: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true },
    logo: String,
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false, index: true },
    credentials: { type: Schema.Types.Mixed, required: true, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

paymentGatewaySchema.index({ isDefault: 1, isActive: 1 });

export const PaymentGateway: Model<PaymentGatewayDocument> =
  mongoose.models.PaymentGateway ??
  mongoose.model<PaymentGatewayDocument>("PaymentGateway", paymentGatewaySchema);
