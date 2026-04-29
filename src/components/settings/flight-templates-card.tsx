"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Trash2, Pencil, Check, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deleteFlightTemplate,
  renameFlightTemplate,
} from "@/app/(dashboard)/flights/template-actions";
import type { FlightTemplate } from "@/lib/templates/flight-template-fields";

interface Props {
  templates: FlightTemplate[];
}

export function FlightTemplatesCard({ templates }: Props) {
  const router = useRouter();
  const [list, setList] = useState<FlightTemplate[]>(templates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(t: FlightTemplate) {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDesc(t.description ?? "");
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  }

  async function handleSave(id: string) {
    if (!editName.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await renameFlightTemplate(id, editName, editDesc);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setList((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: editName.trim().slice(0, 80),
              description: editDesc.trim().slice(0, 200) || null,
            }
          : t,
      ),
    );
    cancelEdit();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (busy) return;
    if (!confirm("Delete this template? This can't be undone.")) return;
    setBusy(true);
    setError(null);
    const res = await deleteFlightTemplate(id);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setList((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Quick-log Templates
          </span>
        </CardTitle>
        <CardDescription>
          Saved sortie patterns. Apply them on the Log New Flight page to
          prefill fields. Per-flight values (date, mission number, crew, debrief)
          are never copied.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        {list.length === 0 ? (
          <p className="rounded-lg bg-slate-800/30 px-4 py-6 text-center text-sm text-text-muted">
            No templates yet. On the Log New Flight page, fill in the form and
            click <span className="text-slate-300">Save as template</span>.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {list.map((t) => {
              const fields = Object.keys(t.payload);
              const isEditing = editingId === t.id;
              return (
                <li key={t.id} className="py-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Template name"
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        maxLength={80}
                        disabled={busy}
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        maxLength={200}
                        disabled={busy}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleSave(t.id)}
                          disabled={!editName.trim() || busy}
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={busy}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200">
                          {t.name}
                        </p>
                        {t.description && (
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {t.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-text-muted">
                          {fields.length} field
                          {fields.length === 1 ? "" : "s"} snapshotted ·{" "}
                          {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(t)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          aria-label="Rename template"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                          aria-label="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
