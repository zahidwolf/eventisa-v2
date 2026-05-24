"use client";

import Link from "next/link";
import { Calendar, Receipt, Settings, Ticket } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/store/auth.store";

const LINKS = [
  {
    title: "My tickets",
    description: "View QR codes and event passes",
    href: "/tickets",
    icon: Ticket,
  },
  {
    title: "My orders",
    description: "Order history and receipts",
    href: "/orders",
    icon: Receipt,
  },
  {
    title: "Browse events",
    description: "Discover events, concerts & more",
    href: routes.events,
    icon: Calendar,
  },
  {
    title: "Account settings",
    description: "Profile and preferences",
    href: "/settings",
    icon: Settings,
  },
] as const;

export function UserDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Manage your tickets, orders, and account from one place.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map(({ title, description, href, icon: Icon }) => (
          <Card key={title} className="glass-panel border-white/[0.08]">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF3EA5]/15 text-[#FF3EA5]">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">{description}</p>
              <Button variant="secondary" size="sm" className="mt-4" asChild>
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 glass-panel rounded-2xl border border-white/[0.08] p-6 text-center">
        <p className="text-sm text-zinc-400">
          Hosting events?{" "}
          <Link href={routes.organizer.register} className="text-[#FF3EA5] hover:underline">
            Register as an organizer
          </Link>
        </p>
      </div>
    </Container>
  );
}
