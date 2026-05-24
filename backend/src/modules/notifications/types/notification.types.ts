export enum NotificationChannel {
  Email = "email",
  Sms = "sms",
}

export enum NotificationType {
  BookingConfirmation = "booking_confirmation",
  TicketDelivery = "ticket_delivery",
  EventReminder = "event_reminder",
  EventApproved = "event_approved",
  EventRejected = "event_rejected",
  RefundProcessed = "refund_processed",
}

export enum NotificationStatus {
  Queued = "queued",
  Processing = "processing",
  Sent = "sent",
  Failed = "failed",
}
