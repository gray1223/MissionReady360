"use client";

import { useEffect } from "react";

export function CivilianThemeInit() {
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", "civilian");
    return () => {
      document.documentElement.removeAttribute("data-mode");
    };
  }, []);

  return null;
}
