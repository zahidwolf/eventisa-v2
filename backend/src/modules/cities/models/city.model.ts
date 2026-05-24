import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CityDocument extends Document {
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<CityDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const City: Model<CityDocument> =
  mongoose.models.City ?? mongoose.model<CityDocument>("City", schema);
