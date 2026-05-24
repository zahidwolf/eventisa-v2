import cron from "node-cron";
import { Event } from "@/modules/events/models/event.model.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { onEventReminder } from "@/shared/email/emailTriggers.service.js";
import { isEmailConfigured } from "@/shared/email/email.config.js";

export function startEventReminderJob(): void {
  if (!isEmailConfigured()) {
    console.log("Event reminder job skipped: SMTP not configured");
    return;
  }

  cron.schedule("0 * * * *", () => {
    void runEventReminders();
  });

  console.log("Event reminder job started");
}

async function runEventReminders(): Promise<void> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const events = await Event.find({
      status: EventStatus.Live,
      reminderEmailSent: { $ne: true },
      startDate: { $gte: windowStart, $lte: windowEnd },
    }).select("_id");

    for (const event of events) {
      await onEventReminder(event._id.toString());
      await Event.updateOne({ _id: event._id }, { reminderEmailSent: true });
    }
  } catch (e) {
    console.error("Event reminder job failed:", e);
  }
}
