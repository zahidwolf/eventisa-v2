import { Schema } from "mongoose";
import { randomUUID } from "crypto";
import { formFieldSchema, type IFormField } from "@/modules/events/models/event-custom-form.schema.js";
import {
  SegmentStatus,
  SegmentVisibility,
} from "@/modules/events/models/ticketSegment.model.js";

export { SegmentStatus, SegmentVisibility };

export interface ITicketSection {
  segmentId?: string;
  title: string;
  name?: string;
  description?: string;
  price: number;
  isFree: boolean;
  capacity: number;
  remainingQuantity?: number;
  quantitySold: number;
  maxPurchase: number;
  maxPurchasePerUser?: number;
  minPurchase: number;
  benefits: string[];
  isVisible: boolean;
  visibility?: SegmentVisibility;
  saleStart?: Date;
  saleEnd?: Date;
  status: SegmentStatus;
  seatType?: string;
  ticketColor?: string;
  formEnabled: boolean;
  formFields: IFormField[];
}

export const ticketSectionSchema = new Schema<ITicketSection>(
  {
    segmentId: { type: String, default: () => randomUUID() },
    title: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    description: { type: String, maxlength: 500 },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    capacity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, min: 0 },
    quantitySold: { type: Number, default: 0, min: 0 },
    maxPurchase: { type: Number, default: 10, min: 1 },
    maxPurchasePerUser: { type: Number, min: 1 },
    minPurchase: { type: Number, default: 1, min: 1 },
    benefits: { type: [String], default: [] },
    isVisible: { type: Boolean, default: true },
    visibility: {
      type: String,
      enum: Object.values(SegmentVisibility),
      default: SegmentVisibility.Public,
    },
    saleStart: { type: Date },
    saleEnd: { type: Date },
    status: {
      type: String,
      enum: Object.values(SegmentStatus),
      default: SegmentStatus.Active,
    },
    seatType: { type: String },
    ticketColor: { type: String },
    formEnabled: { type: Boolean, default: false },
    formFields: { type: [formFieldSchema], default: [] },
  },
  { _id: true, timestamps: false }
);

ticketSectionSchema.pre("validate", function syncSegmentFields() {
  if (!this.name && this.title) this.name = this.title;
  if (!this.title && this.name) this.title = this.name;
  if (this.maxPurchasePerUser == null) this.maxPurchasePerUser = this.maxPurchase;
  if (this.maxPurchase == null) this.maxPurchase = this.maxPurchasePerUser ?? 10;
  if (this.remainingQuantity == null) {
    this.remainingQuantity = Math.max(0, this.capacity - (this.quantitySold ?? 0));
  }
  if (this.visibility === SegmentVisibility.Hidden) this.isVisible = false;
  else if (this.visibility === SegmentVisibility.Public && this.isVisible !== false) {
    this.isVisible = true;
  }
});
