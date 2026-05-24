import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface HomepageConfigDocument extends Document {
  heroBanners: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaLabel?: string;
    ctaHref?: string;
    order: number;
    active: boolean;
  }[];
  featuredEventIds: mongoose.Types.ObjectId[];
  trendingEventIds: mongoose.Types.ObjectId[];
  categoryVisibility: { slug: string; visible: boolean; order: number }[];
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const schema = new Schema<HomepageConfigDocument>(
  {
    heroBanners: {
      type: [
        {
          title: String,
          subtitle: String,
          imageUrl: String,
          ctaLabel: String,
          ctaHref: String,
          order: Number,
          active: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    featuredEventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    trendingEventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    categoryVisibility: {
      type: [{ slug: String, visible: Boolean, order: Number }],
      default: [],
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const HomepageConfig: Model<HomepageConfigDocument> =
  mongoose.models.HomepageConfig ??
  mongoose.model<HomepageConfigDocument>("HomepageConfig", schema);
