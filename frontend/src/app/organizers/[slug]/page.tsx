import { notFound } from "next/navigation";
import { fetchOrganizerProfile } from "@/lib/organizers/fetch-organizer-profile";
import { OrganizerProfileView } from "@/components/organizer/organizer-profile-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizerPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchOrganizerProfile(slug);
  if (!data) notFound();
  return <OrganizerProfileView data={data} />;
}
