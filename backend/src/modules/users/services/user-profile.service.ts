import bcrypt from "bcryptjs";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";
import { User } from "@/modules/users/models/user.model.js";
import { userOrderMatch } from "@/modules/users/utils/user-order-filter.util.js";

const SALT_ROUNDS = 12;
const BD_PHONE = /^(\+880|880|0)?1[3-9]\d{8}$/;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isEmailVerified: boolean;
  createdAt: string;
  role: string;
}

function toProfile(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  isVerified?: boolean;
  role: string;
  createdAt: Date;
}): UserProfile {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10),
    gender: user.gender,
    isEmailVerified: user.isVerified ?? false,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await User.findById(userId)
    .select("name email phone dateOfBirth gender isVerified role createdAt")
    .lean();
  if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  return toProfile(user);
}

export async function updateUserProfile(
  userId: string,
  input: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  }
) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);

  if (input.name) user.name = input.name.trim();
  if (input.phone !== undefined) {
    const phone = input.phone.trim();
    if (phone && !BD_PHONE.test(phone.replace(/[\s-]/g, ""))) {
      throw new AppError("Invalid Bangladesh phone number", 400, ErrorCodes.VALIDATION_ERROR);
    }
    user.phone = phone || undefined;
  }
  if (input.dateOfBirth !== undefined) {
    user.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : undefined;
  }
  if (input.gender !== undefined) user.gender = input.gender || undefined;

  await user.save();
  return getUserProfile(userId);
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await User.findById(userId).select("+password");
  if (!user?.password) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400, ErrorCodes.VALIDATION_ERROR);
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
}

export async function deleteUserAccount(userId: string, email: string) {
  const now = new Date();
  const upcoming = await Order.aggregate([
    {
      $match: {
        ...userOrderMatch(userId, email),
        paymentStatus: PaymentStatus.Paid,
        orderStatus: { $ne: OrderStatus.Cancelled },
      },
    },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    { $match: { "event.startDate": { $gte: now } } },
    { $limit: 1 },
  ]);

  if (upcoming.length) {
    throw new AppError(
      "You have upcoming events. Contact support to cancel first.",
      400,
      ErrorCodes.CONFLICT
    );
  }

  await User.findByIdAndDelete(userId);
}
