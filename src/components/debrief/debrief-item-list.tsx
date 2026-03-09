"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, STATUS_CYCLE } from "@/lib/constants/debrief";
import { createClient } from "@/lib/supabase/client";
import { formatLabel } from "@/lib/utils/format";
import type { DebriefItemStatus, DebriefItem } from "@/lib/types/database";

export interface FlatDebriefItem {
  flightId: string;
  flightDate: string;
  aircraftDesignation: string;
  itemIndex: number;
  category: string;
  item: string;
  resolution: string;
  status: DebriefItemStatus;
  hasUptGrades: boolean;
}

interface DebriefItemListProps {
  items: FlatDebriefItem[];
}

export function DebriefItemList({ items }: DebriefItemListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editItem, setEditItem] = useState("");
  const [editResolution, setEditResolution] = useState("");

  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state, update: { flightId: string; itemIndex: number; patch: Partial<FlatDebriefItem> }) => {
      return state.map((item) =>
        item.flightId === update.flightId && item.itemIndex === update.itemIndex
          ? { ...item, ...update.patch }
          : item
      );
    }
  );

  async function updateItem(
    flightId: string,
    itemIndex: number,
    patch: Partial<Pick<DebriefItem, "status" | "item" | "resolution">>
  ) {
    const supabase = createClient();
    const { data: flight } = await supabase
      .from("flights")
      .select("debrief_items")
      .eq("id", flightId)
      .single();

    if (!flight) return;

    const debriefItems = (flight.debrief_items as DebriefItem[]) || [];
    if (itemIndex >= debriefItems.length) return;

    debriefItems[itemIndex] = { ...debriefItems[itemIndex], ...patch };

    await supabase
      .from("flights")
      .update({ debrief_items: debriefItems as any })
      .eq("id", flightId);

    router.refresh();
  }

  function cycleStatus(flightId: string, itemIndex: number, currentStatus: DebriefItemStatus) {
    const newStatus = STATUS_CYCLE[currentStatus];
    startTransition(async () => {
      setOptimisticItems({ flightId, itemIndex, patch: { status: newStatus } });
      await updateItem(flightId, itemIndex, { status: newStatus });
    });
  }

  function startEdit(item: FlatDebriefItem) {
    const key = `${item.flightId}-${item.itemIndex}`;
    setEditingKey(key);
    setEditItem(item.item);
    setEditResolution(item.resolution);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditItem("");
    setEditResolution("");
  }

  function saveEdit(flightId: string, itemIndex: number) {
    if (!editItem.trim()) return;
    startTransition(async () => {
      setOptimisticItems({
        flightId,
        itemIndex,
        patch: { item: editItem, resolution: editResolution },
      });
      setEditingKey(null);
      await updateItem(flightId, itemIndex, {
        item: editItem,
        resolution: editResolution,
      });
    });
  }

  // Group by flight date + aircraft
  const grouped = new Map<string, FlatDebriefItem[]>();
  for (const item of optimisticItems) {
    const key = `${item.flightDate}|${item.aircraftDesignation}|${item.flightId}`;
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  }

  if (optimisticItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <p className="text-sm text-slate-500">No debrief items match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([key, groupItems]) => {
        const first = groupItems[0];
        const dateLabel = format(parseISO(first.flightDate), "MMM d, yyyy");

        return (
          <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-800/30 px-4 py-2">
              <span className="text-xs font-medium text-slate-400">{dateLabel}</span>
              <span className="text-xs text-slate-600">&middot;</span>
              <span className="text-xs text-slate-500">{first.aircraftDesignation}</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-800/50">
              {groupItems.map((item) => {
                const statusConfig = STATUS_CONFIG[item.status];
                const itemKey = `${item.flightId}-${item.itemIndex}`;
                const isEditing = editingKey === itemKey;

                return (
                  <div
                    key={itemKey}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {item.category && (
                        <Badge variant="info" className="shrink-0 mt-0.5">
                          {formatLabel(item.category)}
                        </Badge>
                      )}
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            value={editItem}
                            onChange={(e) => setEditItem(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-800/50 px-2 py-1 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Item"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(item.flightId, item.itemIndex);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <input
                            value={editResolution}
                            onChange={(e) => setEditResolution(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-800/50 px-2 py-1 text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Resolution / action"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(item.flightId, item.itemIndex);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(item.flightId, item.itemIndex)}
                              className="rounded p-1 text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded p-1 text-slate-400 hover:bg-slate-800 transition-colors"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0 group flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-slate-200">{item.item}</p>
                            <button
                              onClick={() => startEdit(item)}
                              className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-500 hover:text-slate-300 transition-all"
                              title="Edit item"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                          {item.resolution && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.resolution}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => cycleStatus(item.flightId, item.itemIndex, item.status)}
                      className="shrink-0"
                      title={`Click to change status (current: ${statusConfig.label})`}
                    >
                      <Badge variant={statusConfig.variant} className="cursor-pointer hover:opacity-80 transition-opacity">
                        {statusConfig.label}
                      </Badge>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
