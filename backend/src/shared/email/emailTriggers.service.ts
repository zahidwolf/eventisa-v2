import mongoose from "mongoose";
import { sendEmail } from "@/shared/email/email.service.js";
import { getFrontendUrl } from "@/shared/email/email.config.js";
import { ticketConfirmedTemplate } from "@/shared/email/templates/ticket-confirmed.template.js";
import { ticketCancelledTemplate } from "@/shared/email/templates/ticket-cancelled.template.js";
import { ticketRefundedTemplate } from "@/shared/email/templates/ticket-refunded.template.js";
import { eventReminderTemplate } from "@/shared/email/templates/event-reminder.template.js";
import { eventCancelledTemplate } from "@/shared/email/templates/event-cancelled.template.js";
import { organizerApprovedTemplate } from "@/shared/email/templates/organizer-approved.template.js";
import { organizerRejectedTemplate } from "@/shared/email/templates/organizer-rejected.template.js";
import { eventApprovedTemplate } from "@/shared/email/templates/event-approved.template.js";
import { eventRejectedTemplate } from "@/shared/email/templates/event-rejected.template.js";
import { newBookingTemplate } from "@/shared/email/templates/new-booking.template.js";
import {
  confirmedOrdersForEvent,
  eventVenueLabel,
  formatEventDate,
  formatEventTime,
  loadOrderContext,
  loadOrganizerUser,
  sendInBatches,
  shortOrderId,
  ticketOrderUrl,
} from "@/shared/email/emailTriggers.helpers.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import {
  generateOrderTicketsPdf,
  ticketPdfFilename,
} from "@/shared/tickets/ticket-pdf.service.js";
import { shouldNotifyOrganizer } from "@/modules/organizers/utils/organizer-notification.util.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import { payoutRequestedTemplate } from "@/shared/email/templates/payout-requested.template.js";
import { payoutApprovedTemplate } from "@/shared/email/templates/payout-approved.template.js";
import { payoutRejectedTemplate } from "@/shared/email/templates/payout-rejected.template.js";
import { payoutPaidTemplate } from "@/shared/email/templates/payout-paid.template.js";
import { getAdminNotificationEmails } from "@/modules/payments/services/payout.helpers.js";

async function buildTicketPdfAttachment(orderId: string) {
  const ctx = await loadOrderContext(orderId);
  if (!ctx) return null;

  const tickets = await Ticket.find({ orderId: ctx.order._id }).sort({ ticketNumber: 1 });
  if (!tickets.length) return null;

  const pdf = await generateOrderTicketsPdf(ctx.order, ctx.event, tickets);
  return {
    filename: ticketPdfFilename(ctx.order, ctx.event.title),
    content: pdf,
    contentType: "application/pdf",
  };
}

export async function onTicketConfirmed(orderId: string): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;
    const { order, event, item } = ctx;
    const tpl = ticketConfirmedTemplate({
      buyerName: order.guestName,
      eventTitle: event.title,
      eventDate: formatEventDate(event.startDate),
      eventTime: formatEventTime(event.startDate),
      eventVenue: eventVenueLabel(event.venue),
      segmentName: item?.sectionTitle ?? "Ticket",
      quantity: String(item?.quantity ?? 1),
      totalAmount: String(order.total),
      orderId: shortOrderId(order),
      ticketUrl: ticketOrderUrl(order),
    });
    const pdf = await buildTicketPdfAttachment(orderId);
    await sendEmail(order.guestEmail, tpl.subject, tpl.html, pdf ? [pdf] : undefined);
  } catch (e) {
    console.error("onTicketConfirmed email failed:", e);
  }
}

export async function onTicketCancelled(orderId: string, reason?: string): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;
    const { order, event } = ctx;
    const tpl = ticketCancelledTemplate({
      buyerName: order.guestName,
      eventTitle: event.title,
      orderId: shortOrderId(order),
      reason: reason ?? "",
    });
    await sendEmail(order.guestEmail, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onTicketCancelled email failed:", e);
  }
}

