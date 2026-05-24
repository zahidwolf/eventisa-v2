import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AuditLogDocument extends Document {
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const schema = new Schema<AuditLogDocument>(
  {
    actorId: String,
    actorEmail: String,
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: String,
    metadata: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ createdAt: -1 });

export const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog ?? mongoose.model<AuditLogDocument>("AuditLog", schema);
