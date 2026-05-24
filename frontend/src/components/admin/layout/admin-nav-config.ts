import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Building2,
  ShoppingBag,
  RotateCcw,
  TrendingUp,
  Wallet,
  CreditCard,
  BarChart3,
  Tag,
  Settings,
  ImageIcon,
  Star,
  Flame,
  Heart,
} from "lucide-react";
import { adminRoutes } from "@/config/admin-routes";

export type AdminNavBadgeKey = "pendingEvents" | "pendingOrganizers" | "pendingRefunds";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: AdminNavBadgeKey;
  superAdminOnly?: boolean;
};

export type AdminNavSection = {
  label?: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    items: [{ href: adminRoutes.dashboard, label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Events",
    items: [
      { href: adminRoutes.events, label: "All events", icon: Calendar },
      {
        href: adminRoutes.eventsPending,
        label: "Pending approval",
        icon: Clock,
        badgeKey: "pendingEvents",
      },
    ],
  },
  {
    label: "People",
    items: [
      { href: adminRoutes.users, label: "Users", icon: Users },
      { href: adminRoutes.organizers, label: "Organizers", icon: Building2 },
      {
        href: adminRoutes.organizersPending,
        label: "Pending organizers",
        icon: Building2,
        badgeKey: "pendingOrganizers",
      },
    ],
  },
  {
    label: "Orders",
    items: [
      { href: adminRoutes.orders, label: "All orders", icon: ShoppingBag },
      {
        href: adminRoutes.ordersRefunds,
        label: "Refunds",
        icon: RotateCcw,
        badgeKey: "pendingRefunds",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: adminRoutes.finance, label: "Revenue", icon: TrendingUp },
      { href: adminRoutes.financePayouts, label: "Payouts", icon: Wallet },
      { href: adminRoutes.paymentGateways, label: "Payment Gateways", icon: CreditCard },
    ],
  },
  {
    label: "Homepage",
    items: [
      { href: adminRoutes.heroBanners, label: "Hero banners", icon: ImageIcon },
      { href: adminRoutes.featuredEvents, label: "Featured events", icon: Star },
      { href: adminRoutes.trendingEvents, label: "Trending events", icon: Flame },
      {
        href: adminRoutes.aboutTeam,
        label: "About page team",
        icon: Heart,
        superAdminOnly: true,
      },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: adminRoutes.analytics, label: "Analytics", icon: BarChart3 },
      { href: adminRoutes.promoCodes, label: "Promo codes", icon: Tag },
      { href: adminRoutes.settings, label: "Settings", icon: Settings },
    ],
  },
];
