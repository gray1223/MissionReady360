import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EP_PHASES, EP_PHASE_LABELS, type EpPhase } from "@/lib/types/ep-practice";

// Skip "setup" in the visual indicator — it's pre-chat
const VISIBLE_PHASES = EP_PHASES.filter((p) => p !== "setup");

interface EpPhaseIndicatorProps {
  currentPhase: EpPhase;
  phasesCompleted: EpPhase[];
}

export function EpPhaseIndicator({
  currentPhase,
  phasesCompleted,
}: EpPhaseIndicatorProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-1">
      {VISIBLE_PHASES.map((phase, i) => {
        const isCompleted = phasesCompleted.includes(phase);
        const isCurrent = phase === currentPhase;

        return (
          <div key={phase} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-4 shrink-0 mx-0.5",
                  isCompleted || isCurrent
                    ? "bg-emerald-500/50"
                    : "bg-slate-700"
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
                isCompleted && "bg-emerald-500/20 text-emerald-400",
                isCurrent && !isCompleted && "bg-amber-500/20 text-amber-400",
                !isCompleted && !isCurrent && "bg-slate-800 text-slate-500"
              )}
            >
              {isCompleted && <Check className="h-3 w-3" />}
              {isCurrent && !isCompleted && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              <span>{EP_PHASE_LABELS[phase]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
