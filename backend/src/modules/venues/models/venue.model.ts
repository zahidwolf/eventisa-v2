import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface VenueDocument extends Document {
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  image?: string;
  googleMapsUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<VenueDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    capacity: { type: Number, min: 0 },
    image: { type: String, trim: true },
    googleMapsUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

schema.index({ name: 1, city: 1 });

export const Venue: Model<VenueDocument> =
  mongoose.models.Venue ?? mongoose.model<VenueDocument>("Venue", schema);
