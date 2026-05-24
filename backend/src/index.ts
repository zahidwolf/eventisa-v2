import { createApp } from "@/app.js";
import { connectDatabase } from "@/config/database.js";
import { logger } from "@/config/logger.js";
import { startServer } from "@/server.js";
import { cleanupExpiredReservations } from "@/modules/tickets/services/ticket-reservation.service.js";
import { verifyConnection } from "@/shared/email/email.service.js";
import { startEventReminderJob } from "@/jobs/eventReminder.job.js";

const CLEANUP_INTERVAL_MS = 60 * 1000;

async function bootstrap() {
  try {
    await connectDatabase();
    void verifyConnection();
    startEventReminderJob();
    const app = createApp();
    startServer(app);

    // TODO: Replace with dedicated cron worker in production
    setInterval(() => {
      cleanupExpiredReservations().catch((err) =>
        logger.error("Reservation cleanup failed", err)
      );
    }, CLEANUP_INTERVAL_MS);
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

bootstrap();
