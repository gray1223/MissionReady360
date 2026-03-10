import Link from "next/link";
import { Clock, MessageSquare, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EP_PHASE_LABELS, type EpPhase } from "@/lib/types/ep-practice";

interface EpSessionCardProps {
  id: string;
  title: string;
  startedAt: string;
  durationSeconds: number | null;
  currentPhase: EpPhase;
  evaluation: { overallScore: number } | null;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function getScoreColor(score: number) {
  if (score >= 4) return "text-emerald-400 bg-emerald-500/20";
  if (score >= 3) return "text-amber-400 bg-amber-500/20";
  return "text-red-400 bg-red-500/20";
}

export function EpSessionCard({
  id,
  title,
  startedAt,
  durationSeconds,
  currentPhase,
  evaluation,
}: EpSessionCardProps) {
  const date = new Date(startedAt);
  const isComplete = currentPhase === "complete";

  return (
    <Link
      href={`/upt/ep-practice/${id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 hover:bg-slate-900 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-slate-200 truncate">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            at{" "}
            {date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        {evaluation && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
              getScoreColor(evaluation.overallScore)
            )}
          >
            <Trophy className="h-3 w-3" />
            {evaluation.overallScore}/5
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium",
            isComplete
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          )}
        >
          {isComplete ? "Completed" : EP_PHASE_LABELS[currentPhase]}
        </span>
        {durationSeconds != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(durationSeconds)}
          </span>
        )}
      </div>
    </Link>
  );
}
