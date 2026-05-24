"use client";

import { motion } from "framer-motion";
import { CoverImage } from "@/components/media/cover-image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import type { Ticket as TicketType } from "@/types/models/order";
import { env } from "@/config/env";

interface TicketPassProps {
  ticket: TicketType;
}

export function TicketPass({ ticket }: TicketPassProps) {
  const event = ticket.eventId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-b from-surface-elevated to-surface shadow-2xl"
    >
      <div className="relative h-32 bg-brand/20">
        {event.coverImage && (
          <CoverImage src={event.coverImage} alt="" fill className="opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-light">Eventisa</p>
          <h2 className="text-xl font-bold leading-tight">{event.title}</h2>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Intl.DateTimeFormat(env.locale, {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: env.timezone,
          }).format(new Date(event.startDate))}
        </div>
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.venue.name}, {event.venue.city}
          </div>
        )}
        <div className="rounded-xl border border-dashed border-surface-border bg-surface/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="font-semibold">{ticket.sectionTitle}</p>
            </div>
            <Ticket className="h-5 w-5 text-brand" />
          </div>
          <p className="mt-3 text-sm">{ticket.holderName}</p>
          <p className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</p>
          <p className="font-mono text-xs text-muted-foreground">Booking {ticket.bookingId}</p>
        </div>
        <div className="flex justify-center rounded-xl bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ticket.qrCodeData} alt="QR Code" className="h-48 w-48" />
        </div>
      </div>
    </motion.div>
  );
}
