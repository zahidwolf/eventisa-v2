import mongoose from "mongoose";
import { User } from "@/modules/users/models/user.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Role } from "@/shared/enums/role.enum.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";

const USER_ROLES = [Role.User, Role.Organizer];

export async function listAdminUsersSlim(query: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = { role: { $in: USER_ROLES } };
  if (query.search?.trim()) {
    const re = { $regex: query.search.trim(), $options: "i" };
    match.$or = [{ name: re }, { email: re }];
  }

  const [userRows, total] = await Promise.all([
    User.find(match)
      .select("name email role status createdAt isVerified phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(match),
  ]);

  if (!userRows.length) {
    return { users: [], page, limit, total };
  }

  const userIds = userRows.map((u) => u._id);
  const orderAgg = await Order.aggregate<{
    _id: mongoose.Types.ObjectId;
    totalOrders: number;
    totalSpent: number;
  }>([
    {
      $match: {
        userId: { $in: userIds },
        paymentStatus: PaymentStatus.Paid,
      },
    },
    {
      $group: {
        _id: "$userId",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
      },
    },
  ]);
  const statsMap = new Map(orderAgg.map((r) => [r._id.toString(), r]));

  const users = userRows.map((u) => {
    const stats = statsMap.get(u._id.toString());
    return {
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      isEmailVerified: u.isVerified,
      totalOrders: stats?.totalOrders ?? 0,
      totalSpent: stats?.totalSpent ?? 0,
    };
  });

  return { users, page, limit, total };
}

export async function getAdminUserDetail(userId: string) {
  const user = await User.findById(userId)
    .select("name email role status createdAt isVerified phone")
    .lean();
  if (!user || (user.role !== Role.User && user.role !== Role.Organizer)) {
    return null;
  }

  const uid = user._id as mongoose.Types.ObjectId;
  const [statsRow, recentOrders] = await Promise.all([
    Order.aggregate<{ totalOrders: number; totalSpent: number }>([
      { $match: { userId: uid, paymentStatus: PaymentStatus.Paid } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { userId: uid } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "ev",
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      {
        $project: {
          _id: 1,
          amount: "$total",
          status: "$paymentStatus",
          createdAt: 1,
          eventTitle: { $arrayElemAt: ["$ev.title", 0] },
        },
      },
    ]),
  ]);

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    isEmailVerified: user.isVerified,
    phone: user.phone,
    totalOrders: statsRow[0]?.totalOrders ?? 0,
    totalSpent: statsRow[0]?.totalSpent ?? 0,
    recentOrders: recentOrders.map((o) => ({
      _id: String(o._id),
      eventTitle: o.eventTitle ?? "—",
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    })),
  };
}
