import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface HeroBannerDocument extends Document {
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<HeroBannerDocument>(
  {
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    ctaText: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const HeroBanner: Model<HeroBannerDocument> =
  mongoose.models.HeroBanner ?? mongoose.model<HeroBannerDocument>("HeroBanner", schema);
