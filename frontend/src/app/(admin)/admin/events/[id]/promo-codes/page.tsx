"use client";

import { useParams } from "next/navigation";
import { PromoCodeManager } from "@/components/organizer/promo/PromoCodeManager";

export default function AdminEventPromoCodesPage() {
  const eventId = useParams().id as string;
  return <PromoCodeManager eventId={eventId} apiMode="admin" />;
}
