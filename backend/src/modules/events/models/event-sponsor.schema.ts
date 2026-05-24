import { Schema } from "mongoose";
import { SponsorTier, type EventSponsor } from "@/modules/events/types/university.types.js";

export const eventSponsorSchema = new Schema<EventSponsor>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    tier: { type: String, enum: Object.values(SponsorTier), required: true },
    websiteUrl: String,
    order: { type: Number, default: 0 },
  },
  { _id: true }
);
