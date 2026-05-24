import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface TeamMemberDocument extends Document {
  name: string;
  designation: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<TeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    designation: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    imageUrl: { type: String, required: true, trim: true },
    imagePublicId: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const TeamMember: Model<TeamMemberDocument> =
  mongoose.models.TeamMember ?? mongoose.model<TeamMemberDocument>("TeamMember", schema);
