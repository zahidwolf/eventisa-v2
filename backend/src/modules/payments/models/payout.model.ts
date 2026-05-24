import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PayoutStatus, type BankingSnapshot } from "@/modules/payments/types/payout.types.js";
import { DEFAULT_CURRENCY } from "@/shared/constants/booking.constants.js";

export interface PayoutDocument extends Document {
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  organizationName: string;
  eventIds: mongoose.Types.ObjectId[];
  eventTitles: string[];
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: PayoutStatus;
  requestNote?: string;
  rejectionReason?: string;
  bankingSnapshot: BankingSnapshot;
  requestedAt: Date;
  reviewedAt?: Date;
  paidAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  txRef?: string;
  paymentMethod?: string;
  paymentNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bankingSnapshotSchema = new Schema<BankingSnapshot>(
  {
    preferredMethod: String,
    bankName: String,
    accountNumber: String,
    accountName: String,
    branchName: String,
    routingNumber: String,
    bkashNumber: String,
    nagadNumber: String,
    rocketNumber: String,
  },
  { _id: false }
);

const payoutSchema = new Schema<PayoutDocument>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: "Organizer", required: true, index: true },
    organizerName: { type: String, required: true, trim: true },
    organizationName: { type: String, required: true, trim: true },
    eventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    eventTitles: [String],
    grossAmount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.Pending,
      index: true,
    },
    requestNote: { type: String, trim: true, maxlength: 500 },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    bankingSnapshot: { type: bankingSnapshotSchema, required: true },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    paidAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedByName: String,
    txRef: String,
    paymentMethod: String,
    paymentNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

payoutSchema.index({ organizerId: 1, status: 1 });
payoutSchema.index({ organizerId: 1, requestedAt: -1 });
payoutSchema.index({ status: 1, requestedAt: -1 });
payoutSchema.index({ reviewedBy: 1 });
payoutSchema.index({ eventIds: 1 });

export const Payout: Model<PayoutDocument> =
  mongoose.models.Payout ?? mongoose.model<PayoutDocument>("Payout", payoutSchema);
