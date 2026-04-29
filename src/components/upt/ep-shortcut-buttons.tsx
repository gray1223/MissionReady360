import type { EpPhase } from "@/lib/types/ep-practice";
import { cn } from "@/lib/utils/cn";

interface EpShortcutButtonsProps {
  currentPhase: EpPhase;
  isStreaming: boolean;
  onShortcut: (text: string) => void;
}

type ButtonConfig = {
  label: string;
  colorClass: string;
};

const PHASE_BUTTONS: Partial<Record<EpPhase, ButtonConfig[]>> = {
  gather_info: [
    {
      label: "BPWANTFACTS?",
      colorClass:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
    },
    {
      label: "MATL",
      colorClass:
        "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
    },
    {
      label: "Skip",
      colorClass:
        "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
    },
  ],
  maintain_aircraft_control: [
    {
      label: "Skip",
      colorClass:
        "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
    },
  ],
  analyze: [
    {
      label: "Skip",
      colorClass:
        "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
    },
  ],
  take_action: [
    {
      label: "Skip",
      colorClass:
        "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
    },
  ],
  land: [
    {
      label: "Skip",
      colorClass:
        "border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700",
    },
  ],
};

export function EpShortcutButtons({
  currentPhase,
  isStreaming,
  onShortcut,
}: EpShortcutButtonsProps) {
  const buttons = PHASE_BUTTONS[currentPhase];
  if (!buttons) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={() => onShortcut(btn.label)}
          disabled={isStreaming}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            btn.colorClass
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
