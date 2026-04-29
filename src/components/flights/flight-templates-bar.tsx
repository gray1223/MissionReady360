"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, Wand2, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  createFlightTemplate,
  deleteFlightTemplate,
} from "@/app/(dashboard)/flights/template-actions";
import type {
  FlightTemplate,
  FlightTemplatePayload,
} from "@/lib/templates/flight-template-fields";

interface Props {
  templates: FlightTemplate[];
  onApply: (payload: FlightTemplatePayload) => void;
  getCurrentPayload: () => FlightTemplatePayload;
}

export function FlightTemplatesBar({
  templates,
  onApply,
  getCurrentPayload,
}: Props) {
  const router = useRouter();
  const [list, setList] = useState<FlightTemplate[]>(templates);
  const [selectedId, setSelectedId] = useState("");
  const [appliedName, setAppliedName] = useState<string | null>(null);
  const [savingMode, setSavingMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleApply() {
    if (!selectedId) return;
    const tmpl = list.find((t) => t.id === selectedId);
    if (!tmpl) return;
    onApply(tmpl.payload);
    setAppliedName(tmpl.name);
    setTimeout(() => setAppliedName(null), 3000);
  }

  async function handleSave() {
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    const payload = getCurrentPayload();
    const res = await createFlightTemplate(newName, payload);
    setBusy(false);
    if (res.error || !res.template) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setList([res.template, ...list]);
    setSelectedId(res.template.id);
    setNewName("");
    setSavingMode(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!selectedId || busy) return;
    if (!confirm("Delete this template? This can't be undone.")) return;
    setBusy(true);
    setError(null);
    const res = await deleteFlightTemplate(selectedId);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setList(list.filter((t) => t.id !== selectedId));
    setSelectedId("");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-bg-surface/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Wand2 className="h-3.5 w-3.5" />
          Templates
        </p>
        {appliedName && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Check className="h-3 w-3" />
            Applied: {appliedName}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {list.length > 0 ? (
          <>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={busy}
            >
              <option value="">— Pick a template to apply —</option>
              {list.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApply}
              disabled={!selectedId || busy}
            >
              Apply
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedId || busy}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Delete selected template"
              title="Delete selected template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <p className="flex-1 text-xs text-text-muted">
            No saved templates yet. Fill in the form and save it as a template
            to reuse later.
          </p>
        )}

        {!savingMode ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSavingMode(true)}
          >
            <BookmarkPlus className="h-4 w-4" />
            Save as template
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Template name (e.g. Form Contact #3)"
              className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={80}
              disabled={busy}
              autoFocus
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!newName.trim() || busy}
            >
              Save
            </Button>
            <button
              type="button"
              onClick={() => {
                setSavingMode(false);
                setNewName("");
                setError(null);
              }}
              className={cn(
                "rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200",
              )}
              aria-label="Cancel save"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
