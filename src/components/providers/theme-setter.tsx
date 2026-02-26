"use client";

import { useEffect } from "react";
import { useLogbookMode } from "./supabase-provider";

export function ThemeSetter() {
  const { mode } = useLogbookMode();

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  return null;
}
