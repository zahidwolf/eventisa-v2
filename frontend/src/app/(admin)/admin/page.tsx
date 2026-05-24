import { redirect } from "next/navigation";
import { adminRoutes } from "@/config/admin-routes";

export default function AdminIndexPage() {
  redirect(adminRoutes.dashboard);
}
