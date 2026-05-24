"use client";

import { useParams } from "next/navigation";
import { PromoCodeManager } from "@/components/organizer/promo/PromoCodeManager";

export default function EventPromoCodesPage() {
  const eventId = useParams().id as string;
  return <PromoCodeManager eventId={eventId} />;
}
