"use client";

import { getColumnGroups } from "@/lib/export/columns";

interface ColumnPickerProps {
  selected: Set<string>;
  onChange: (keys: Set<string>) => void;
}

export function ColumnPicker({ selected, onChange }: ColumnPickerProps) {
  const groups = getColumnGroups();

  function toggleColumn(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  function toggleGroup(group: string, columns: { key: string }[]) {
    const allSelected = columns.every((c) => selected.has(c.key));
    const next = new Set(selected);
    for (const c of columns) {
      if (allSelected) next.delete(c.key);
      else next.add(c.key);
    }
    onChange(next);
  }

  return (
    <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
      {groups.map(({ group, columns }) => {
        const allSelected = columns.every((c) => selected.has(c.key));
        return (
          <div key={group}>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => toggleGroup(group, columns)}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
              />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                {group}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-5">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                  />
                  <span className="text-sm text-slate-400">{col.header}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
