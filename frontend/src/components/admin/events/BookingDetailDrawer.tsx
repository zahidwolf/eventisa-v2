"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  adminCancelBooking,
  adminRefundBooking,
  adminResendBookingEmail,
  fetchAdminBookingDetail,
} from "@/services/admin/admin-event-detail.service";
import { AdminConfirmDialog } from "@/components/admin/events/AdminConfirmDialog";
import { getApiErrorMessage } from "@/services/api/client";

interface BookingDetailDrawerProps {
  eventId: string;
  orderId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}

function formatAnswer(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v ?? "—");
}

export function BookingDetailDrawer({
  eventId,
  orderId,
  onClose,
  onChanged,
}: BookingDetailDrawerProps) {
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-booking", eventId, orderId],
    queryFn: () => fetchAdminBookingDetail(eventId, orderId!),
    enabled: !!orderId,
  });

  const refundMut = useMutation({
    mutationFn: () => adminRefundBooking(eventId, orderId!, "Admin refund"),
    onSuccess: () => {
      toast.success("Refund processed");
      setRefundOpen(false);
      refetch();
      onChanged?.();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const cancelMut = useMutation({
    mutationFn: () => adminCancelBooking(eventId, orderId!, "Admin cancellation"),
    onSuccess: () => {
      toast.success("Booking cancelled");
      setCancelOpen(false);
      refetch();
      onChanged?.();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const resendMut = useMutation({
    mutationFn: () => adminResendBookingEmail(eventId, orderId!),
    onSuccess: () => toast.success("Confirmation email queued"),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (!orderId) return null;

  const order = data?.order as Record<string, unknown> | undefined;
  const paymentStatus = String(order?.paymentStatus ?? "");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0c1020] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-semibold text-white">Booking detail</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          {isLoading && <p className="text-zinc-500">Loading…</p>}
          {data && (
            <div className="space-y-6">
              <section>
                <p className="font-mono text-xs text-zinc-500">{String(order?.orderId)}</p>
                <p className="mt-1 text-zinc-400">
                  Booked {order?.bookedAt ? new Date(String(order.bookedAt)).toLocaleString() : "—"}
                </p>
                <p className="capitalize text-accent-magenta">{paymentStatus}</p>
                {order?.transactionRef != null && order.transactionRef !== "" && (
                  <p className="text-xs text-zinc-500">Ref: {String(order.transactionRef)}</p>
                )}
              </section>
              <section>
                <h3 className="text-xs uppercase text-zinc-500">Buyer</h3>
                <p className="text-white">{data.buyer.name}</p>
                <p>{data.buyer.email}</p>
                <p>{data.buyer.phone}</p>
              </section>
              <section>
                <h3 className="text-xs uppercase text-zinc-500">Event & segment</h3>
                <p>{data.event.title}</p>
                <p>
                  {data.segment.name} × {data.segment.quantity} @ ৳{data.segment.price}
                </p>
              </section>
              <section>
                <h3 className="text-xs uppercase text-zinc-500">Totals</h3>
                <p>Subtotal: ৳{Number(order?.subtotal ?? 0).toLocaleString()}</p>
                <p>Service fee: ৳{Number(order?.serviceFee ?? 0).toLocaleString()}</p>
                <p>Discount: ৳{Number(order?.discount ?? 0).toLocaleString()}</p>
                <p className="font-semibold text-white">
                  Total: ৳{Number(order?.total ?? 0).toLocaleString()}
                </p>
                {order?.promoCode != null && order.promoCode !== "" && (
                  <p>Promo: {String(order.promoCode)}</p>
                )}
              </section>
              {Object.keys(data.formAnswers).length > 0 && (
                <section>
                  <h3 className="text-xs uppercase text-zinc-500">Form answers</h3>
                  <dl className="space-y-2">
                    {Object.entries(data.formAnswers).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-zinc-500">{k}</dt>
                        <dd className="text-white">{formatAnswer(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {data.tickets.length > 0 && (
                <section>
                  <h3 className="text-xs uppercase text-zinc-500">Tickets</h3>
                  {data.tickets.map((t) => (
                    <div key={t.ticketNumber} className="mt-3 rounded-lg border border-white/10 p-3">
                      <p className="font-mono text-xs">{t.ticketNumber}</p>
                      <p className="capitalize text-zinc-400">{t.status}</p>
                      {t.checkInAt && (
                        <p className="text-xs text-zinc-500">
                          Checked in {new Date(String(t.checkInAt)).toLocaleString()}
                        </p>
                      )}
                      {t.qrCodeData && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.qrCodeData} alt="QR" className="mt-2 h-32 w-32 rounded bg-white p-1" />
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 p-4">
          {paymentStatus === "paid" && (
            <Button size="sm" variant="secondary" onClick={() => setRefundOpen(true)}>
              Issue refund
            </Button>
          )}
          {paymentStatus !== "cancelled" && paymentStatus !== "refunded" && paymentStatus !== "paid" && (
            <Button size="sm" variant="secondary" onClick={() => setCancelOpen(true)}>
              Cancel booking
            </Button>
          )}
          {paymentStatus === "paid" && (
            <Button size="sm" variant="outline" disabled={resendMut.isPending} onClick={() => resendMut.mutate()}>
              Resend email
            </Button>
          )}
        </div>
      </aside>

      <AdminConfirmDialog
        open={refundOpen}
        title="Issue refund"
        description="Refund this paid order and restore segment inventory. This cannot be undone."
        confirmLabel="Refund"
        destructive
        loading={refundMut.isPending}
        onOpenChange={setRefundOpen}
        onConfirm={() => refundMut.mutate()}
      />
      <AdminConfirmDialog
        open={cancelOpen}
        title="Cancel booking"
        description="Cancel this unpaid booking and release reserved tickets."
        confirmLabel="Cancel booking"
        destructive
        loading={cancelMut.isPending}
        onOpenChange={setCancelOpen}
        onConfirm={() => cancelMut.mutate()}
      />
    </>
  );
}
