"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Search,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavDropdown } from "@/components/ui/NavDropdown";
import { routes } from "@/config/routes";
import { getPostLoginRoute } from "@/lib/auth/get-dashboard-route";
import { env } from "@/config/env";
import { ROLES } from "@/constants/roles";
import { InitialAvatar } from "@/components/shared/InitialAvatar";
import { cn } from "@/lib/utils";
import { logout } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";

const NAV = [
  { href: routes.home, label: "Home" },
  { href: routes.events, label: "Events" },
  { href: routes.about, label: "About Us" },
  { href: routes.contact, label: "Contact Us" },
] as const;

function LoginDropdownPanel() {
  return (
    <>
      <Link
        href={routes.login}
        role="menuitem"
        className="flex gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06]"
      >
        <User className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
        <span>
          <span className="block text-sm font-medium text-white">User Login</span>
          <span className="block text-xs text-zinc-500">Buyers & attendees</span>
        </span>
      </Link>
      <Link
        href={routes.organizer.login}
        role="menuitem"
        className="flex gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06]"
      >
        <Target className="mt-0.5 h-5 w-5 shrink-0 text-[#FF3EA5]" />
        <span>
          <span className="block text-sm font-medium text-white">Organizer Login</span>
          <span className="block text-xs text-zinc-500">Manage your events</span>
        </span>
      </Link>
    </>
  );
}

const MENU_ITEM_CLASS =
  "block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white";

function useLogoutHandler(onNavigate?: () => void) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return async () => {
    onNavigate?.();
    try {
      await logout();
    } catch {
      /* session cleared locally regardless */
    }
    clearAuth();
    router.push(routes.home);
  };
}

function UserAccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const handleLogout = useLogoutHandler(onNavigate);

  return (
    <>
      <Link
        href={getPostLoginRoute(user ?? { role: ROLES.GUEST })}
        role="menuitem"
        className={MENU_ITEM_CLASS}
        onClick={onNavigate}
      >
        Dashboard
      </Link>
      <div className="my-1 border-t border-white/[0.08]" />
      <button type="button" role="menuitem" className={MENU_ITEM_CLASS} onClick={handleLogout}>
        Logout
      </button>
    </>
  );
}

function OrganizerAccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const handleLogout = useLogoutHandler(onNavigate);

  return (
    <>
      <Link href={routes.organizer.dashboard} role="menuitem" className={MENU_ITEM_CLASS} onClick={onNavigate}>
        Dashboard
      </Link>
      <Link href={routes.organizer.events} role="menuitem" className={MENU_ITEM_CLASS} onClick={onNavigate}>
        My Events
      </Link>
      <Link href={routes.organizer.settings} role="menuitem" className={MENU_ITEM_CLASS} onClick={onNavigate}>
        Settings
      </Link>
      <div className="my-1 border-t border-white/[0.08]" />
      <button type="button" role="menuitem" className={MENU_ITEM_CLASS} onClick={handleLogout}>
        Logout
      </button>
    </>
  );
}

function AccountMenuTrigger({ name }: { name?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm text-white">
      <InitialAvatar name={name ?? "User"} size="sm" />
      <span className="hidden max-w-[120px] truncate lg:inline">{name}</span>
      <ChevronDown className="h-4 w-4 text-zinc-500" />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [searchQ, setSearchQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOrganizer =
    user?.role === ROLES.ORGANIZER || !!user?.organizerApprovalStatus;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLink = (href: string, label: string, onClick?: () => void) => {
    const active =
      href === routes.home
        ? pathname === "/"
        : href.includes("#")
          ? false
          : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "text-sm transition",
          active ? "font-medium text-[#FF3EA5]" : "text-zinc-400 hover:text-white"
        )}
      >
        {label}
      </Link>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    window.location.href = q ? `${routes.search}?q=${encodeURIComponent(q)}` : routes.search;
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#12121e]/90 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-6">
          <Link href={routes.home} className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF3EA5]">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-wide text-white">
              {env.appName}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV.map(({ href, label }) => (
              <span key={label}>{navLink(href, label)}</span>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden max-w-xs flex-1 items-center md:flex lg:max-w-[200px] xl:max-w-xs"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="h-9 border-white/10 bg-[#1a1a2e] pl-9 text-sm"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link href={routes.search} aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            <div className="hidden items-center gap-2 sm:flex">
              {isAuthenticated ? (
                <NavDropdown trigger={<AccountMenuTrigger name={user?.name} />}>
                  {isOrganizer ? <OrganizerAccountMenu /> : <UserAccountMenu />}
                </NavDropdown>
              ) : (
                <>
                  <NavDropdown
                    triggerClassName="h-9 gap-1 rounded-md px-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    trigger={
                      <>
                        Login
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </>
                    }
                  >
                    <LoginDropdownPanel />
                  </NavDropdown>
                  <Button size="sm" className="shadow-glow-pink" asChild>
                    <Link href={routes.register}>Sign up</Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#12121e] lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map(({ href, label }) => (
              <div key={label} className="py-2">
                {navLink(href, label, closeMobile)}
              </div>
            ))}
            <div className="my-2 border-t border-white/[0.08]" />
            {isAuthenticated ? (
              <div className="flex flex-col gap-1 py-1">
                {isOrganizer ? (
                  <OrganizerAccountMenu onNavigate={closeMobile} />
                ) : (
                  <UserAccountMenu onNavigate={closeMobile} />
                )}
              </div>
            ) : (
              <>
                <Link
                  href={routes.login}
                  className="py-2 text-sm text-zinc-300 hover:text-white"
                  onClick={closeMobile}
                >
                  User Login
                </Link>
                <Link
                  href={routes.organizer.login}
                  className="py-2 text-sm text-zinc-300 hover:text-white"
                  onClick={closeMobile}
                >
                  Organizer Login
                </Link>
                <Link
                  href={routes.register}
                  className="mt-2 py-2 text-sm font-medium text-[#FF3EA5]"
                  onClick={closeMobile}
                >
                  Sign up
                </Link>
              </>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
