import { CalendarClock, AlertOctagon, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { CurrencyForecast } from "@/lib/currencies/forecast";

interface Props {
  forecasts: CurrencyForecast[];
}

export function CurrencyForecastCard({ forecasts }: Props) {
  if (forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Forecast
            </span>
          </CardTitle>
          <CardDescription>
            Nothing on the bubble — every tracked currency is comfortably above
            its threshold.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-amber-400" />
            Forecast
          </span>
        </CardTitle>
        <CardDescription>
          Concrete actions to keep your currencies healthy. Sorted by urgency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {forecasts.map((f) => (
            <li
              key={f.ruleId}
              className={cn(
                "rounded-lg border px-4 py-3",
                f.urgency === "expired"
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-amber-500/30 bg-amber-500/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {f.ruleName}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-sm font-medium",
                      f.urgency === "expired"
                        ? "text-red-200"
                        : "text-amber-100",
                    )}
                  >
                    {f.message}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {f.detail}
                  </p>
                </div>
                {f.urgency === "expired" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                    <AlertOctagon className="h-3 w-3" />
                    Expired
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
