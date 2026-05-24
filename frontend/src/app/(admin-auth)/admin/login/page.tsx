import { Suspense } from "react";
import { AdminLoginPage } from "@/components/admin/admin-login-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-500">Loading…</p>}>
      <AdminLoginPage />
    </Suspense>
  );
}
