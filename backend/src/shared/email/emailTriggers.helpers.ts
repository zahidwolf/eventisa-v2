import mongoose from "mongoose";
import { getFrontendUrl } from "@/shared/email/email.config.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { OrderStatus } from "@/modules/orders/types/order.types.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { User } from "@/modules/users/models/user.model.js";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
});

export function formatEventDate(d: Date): string {
  return dateFmt.format(d);
}

export function formatEventTime(d: Date): string {
  return timeFmt.format(d);
}

export function shortOrderId(order: { _id: mongoose.Types.ObjectId; orderId?: string }): string {
  if (order.orderId) return order.orderId.slice(-8).toUpperCase();
  return order._id.toString().slice(-8).toUpperCase();
}

export function ticketOrderUrl(order: { _id: mongoose.Types.ObjectId; orderId?: string }): string {
  const base = getFrontendUrl();
  const id = order.orderId ?? order._id.toString();
  return `${base}/checkout/success?orderId=${encodeURIComponent(id)}`;
}

export function eventVenueLabel(venue?: { name?: string }): string {
  if (!venue?.name?.trim()) return "Online";
  return venue.name;
}

export async function loadOrderContext(orderId: string) {
  const query = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderId };
  const order = await Order.findOne(query);
  if (!order) return null;

  const event = await Event.findById(order.eventId);
  if (!event) return null;

  const item = order.ticketItems[0];
  return { order, event, item };
}

export async function loadOrganizerUser(organizerId: mongoose.Types.ObjectId | string) {
  const organizer = await Organizer.findById(organizerId);
  if (!organizer) return null;
  const user = await User.findById(organizer.userId);
  if (!user?.email) return null;
  return { organizer, user, email: user.email, name: user.name || organizer.businessName };
}

export async function confirmedOrdersForEvent(eventId: string) {
  return Order.find({
    eventId,
    orderStatus: OrderStatus.Confirmed,
  }).select("guestEmail guestName userId ticketItems _id orderId");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendInBatches<T>(
  items: T[],
  sendOne: (item: T) => Promise<void>,
  batchSize = 20,
  delayMs = 1000
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => sendOne(item)));
    if (i + batchSize < items.length) await sleep(delayMs);
  }
}
