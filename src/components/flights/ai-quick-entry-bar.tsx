"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiParsePayload } from "@/lib/templates/ai-parse-fields";

interface Props {
  onApply: (payload: AiParsePayload) => void;
}

export function AiQuickEntryBar({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<string[] | null>(null);

  async function handleParse() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setAppliedKeys(null);

    try {
      const res = await fetch("/api/flights/ai-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI parse failed");
        return;
      }
      const payload: AiParsePayload = data.payload ?? {};
      onApply(payload);
      setAppliedKeys(Object.keys(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Quick Entry
          <span className="text-[10px] font-normal text-text-muted">
            {open ? "(hide)" : "(describe a flight in plain English)"}
          </span>
        </button>
        {appliedKeys && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
            Filled {appliedKeys.length} field{appliedKeys.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "BFM 2v2 yesterday in F-16, 1.5 hours, lead IP, callsign HARM 21, 2 day landings, KLSV to KLSV"'
            rows={3}
            maxLength={2000}
            disabled={busy}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-text-muted">
              The AI prefills what it can pull out. Always review before saving.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleParse}
              disabled={!text.trim() || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse & fill
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
