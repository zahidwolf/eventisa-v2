import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AdminRefreshTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const schema = new Schema<AdminRefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AdminRefreshToken: Model<AdminRefreshTokenDocument> =
  mongoose.models.AdminRefreshToken ??
  mongoose.model<AdminRefreshTokenDocument>("AdminRefreshToken", schema);
