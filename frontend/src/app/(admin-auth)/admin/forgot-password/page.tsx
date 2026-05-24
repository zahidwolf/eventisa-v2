import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminRoutes } from "@/config/admin-routes";

export default function AdminForgotPasswordPage() {
  return (
    <Card className="glass-panel w-full max-w-md border-white/10">
      <CardHeader>
        <CardTitle>Reset admin password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-zinc-500">
        <p>Email reset flow will connect to your mail provider in production.</p>
        <Link href={adminRoutes.login} className="text-[#FF3EA5] hover:underline">
          Back to admin login
        </Link>
      </CardContent>
    </Card>
  );
}
