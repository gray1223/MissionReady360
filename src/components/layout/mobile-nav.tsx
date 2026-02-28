"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Clock,
  Award,
  MoreHorizontal,
  X,
  Cog,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser, useLogbookMode } from "@/components/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/currencies", label: "Currencies", icon: Clock },
  { href: "/qualifications", label: "Quals", icon: Award },
] as const;

const moreNavItems = [
  { href: "/aircraft", label: "Aircraft", icon: Cog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const isMoreActive = moreNavItems.some(
    (item) =>
      pathname === item.href || pathname.startsWith(item.href + "/")
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const { mode, switchMode, isMilitary } = useLogbookMode();

  const callsign =
    user?.user_metadata?.callsign ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pilot";

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Slide-up more menu */}
      <div
        className={cn(
          "fixed bottom-16 left-0 right-0 z-50 transform transition-transform duration-200 md:hidden",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mx-3 mb-2 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-lg">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
              {callsign.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {callsign}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Mode switcher */}
          <button
            onClick={() => {
              switchMode(isMilitary ? "civilian" : "military");
              setMoreOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors mb-1 border-b border-slate-800 pb-2.5"
          >
            {isMilitary ? (
              <>
                <Plane className="h-5 w-5" />
                <span>Switch to Civilian</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Switch to Military</span>
              </>
            )}
          </button>

          {/* More nav items */}
          {moreNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-300 hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-800/50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>

          {/* Close button */}
          <button
            onClick={() => setMoreOpen(false)}
            className="absolute top-2 right-2 rounded-lg p-1.5 text-slate-400 hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around px-1 py-1">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
              isMoreActive || moreOpen
                ? "text-primary"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
