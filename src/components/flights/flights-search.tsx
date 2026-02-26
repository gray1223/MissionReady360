"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FlightsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [dateOpen, setDateOpen] = useState(
    !!(searchParams.get("from") || searchParams.get("to"))
  );
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  function applyParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyParams({ q: query.trim() });
  }

  function handleDateChange(field: "from" | "to", value: string) {
    if (field === "from") setFrom(value);
    else setTo(value);
    applyParams({ [field]: value });
  }

  function handleClear() {
    setQuery("");
    setFrom("");
    setTo("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = !!(searchParams.get("q") || searchParams.get("from") || searchParams.get("to"));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Text search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flights..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        {/* Date range toggle */}
        <button
          type="button"
          onClick={() => setDateOpen(!dateOpen)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm transition-colors flex items-center gap-1",
            dateOpen
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
          )}
        >
          Dates
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dateOpen && "rotate-180")} />
        </button>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Date range inputs */}
      {dateOpen && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
}
