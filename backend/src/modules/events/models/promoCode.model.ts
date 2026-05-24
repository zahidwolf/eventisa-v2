import mongoose, { Schema, type Document, type Model } from "mongoose";

export enum PromoCodeType {
  Percentage = "percentage",
  Flat = "flat",
}

export interface PromoCodeDocument extends Document {
  code: string;
  eventId: mongoose.Types.ObjectId;
  segmentIds: string[];
  type: PromoCodeType;
  value: number;
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<PromoCodeDocument>(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    segmentIds: { type: [String], default: [] },
    type: { type: String, enum: Object.values(PromoCodeType), required: true },
    value: { type: Number, required: true, min: 0 },
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

promoCodeSchema.index({ code: 1, eventId: 1 }, { unique: true });
promoCodeSchema.index({ validUntil: 1 });

export const PromoCode: Model<PromoCodeDocument> =
  mongoose.models.PromoCode ?? mongoose.model<PromoCodeDocument>("PromoCode", promoCodeSchema);
