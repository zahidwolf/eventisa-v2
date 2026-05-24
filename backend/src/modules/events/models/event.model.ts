import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  EventApprovalStatus,
  EventStatus,
  type EventMetaPixel,
  type EventSeo,
  type EventVenue,
} from "@/modules/events/types/event.types.js";
import { ticketSectionSchema, type ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
import {
  eventCustomFormSchema,
  type IEventCustomForm,
} from "@/modules/events/models/event-custom-form.schema.js";
import { eventUniversitySchema } from "@/modules/events/models/event-university.schema.js";
import { eventSponsorSchema } from "@/modules/events/models/event-sponsor.schema.js";
import type { EventUniversityInfo, EventSponsor } from "@/modules/events/types/university.types.js";

export interface EventDocument extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage?: string;
  coverImagePublicId?: string;
  videoThumbnail?: string;
  category: string;
  university?: EventUniversityInfo;
  sponsors: EventSponsor[];
  tags: string[];
  venue: EventVenue;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  registrationStart?: Date;
  registrationEnd?: Date;
  ticketSections: ITicketSection[];
  capacity: number;
  status: EventStatus;
  seo: EventSeo;
  metaPixel: EventMetaPixel;
  organizer: mongoose.Types.ObjectId;
  approvalStatus: EventApprovalStatus;
  customForm: IEventCustomForm;
  featured: boolean;
  trending: boolean;
  homepagePriority: number;
  listingRank: number;
  rejectionReason?: string;
  changesRequested?: string;
  paymentGatewayId?: mongoose.Types.ObjectId;
  paymentGatewayAssignedBy?: mongoose.Types.ObjectId;
  paymentGatewayAssignedAt?: Date;
  reminderEmailSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<EventVenue>(
  {
    name: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    country: { type: String, required: true, default: "Bangladesh" },
    mapUrl: String,
  },
  { _id: false }
);

const seoSchema = new Schema<EventSeo>(
  {
    title: String,
    description: String,
    keywords: [String],
  },
  { _id: false }
);

const metaPixelSchema = new Schema<EventMetaPixel>(
  {
    pixelId: String,
    googleAnalyticsId: String,
    enabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true },
    coverImage: String,
    coverImagePublicId: String,
    videoThumbnail: String,
    category: { type: String, required: true, index: true },
    university: { type: eventUniversitySchema, default: {} },
    sponsors: { type: [eventSponsorSchema], default: [] },
    tags: { type: [String], default: [] },
    venue: { type: venueSchema, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, default: "Bangladesh" },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    registrationStart: { type: Date, index: true },
    registrationEnd: { type: Date, index: true },
    ticketSections: { type: [ticketSectionSchema], default: [] },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.Draft,
    },
    seo: { type: seoSchema, default: {} },
    metaPixel: { type: metaPixelSchema, default: { enabled: false } },
    organizer: { type: Schema.Types.ObjectId, ref: "Organizer", required: true, index: true },
    approvalStatus: {
      type: String,
      enum: Object.values(EventApprovalStatus),
      default: EventApprovalStatus.Pending,
    },
    customForm: { type: eventCustomFormSchema, default: { enabled: false, fields: [] } },
    featured: { type: Boolean, default: false, index: true },
    trending: { type: Boolean, default: false, index: true },
    homepagePriority: { type: Number, default: 0, index: true },
    listingRank: { type: Number, default: 0, index: true },
    rejectionReason: String,
    changesRequested: String,
    paymentGatewayId: { type: Schema.Types.ObjectId, ref: "PaymentGateway" },
    paymentGatewayAssignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paymentGatewayAssignedAt: Date,
    reminderEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ status: 1, approvalStatus: 1, listingRank: -1, homepagePriority: -1, startDate: 1 });
eventSchema.index({ approvalStatus: 1, createdAt: -1 });
eventSchema.index({ status: 1, approvalStatus: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ organizer: 1, startDate: -1 });
eventSchema.index({ organizer: 1, approvalStatus: 1 });

export const Event: Model<EventDocument> =
  mongoose.models.Event ?? mongoose.model<EventDocument>("Event", eventSchema);
