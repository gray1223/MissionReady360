"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/components/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/flights": "Flight Log",
  "/flights/new": "New Flight",
  "/currencies": "Currency Status",
  "/qualifications": "Qualifications & Certifications",
  "/aircraft": "My Aircraft",
  "/reports": "Reports",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix matches (longest first)
  const sorted = Object.keys(pageTitles).sort(
    (a, b) => b.length - a.length
  );
  for (const key of sorted) {
    if (pathname.startsWith(key)) return pageTitles[key];
  }

  return "MissionReady360";
}

export function TopNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const pageTitle = getPageTitle(pathname);

  const callsign =
    user?.user_metadata?.callsign ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pilot";

  const initials = callsign.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Page title */}
        <h1 className="text-lg font-semibold text-slate-100 truncate">
          {pageTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* New Flight button - hidden on very small screens */}
          <Link
            href="/flights/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Flight</span>
          </Link>

          {/* Mobile new flight - icon only */}
          <Link
            href="/flights/new"
            className="sm:hidden inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500 transition-colors"
            aria-label="New Flight"
          >
            <Plus className="h-4 w-4" />
          </Link>

          {/* Notification bell */}
          <button
            className="relative rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification dot placeholder */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="hidden md:flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold">
                {initials}
              </div>
              <span className="max-w-[100px] truncate">{callsign}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-lg">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
