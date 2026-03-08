"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, STATUS_CYCLE } from "@/lib/constants/debrief";
import { createClient } from "@/lib/supabase/client";
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
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state, update: { flightId: string; itemIndex: number; newStatus: DebriefItemStatus }) => {
      return state.map((item) =>
        item.flightId === update.flightId && item.itemIndex === update.itemIndex
          ? { ...item, status: update.newStatus }
          : item
      );
    }
  );

  async function cycleStatus(flightId: string, itemIndex: number, currentStatus: DebriefItemStatus) {
    const newStatus = STATUS_CYCLE[currentStatus];

    startTransition(async () => {
      setOptimisticItems({ flightId, itemIndex, newStatus });

      const supabase = createClient();
      const { data: flight } = await supabase
        .from("flights")
        .select("debrief_items")
        .eq("id", flightId)
        .single();

      if (!flight) return;

      const debriefItems = (flight.debrief_items as DebriefItem[]) || [];
      if (itemIndex >= debriefItems.length) return;

      debriefItems[itemIndex] = { ...debriefItems[itemIndex], status: newStatus };

      await supabase
        .from("flights")
        .update({ debrief_items: debriefItems as any })
        .eq("id", flightId);

      router.refresh();
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
                return (
                  <div
                    key={`${item.flightId}-${item.itemIndex}`}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {item.category && (
                        <Badge variant="info" className="shrink-0 mt-0.5">
                          {item.category}
                        </Badge>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200">{item.item}</p>
                        {item.resolution && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.resolution}
                          </p>
                        )}
                      </div>
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
