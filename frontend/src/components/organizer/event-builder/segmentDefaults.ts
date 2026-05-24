import type { TicketSegment } from "@/types/eventBuilder.types";

export function createDefaultSegment(index = 0): TicketSegment {
  const id = `seg_${Date.now().toString(36)}_${index}`;
  return {
    segmentId: id,
    name: "New segment",
    description: "",
    price: 0,
    isFree: true,
    capacity: 100,
    remainingQuantity: 100,
    maxPurchasePerUser: 10,
    minPurchase: 1,
    visibility: "public",
    status: "draft",
    ticketColor: "#9B5CFF",
    formFields: [],
  };
}
