import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchEventBySlug } from "@/services/events/events.service";
import { createEventMetadata } from "@/lib/seo/event-metadata";
import { EventDetailView } from "@/components/event-detail/event-detail-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await fetchEventBySlug(slug);
    return createEventMetadata(data.data.event);
  } catch {
    return { title: "Event not found" };
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const data = await fetchEventBySlug(slug);
    return <EventDetailView event={data.data.event} />;
  } catch {
    notFound();
  }
}
