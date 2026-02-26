"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Plane, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLogbookMode } from "@/components/providers/supabase-provider";

interface ModeSwitcherProps {
  collapsed?: boolean;
}

export function ModeSwitcher({ collapsed = false }: ModeSwitcherProps) {
  const { mode, switchMode, isMilitary } = useLogbookMode();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const Icon = isMilitary ? Shield : Plane;
  const label = isMilitary ? "Military" : "Civilian";
  const otherIcon = isMilitary ? Plane : Shield;
  const otherLabel = isMilitary ? "Civilian" : "Military";
  const otherMode = isMilitary ? "civilian" : "military";

  if (collapsed) {
    return (
      <div ref={ref} className="relative px-2 py-1">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          title={`${label} mode`}
        >
          <Icon className="h-4 w-4 text-emerald-400" />
        </button>

        {open && (
          <div className="absolute left-full top-0 ml-2 w-40 rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-lg z-50">
            <button
              onClick={() => {
                switchMode(otherMode as "military" | "civilian");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              {(() => {
                const OtherIcon = otherIcon;
                return <OtherIcon className="h-4 w-4" />;
              })()}
              Switch to {otherLabel}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-2 py-1">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
      >
        <Icon className="h-4 w-4 text-emerald-400 shrink-0" />
        <span className="flex-1 text-left font-medium">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full mt-1 rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-lg z-50">
          <button
            onClick={() => {
              switchMode(otherMode as "military" | "civilian");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            {(() => {
              const OtherIcon = otherIcon;
              return <OtherIcon className="h-4 w-4" />;
            })()}
            Switch to {otherLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/** Small badge for inline display (e.g. top-nav) */
export function ModeBadge() {
  const { isMilitary } = useLogbookMode();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isMilitary
          ? "bg-emerald-600/15 text-emerald-400"
          : "bg-sky-600/15 text-sky-400"
      )}
    >
      {isMilitary ? "MIL" : "CIV"}
    </span>
  );
}
