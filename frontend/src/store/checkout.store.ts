import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomFormResponse } from "@/types/models/order";

export type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutItem {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  sectionId: string;
  sectionTitle: string;
  unitPrice: number;
  quantity: number;
  coverImage?: string;
}

interface GuestDetails {
  name: string;
  email: string;
  phone: string;
}

interface CheckoutState {
  sessionId: string;
  step: CheckoutStep;
  item: CheckoutItem | null;
  reservationId: string | null;
  reservationExpiresAt: string | null;
  reservationTotal: number | null;
  orderId: string | null;
  guest: GuestDetails;
  customFormResponses: CustomFormResponse[];
  promoCode: string | null;
  promoDiscount: number;
  promoFinalTotal: number | null;
  setStep: (step: CheckoutStep) => void;
  setItem: (item: CheckoutItem) => void;
  setReservation: (id: string, expiresAt: string, total?: number) => void;
  setOrderId: (id: string) => void;
  setGuest: (guest: Partial<GuestDetails>) => void;
  setCustomFormResponses: (responses: CustomFormResponse[]) => void;
  setPromo: (code: string | null, discount: number, finalTotal: number | null) => void;
  clearPromo: () => void;
  reset: () => void;
}

function createSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const initialGuest: GuestDetails = { name: "", email: "", phone: "" };

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      sessionId: createSessionId(),
      step: 1,
      item: null,
      reservationId: null,
      reservationExpiresAt: null,
      reservationTotal: null,
      orderId: null,
      guest: initialGuest,
      customFormResponses: [],
      promoCode: null,
      promoDiscount: 0,
      promoFinalTotal: null,
      setStep: (step) => set({ step }),
      setItem: (item) => set({ item }),
      setReservation: (id, expiresAt, total) =>
        set({ reservationId: id, reservationExpiresAt: expiresAt, reservationTotal: total ?? null }),
      setOrderId: (id) => set({ orderId: id }),
      setGuest: (guest) => set((s) => ({ guest: { ...s.guest, ...guest } })),
      setCustomFormResponses: (customFormResponses) => set({ customFormResponses }),
      setPromo: (promoCode, promoDiscount, promoFinalTotal) =>
        set({ promoCode, promoDiscount, promoFinalTotal }),
      clearPromo: () => set({ promoCode: null, promoDiscount: 0, promoFinalTotal: null }),
      reset: () =>
        set({
          sessionId: createSessionId(),
          step: 1,
          item: null,
          reservationId: null,
          reservationExpiresAt: null,
          reservationTotal: null,
          orderId: null,
          guest: initialGuest,
          customFormResponses: [],
          promoCode: null,
          promoDiscount: 0,
          promoFinalTotal: null,
        }),
    }),
    { name: "tick-checkout" }
  )
);
