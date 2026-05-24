import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AttendeeSubmissionDocument extends Document {
  orderId: string;
  eventId: mongoose.Types.ObjectId;
  segmentId: string;
  userId?: mongoose.Types.ObjectId;
  answers: Record<string, unknown>;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attendeeSubmissionSchema = new Schema<AttendeeSubmissionDocument>(
  {
    orderId: { type: String, required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    segmentId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    answers: { type: Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendeeSubmissionSchema.index({ eventId: 1, segmentId: 1 });
attendeeSubmissionSchema.index({ eventId: 1, submittedAt: -1 });

export const AttendeeSubmission: Model<AttendeeSubmissionDocument> =
  mongoose.models.AttendeeSubmission ??
  mongoose.model<AttendeeSubmissionDocument>("AttendeeSubmission", attendeeSubmissionSchema);
