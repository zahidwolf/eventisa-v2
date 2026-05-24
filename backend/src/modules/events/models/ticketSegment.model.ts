import { Schema } from "mongoose";
import { randomUUID } from "crypto";
import {
  builderFormFieldSchema,
  type IBuilderFormField,
} from "@/modules/events/models/formField.model.js";

export enum SegmentStatus {
  Draft = "draft",
  Active = "active",
  SoldOut = "soldout",
  Hidden = "hidden",
  Expired = "expired",
}

export enum SegmentVisibility {
  Public = "public",
  Hidden = "hidden",
  Unlisted = "unlisted",
}

export interface ITicketSegment {
  segmentId: string;
  /** Legacy field name */
  title?: string;
  name: string;
  description?: string;
  price: number;
  isFree: boolean;
  capacity: number;
  remainingQuantity: number;
  quantitySold?: number;
  maxPurchasePerUser: number;
  /** Legacy alias */
  maxPurchase?: number;
  minPurchase: number;
  saleStart?: Date;
  saleEnd?: Date;
  visibility: SegmentVisibility;
  /** Legacy alias */
  isVisible?: boolean;
  ticketColor?: string;
  status: SegmentStatus;
  formEnabled?: boolean;
  formFields: IBuilderFormField[];
  benefits?: string[];
  seatType?: string;
}

export const ticketSegmentSchema = new Schema<ITicketSegment>(
  {
    segmentId: { type: String, default: () => randomUUID() },
    title: { type: String, trim: true },
    name: { type: String, trim: true },
    description: { type: String, maxlength: 500 },
    price: { type: Number, required: true, min: 0, default: 0 },
    isFree: { type: Boolean, default: false },
    capacity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, min: 0 },
    quantitySold: { type: Number, default: 0, min: 0 },
    maxPurchasePerUser: { type: Number, default: 10, min: 1 },
    maxPurchase: { type: Number, min: 1 },
    minPurchase: { type: Number, default: 1, min: 1 },
    saleStart: Date,
    saleEnd: Date,
    visibility: {
      type: String,
      enum: Object.values(SegmentVisibility),
      default: SegmentVisibility.Public,
    },
    isVisible: { type: Boolean, default: true },
    ticketColor: String,
    status: {
      type: String,
      enum: Object.values(SegmentStatus),
      default: SegmentStatus.Draft,
    },
    formEnabled: { type: Boolean, default: false },
    formFields: { type: [builderFormFieldSchema], default: [] },
    benefits: { type: [String], default: [] },
    seatType: String,
  },
  { _id: true, timestamps: false }
);

ticketSegmentSchema.pre("save", function setRemainingOnCreate() {
  if (this.isNew && (this.remainingQuantity == null || this.remainingQuantity === undefined)) {
    this.remainingQuantity = this.capacity;
  }
  if (!this.name && this.title) this.name = this.title;
  if (!this.title && this.name) this.title = this.name;
  if (this.maxPurchasePerUser == null && this.maxPurchase != null) {
    this.maxPurchasePerUser = this.maxPurchase;
  }
  if (this.maxPurchase == null && this.maxPurchasePerUser != null) {
    this.maxPurchase = this.maxPurchasePerUser;
  }
  if (this.isVisible == null) {
    this.isVisible = this.visibility !== SegmentVisibility.Hidden;
  }
});
