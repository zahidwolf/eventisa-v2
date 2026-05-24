import { Schema } from "mongoose";
import type { EventUniversityInfo } from "@/modules/events/types/university.types.js";

export const eventUniversitySchema = new Schema<EventUniversityInfo>(
  {
    eventType: String,
    universityName: String,
    department: String,
    clubName: String,
    batch: String,
    session: String,
    studentOnly: { type: Boolean, default: false },
    requiresStudentId: { type: Boolean, default: false },
    allowedEmailDomains: { type: [String], default: [] },
  },
  { _id: false }
);
