import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminRoutes } from "@/config/admin-routes";

export default function AdminResetPasswordPage() {
  return (
    <Card className="glass-panel w-full max-w-md border-white/10">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-500">
        <p>Token-based reset placeholder.</p>
        <Link href={adminRoutes.login} className="mt-4 inline-block text-[#FF3EA5] hover:underline">
          Admin login
        </Link>
      </CardContent>
    </Card>
  );
}
