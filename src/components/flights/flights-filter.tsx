"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const FILTERS = [
  { value: "military", label: "Military" },
  { value: "civilian", label: "Civilian" },
  { value: "all", label: "All" },
] as const;

interface FlightsFilterProps {
  currentFilter: string;
}

export function FlightsFilter({ currentFilter }: FlightsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1 rounded-lg bg-slate-800/50 p-1 w-fit">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => {
            const params = new URLSearchParams();
            params.set("filter", f.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentFilter === f.value
              ? "bg-slate-700 text-slate-100"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
