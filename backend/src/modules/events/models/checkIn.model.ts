import mongoose, { Schema, type Document, type Model } from "mongoose";

export enum CheckInRecordStatus {
  Success = "success",
  AlreadyCheckedIn = "already_checked_in",
  Invalid = "invalid",
  NotFound = "not_found",
}

export interface CheckInDocument extends Document {
  ticketId: string;
  orderId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  segmentId: string;
  userId?: mongoose.Types.ObjectId;
  scannedAt: Date;
  scannedBy: mongoose.Types.ObjectId;
  status: CheckInRecordStatus;
  deviceId?: string;
  attendeeName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const checkInSchema = new Schema<CheckInDocument>(
  {
    ticketId: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    segmentId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    scannedAt: { type: Date, required: true, default: Date.now },
    scannedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(CheckInRecordStatus),
      required: true,
    },
    deviceId: String,
    attendeeName: String,
  },
  { timestamps: true }
);

checkInSchema.index({ eventId: 1, ticketId: 1 }, { unique: true });
checkInSchema.index({ eventId: 1, segmentId: 1 });
checkInSchema.index({ eventId: 1, createdAt: -1 });

export const CheckIn: Model<CheckInDocument> =
  mongoose.models.CheckIn ?? mongoose.model<CheckInDocument>("CheckIn", checkInSchema);
