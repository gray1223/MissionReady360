import type { ComputedCurrency } from "@/lib/types/database";

export type ForecastUrgency = "expired" | "soon" | "comfortable";

export interface CurrencyForecast {
  ruleId: string;
  ruleName: string;
  urgency: ForecastUrgency;
  status: ComputedCurrency["status"];
  daysRemaining: number;
  message: string; // primary actionable line
  detail: string; // secondary line
  byDate: string | null; // ISO target date (period_end)
  gap: number; // events still needed for the relevant target
}

const EVENT_LABELS: Record<string, { singular: string; plural: string }> = {
  day_landings: { singular: "day landing", plural: "day landings" },
  night_landings: { singular: "night landing", plural: "night landings" },
  full_stop_night_landings: {
    singular: "full-stop night landing",
    plural: "full-stop night landings",
  },
  approaches: { singular: "approach", plural: "approaches" },
  sorties: { singular: "sortie", plural: "sorties" },
  night_sorties: { singular: "night sortie", plural: "night sorties" },
  nvg_sorties: { singular: "NVG sortie", plural: "NVG sorties" },
  formation_sorties: {
    singular: "formation sortie",
    plural: "formation sorties",
  },
  carrier_traps: { singular: "carrier trap", plural: "carrier traps" },
  landings: { singular: "landing", plural: "landings" },
  flight_review: { singular: "flight review", plural: "flight reviews" },
};

function eventLabel(event: string, count: number): string {
  const entry = EVENT_LABELS[event];
  if (!entry) {
    // Fallback: humanize "snake_case"
    const human = event.replace(/_/g, " ");
    return `${count} ${human}`;
  }
  return `${count} ${count === 1 ? entry.singular : entry.plural}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function buildForecast(
  c: ComputedCurrency,
  warningThresholdDays = 14,
): CurrencyForecast | null {
  const gap = c.required_count - c.achieved_count;

  if (gap > 0) {
    // Behind: need to log more before period_end
    const deadline = formatDate(c.period_end);
    return {
      ruleId: c.rule_id,
      ruleName: c.rule_name,
      urgency: c.status === "expired" ? "expired" : "soon",
      status: c.status,
      daysRemaining: c.days_remaining,
      message: `Fly ${eventLabel(c.required_event, Math.ceil(gap))} by ${deadline}`,
      detail: `${c.achieved_count} of ${c.required_count} logged this period.`,
      byDate: c.period_end,
      gap: Math.ceil(gap),
    };
  }

  // Currency is met. Check if it's about to lapse.
  if (
    c.status === "expiring_soon" ||
    (c.days_remaining > 0 && c.days_remaining <= warningThresholdDays)
  ) {
    const deadline = formatDate(c.period_end);
    return {
      ruleId: c.rule_id,
      ruleName: c.rule_name,
      urgency: "soon",
      status: c.status,
      daysRemaining: c.days_remaining,
      message: `Currency lapses ${deadline} — fly ${eventLabel(
        c.required_event,
        Math.max(1, Math.ceil(c.required_count)),
      )} before then to extend`,
      detail: `${c.days_remaining} day${c.days_remaining === 1 ? "" : "s"} until oldest qualifying flight rolls out.`,
      byDate: c.period_end,
      gap: Math.max(1, Math.ceil(c.required_count)),
    };
  }

  return null;
}

export function buildForecasts(
  currencies: ComputedCurrency[],
): CurrencyForecast[] {
  const out: CurrencyForecast[] = [];
  for (const c of currencies) {
    const f = buildForecast(c);
    if (f) out.push(f);
  }
  // Sort: expired first, then by days_remaining ascending (most urgent first)
  out.sort((a, b) => {
    const urgencyRank: Record<ForecastUrgency, number> = {
      expired: 0,
      soon: 1,
      comfortable: 2,
    };
    if (urgencyRank[a.urgency] !== urgencyRank[b.urgency]) {
      return urgencyRank[a.urgency] - urgencyRank[b.urgency];
    }
    return a.daysRemaining - b.daysRemaining;
  });
  return out;
}
