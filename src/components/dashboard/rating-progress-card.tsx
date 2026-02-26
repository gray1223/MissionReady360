import Link from "next/link";
import { GraduationCap, ArrowRight, Settings2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import type { RatingProgress } from "@/lib/flights/rating-progress";

function progressColor(percent: number) {
  if (percent >= 100) return "bg-emerald-500";
  if (percent >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function progressTrack(percent: number) {
  if (percent >= 100) return "text-emerald-400";
  if (percent >= 50) return "text-amber-400";
  return "text-red-400";
}

interface RatingProgressCardProps {
  ratings: RatingProgress[];
  hasPriorHours?: boolean;
}

export function RatingProgressCard({ ratings, hasPriorHours }: RatingProgressCardProps) {
  if (ratings.length === 0) return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              FAA Rating Progress
            </span>
          </CardTitle>
          <Link
            href="/settings"
            className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
          >
            <Settings2 className="h-3 w-3" />
            Configure
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!hasPriorHours && (
          <p className="mb-4 text-xs text-slate-500">
            Have prior flight hours?{" "}
            <Link
              href="/settings"
              className="text-primary hover:text-primary-hover"
            >
              Add them in settings
            </Link>
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ratings.map((rp) => (
            <div key={rp.rating.id} className="rounded-lg bg-slate-800/30 p-4">
              {/* Header with ring */}
              <div className="flex items-center gap-4 mb-4">
                <ProgressRing value={rp.overallPercent} size={56} strokeWidth={5}>
                  <span className="text-xs font-bold text-slate-200">
                    {rp.overallPercent}%
                  </span>
                </ProgressRing>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {rp.rating.shortName}
                  </p>
                  <p className="text-xs text-slate-500">{rp.rating.regulation}</p>
                </div>
              </div>

              {/* Requirement bars */}
              <div className="space-y-2.5">
                {rp.requirements.map((req) => (
                  <div key={req.requirement.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">
                        {req.requirement.label}
                      </span>
                      <span className={`text-xs font-medium ${progressTrack(req.percent)}`}>
                        {req.achieved.toFixed(1)} / {req.requirement.required}
                        {req.achievedFromPrior > 0 && (
                          <span className="ml-1 text-slate-500 font-normal">
                            (incl. {req.achievedFromPrior.toFixed(1)} prior)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-700">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${progressColor(req.percent)}`}
                        style={{ width: `${req.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
