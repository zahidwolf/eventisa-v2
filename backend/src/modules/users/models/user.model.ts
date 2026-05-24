import mongoose, { Schema, type Document, type Model } from "mongoose";
import { Role } from "@/shared/enums/role.enum.js";
import { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";
import { UserStatus, type IUser } from "@/modules/users/types/user.types.js";

export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: string;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.User,
    },
    staffRole: {
      type: String,
      enum: Object.values(AdminStaffRole),
    },
    dateOfBirth: { type: Date },
    gender: { type: String, trim: true },
    isVerified: { type: Boolean, default: true },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiry: { type: Date, select: false },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.Active,
    },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ status: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", userSchema);
