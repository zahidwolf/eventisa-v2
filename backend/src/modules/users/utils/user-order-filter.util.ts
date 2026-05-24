import mongoose from "mongoose";

export function userOrderMatch(userId: string, email: string) {
  return {
    $or: [
      { userId: new mongoose.Types.ObjectId(userId) },
      { guestEmail: email.toLowerCase() },
    ],
  };
}
