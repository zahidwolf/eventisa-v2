import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "@/modules/notifications/types/notification.types.js";

export interface NotificationDocument extends Document {
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  attempts: number;
  lastError?: string;
  scheduledAt: Date;
  sentAt?: Date;
}

const schema = new Schema<NotificationDocument>(
  {
    type: { type: String, enum: Object.values(NotificationType), required: true },
    channel: { type: String, enum: Object.values(NotificationChannel), required: true },
    recipient: { type: String, required: true, index: true },
    subject: String,
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.Queued },
    attempts: { type: Number, default: 0 },
    lastError: String,
    scheduledAt: { type: Date, default: Date.now },
    sentAt: Date,
  },
  { timestamps: true }
);

export const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ?? mongoose.model("Notification", schema);
