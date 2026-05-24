import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(routes.organizer.eventOverview(id));
}
