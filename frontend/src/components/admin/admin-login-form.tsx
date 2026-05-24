"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth.schema";
import { adminLogin } from "@/services/admin/admin-auth.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { adminRoutes } from "@/config/admin-routes";

export function AdminLoginForm() {
  const router = useRouter();
  const setUser = useAdminAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await adminLogin(data);
      const user = res.data?.user;
      if (!user) {
        toast.error("Invalid login response");
        return;
      }
      setUser(user);
      toast.success("Welcome to the control center");
      router.replace(adminRoutes.dashboard);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Card className="glass-panel w-full max-w-md border-[#FF3EA5]/20">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Admin portal</CardTitle>
        <CardDescription>Staff sign-in only — separate from public login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" className="bg-[#12121e]" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" className="bg-[#12121e]" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Link href={adminRoutes.forgotPassword} className="text-xs text-[#FF3EA5] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full shadow-glow-pink" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in to admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
