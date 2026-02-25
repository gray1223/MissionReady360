"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Clock,
  Award,
  Cog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/components/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "mr360-sidebar-collapsed";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/currencies", label: "Currencies", icon: Clock },
  { href: "/qualifications", label: "Qualifications", icon: Award },
  { href: "/aircraft", label: "Aircraft", icon: Cog },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Derive display name from user metadata
  const callsign =
    user?.user_metadata?.callsign ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pilot";

  const initials = callsign.slice(0, 2).toUpperCase();

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return <aside className="hidden md:block w-64 shrink-0" />;
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40",
        "border-r border-slate-800 bg-slate-950",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-100 hover:text-emerald-400"
        >
          <Shield className="h-6 w-6 text-emerald-500 shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              MissionReady360
            </span>
          )}
          {collapsed && (
            <span className="text-sm font-bold tracking-tight">MR</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-emerald-400" />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2">
        <button
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User section */}
      <div className="border-t border-slate-800 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {callsign}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function check() {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  return collapsed;
}
