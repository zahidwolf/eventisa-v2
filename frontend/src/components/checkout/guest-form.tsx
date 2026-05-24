"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guestCheckoutSchema, type GuestCheckoutForm } from "@/lib/validators/checkout.schema";
import { useCheckoutStore } from "@/store/checkout.store";

interface GuestFormProps {
  onSubmit: (data: GuestCheckoutForm) => void;
  loading?: boolean;
  requireStudentId?: boolean;
}

export function GuestForm({ onSubmit, loading, requireStudentId }: GuestFormProps) {
  const guest = useCheckoutStore((s) => s.guest);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestCheckoutForm>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: guest,
  });

  return (
    <form id="guest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} placeholder="Your name" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Bangladesh)</Label>
        <Input id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>
      {requireStudentId && (
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input id="studentId" {...register("studentId")} placeholder="University student ID" />
          {errors.studentId && (
            <p className="text-xs text-destructive">{errors.studentId.message}</p>
          )}
        </div>
      )}
      {loading && <p className="text-sm text-muted-foreground">Processing...</p>}
    </form>
  );
}
