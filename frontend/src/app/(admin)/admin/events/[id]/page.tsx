import { redirect } from "next/navigation";
import { adminRoutes } from "@/config/admin-routes";

export default async function AdminEventIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(adminRoutes.eventOverview(id));
}
