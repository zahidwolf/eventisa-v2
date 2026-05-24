import { logger } from "@/config/logger.js";
import { Notification } from "@/modules/notifications/models/notification.model.js";
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "@/modules/notifications/types/notification.types.js";

export async function enqueueNotification(input: {
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  payload?: Record<string, unknown>;
}) {
  return Notification.create({
    ...input,
    payload: input.payload ?? {},
    status: NotificationStatus.Queued,
    scheduledAt: new Date(),
  });
}

/** Queue-ready — wire to Bull/Redis later */
export async function processNotificationQueue(limit = 25) {
  const jobs = await Notification.find({
    status: NotificationStatus.Queued,
    scheduledAt: { $lte: new Date() },
  })
    .limit(limit);

  for (const job of jobs) {
    job.status = NotificationStatus.Processing;
    job.attempts += 1;
    await job.save();
    logger.info(`[Notify:${job.channel}] ${job.type} → ${job.recipient}`, { subject: job.subject });
    job.status = NotificationStatus.Sent;
    job.sentAt = new Date();
    await job.save();
  }
  return { processed: jobs.length };
}

export function notifyBookingConfirmation(p: { email: string; orderId: string; eventTitle: string }) {
  return enqueueNotification({
    type: NotificationType.BookingConfirmation,
    channel: NotificationChannel.Email,
    recipient: p.email,
    subject: `Confirmed — ${p.eventTitle}`,
    payload: p,
  });
}

export function notifyTicketDelivery(p: { email: string; eventTitle: string; ticketNumbers: string[] }) {
  return enqueueNotification({
    type: NotificationType.TicketDelivery,
    channel: NotificationChannel.Email,
    recipient: p.email,
    subject: `Tickets — ${p.eventTitle}`,
    payload: p,
  });
}
