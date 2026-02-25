"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "mr360-sidebar-collapsed";

export function SidebarOffset({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function check() {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }
    check();
    setMounted(true);

    // Listen for storage changes (from sidebar toggle)
    window.addEventListener("storage", check);

    // Also listen for custom event in same tab
    function handleSidebarToggle() {
      check();
    }
    window.addEventListener("sidebar-toggle", handleSidebarToggle);

    // Poll for changes from the same tab (localStorage events don't fire in same tab)
    const interval = setInterval(check, 200);

    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("sidebar-toggle", handleSidebarToggle);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-[margin-left] duration-200",
        // On mobile, no left margin (sidebar is hidden)
        "ml-0",
        // On desktop, offset by sidebar width
        mounted
          ? collapsed
            ? "md:ml-16"
            : "md:ml-64"
          : "md:ml-64"
      )}
    >
      {children}
    </div>
  );
}