export async function onTicketRefunded(orderId: string, refundAmount: number): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;
    const { order, event } = ctx;
    const tpl = ticketRefundedTemplate({
      buyerName: order.guestName,
      eventTitle: event.title,
      orderId: shortOrderId(order),
      refundAmount: String(refundAmount),
      paymentMethod: order.paymentMethod ?? "original payment method",
    });
    await sendEmail(order.guestEmail, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onTicketRefunded email failed:", e);
  }
}

export async function onEventReminder(eventId: string): Promise<void> {
  try {
    const event = await Event.findById(eventId);
    if (!event) return;

    const orders = await confirmedOrdersForEvent(eventId);
    await sendInBatches(orders, async (order) => {
      const item = order.ticketItems[0];
      const tpl = eventReminderTemplate({
        buyerName: order.guestName,
        eventTitle: event.title,
        eventDate: formatEventDate(event.startDate),
        eventTime: formatEventTime(event.startDate),
        eventVenue: eventVenueLabel(event.venue),
        segmentName: item?.sectionTitle ?? "Ticket",
        ticketUrl: ticketOrderUrl(order),
      });
      const pdf = await buildTicketPdfAttachment(String(order._id));
      await sendEmail(order.guestEmail, tpl.subject, tpl.html, pdf ? [pdf] : undefined);
    });
  } catch (e) {
    console.error("onEventReminder email failed:", e);
  }
}

export async function onEventCancelled(eventId: string, refundInfo = ""): Promise<void> {
  try {
    const event = await Event.findById(eventId);
    if (!event) return;

    const orders = await confirmedOrdersForEvent(eventId);
    await sendInBatches(orders, async (order) => {
      const tpl = eventCancelledTemplate({
        buyerName: order.guestName,
        eventTitle: event.title,
        eventDate: formatEventDate(event.startDate),
        refundInfo,
      });
      await sendEmail(order.guestEmail, tpl.subject, tpl.html);
    });
  } catch (e) {
    console.error("onEventCancelled email failed:", e);
  }
}

