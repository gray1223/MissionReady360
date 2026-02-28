"use client";

import { useState } from "react";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleCurrencyDisabled } from "@/app/(dashboard)/settings/actions";

interface HiddenCurrency {
  rule_id: string;
  rule_name: string;
}

interface HiddenCurrenciesProps {
  currencies: HiddenCurrency[];
}

export function HiddenCurrencies({ currencies }: HiddenCurrenciesProps) {
  const [expanded, setExpanded] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const router = useRouter();

  if (currencies.length === 0) return null;

  async function handleRestore(ruleId: string) {
    setRestoring(ruleId);
    await toggleCurrencyDisabled(ruleId, false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-sm text-slate-500 hover:text-slate-400 transition-colors"
      >
        <span>{currencies.length} hidden currenc{currencies.length === 1 ? "y" : "ies"}</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {currencies.map((c) => (
            <div
              key={c.rule_id}
              className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2"
            >
              <span className="text-sm text-slate-500">{c.rule_name}</span>
              <button
                onClick={() => handleRestore(c.rule_id)}
                disabled={restoring === c.rule_id}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Eye className="h-3 w-3" />
                Show
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
