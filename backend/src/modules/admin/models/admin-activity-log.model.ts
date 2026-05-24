import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AdminActivityLogDocument extends Document {
  adminId: string;
  adminName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const schema = new Schema<AdminActivityLogDocument>(
  {
    adminId: { type: String, required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: String,
    targetId: String,
    targetName: String,
    meta: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ createdAt: -1 });
schema.index({ adminId: 1, createdAt: -1 });

export const AdminActivityLog: Model<AdminActivityLogDocument> =
  mongoose.models.AdminActivityLog ??
  mongoose.model<AdminActivityLogDocument>("AdminActivityLog", schema);