export async function onOrganizerApproved(organizerId: string): Promise<void> {
  try {
    const org = await loadOrganizerUser(organizerId);
    if (!org) return;
    const tpl = organizerApprovedTemplate({
      organizerName: org.name,
      dashboardUrl: `${getFrontendUrl()}/organizer/dashboard`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onOrganizerApproved email failed:", e);
  }
}

export async function onOrganizerRejected(organizerId: string, reason: string): Promise<void> {
  try {
    const org = await loadOrganizerUser(organizerId);
    if (!org) return;
    const tpl = organizerRejectedTemplate({
      organizerName: org.name,
      reason: reason || "No reason provided",
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onOrganizerRejected email failed:", e);
  }
}

export async function onEventApproved(eventId: string): Promise<void> {
  try {
    const event = await Event.findById(eventId).populate("organizer");
    if (!event) return;
    const org = await loadOrganizerUser(event.organizer as mongoose.Types.ObjectId);
    if (!org) return;
    if (!(await shouldNotifyOrganizer(org.user._id.toString(), "eventApproved"))) return;

    const base = getFrontendUrl();
    const tpl = eventApprovedTemplate({
      organizerName: org.name,
      eventTitle: event.title,
      eventUrl: `${base}/event/${event.slug}`,
      dashboardUrl: `${base}/organizer/events/${event._id.toString()}`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onEventApproved email failed:", e);
  }
}

export async function onEventRejected(eventId: string, reason: string): Promise<void> {
  try {
    const event = await Event.findById(eventId);
    if (!event) return;
    const org = await loadOrganizerUser(event.organizer);
    if (!org) return;
    if (!(await shouldNotifyOrganizer(org.user._id.toString(), "eventRejected"))) return;

    const base = getFrontendUrl();
    const tpl = eventRejectedTemplate({
      organizerName: org.name,
      eventTitle: event.title,
      reason: reason || "Please review admin feedback",
      editUrl: `${base}/organizer/events/${event._id.toString()}/edit`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onEventRejected email failed:", e);
  }
}

function formatPayoutMethod(snapshot?: { preferredMethod?: string }) {
  const m = snapshot?.preferredMethod ?? "bank_transfer";
  return m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function loadPayoutEmailContext(payoutId: string) {
  const payout = await Payout.findById(payoutId);
  if (!payout) return null;
  const org = await loadOrganizerUser(payout.organizerId);
  if (!org) return { payout, org: null };
  return { payout, org };
}

export async function onPayoutRequested(payoutId: string): Promise<void> {
  try {
    const ctx = await loadPayoutEmailContext(payoutId);
    if (!ctx) return;
    const { payout } = ctx;
    const base = getFrontendUrl();
    const tpl = payoutRequestedTemplate({
      organizerName: payout.organizerName,
      organizationName: payout.organizationName,
      amount: String(payout.netAmount),
      eventsCount: String(payout.eventIds.length),
      reviewUrl: `${base}/admin/finance/payouts`,
    });
    const admins = await getAdminNotificationEmails();
    await sendInBatches(admins, async (email) => {
      await sendEmail(email, tpl.subject, tpl.html);
    });
  } catch (e) {
    console.error("onPayoutRequested email failed:", e);
  }
}

export async function onPayoutApproved(payoutId: string): Promise<void> {
  try {
    const ctx = await loadPayoutEmailContext(payoutId);
    if (!ctx?.org) return;
    if (!(await shouldNotifyOrganizer(ctx.org.user._id.toString(), "payoutProcessed"))) return;
    const { payout, org } = ctx;
    const tpl = payoutApprovedTemplate({
      organizerName: org.name,
      amount: String(payout.netAmount),
      method: formatPayoutMethod(payout.bankingSnapshot),
      payoutsUrl: `${getFrontendUrl()}/organizer/payouts`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onPayoutApproved email failed:", e);
  }
}

export async function onPayoutRejected(payoutId: string, reason: string): Promise<void> {
  try {
    const ctx = await loadPayoutEmailContext(payoutId);
    if (!ctx?.org) return;
    if (!(await shouldNotifyOrganizer(ctx.org.user._id.toString(), "payoutRejected"))) return;
    const { payout, org } = ctx;
    const tpl = payoutRejectedTemplate({
      organizerName: org.name,
      amount: String(payout.netAmount),
      reason: reason || "No reason provided",
      payoutsUrl: `${getFrontendUrl()}/organizer/payouts`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onPayoutRejected email failed:", e);
  }
}

export async function onPayoutPaid(payoutId: string): Promise<void> {
  try {
    const ctx = await loadPayoutEmailContext(payoutId);
    if (!ctx?.org) return;
    if (!(await shouldNotifyOrganizer(ctx.org.user._id.toString(), "payoutProcessed"))) return;
    const { payout, org } = ctx;
    const tpl = payoutPaidTemplate({
      organizerName: org.name,
      amount: String(payout.netAmount),
      txRef: payout.txRef ?? "—",
      paymentMethod: payout.paymentMethod ?? "—",
      payoutsUrl: `${getFrontendUrl()}/organizer/payouts`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onPayoutPaid email failed:", e);
  }
}

export async function onNewBooking(orderId: string): Promise<void> {
  try {
    const ctx = await loadOrderContext(orderId);
    if (!ctx) return;
    const { order, event, item } = ctx;
    const org = await loadOrganizerUser(order.organizerId);
    if (!org) return;
    if (!(await shouldNotifyOrganizer(org.user._id.toString(), "newBooking"))) return;

    const base = getFrontendUrl();
    const tpl = newBookingTemplate({
      organizerName: org.name,
      eventTitle: event.title,
      buyerName: order.guestName,
      segmentName: item?.sectionTitle ?? "Ticket",
      quantity: String(item?.quantity ?? 1),
      amount: String(order.total),
      dashboardUrl: `${base}/organizer/events/${event._id.toString()}/attendees`,
    });
    await sendEmail(org.email, tpl.subject, tpl.html);
  } catch (e) {
    console.error("onNewBooking email failed:", e);
  }
}
