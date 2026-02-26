import { redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Clock,
  Shield,
  Plane,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import type { FlightLogPreferences, CurrencyStatus, LogbookMode } from "@/lib/types/database";

const statusVariant: Record<CurrencyStatus, "success" | "warning" | "danger"> = {
  current: "success",
  expiring_soon: "warning",
  expired: "danger",
};

const statusLabel: Record<CurrencyStatus, string> = {
  current: "Current",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
};

const statusIcon: Record<CurrencyStatus, typeof CheckCircle2> = {
  current: CheckCircle2,
  expiring_soon: AlertTriangle,
  expired: XCircle,
};

interface CurrencyRow {
  rule_id: string;
  rule_name: string;
  required_event: string;
  required_count: number;
  achieved_count: number;
  period_start: string;
  period_end: string;
  status: CurrencyStatus;
  days_remaining: number;
  is_faa: boolean;
  branch: string | null;
}

export default async function CurrenciesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: currencies }] = await Promise.all([
    supabase
      .from("profiles")
      .select("flight_log_preferences, logbook_mode")
      .eq("id", user.id)
      .single(),
    supabase.rpc("compute_user_currencies", { p_user_id: user.id }),
  ]);

  const mode: LogbookMode = (profile?.logbook_mode as LogbookMode) || "military";
  const isMilitary = mode === "military";
  const prefs = (profile?.flight_log_preferences || {}) as FlightLogPreferences;
  const showFaa = prefs.showFaaCurrencies ?? true;

  const all = ((currencies || []) as CurrencyRow[]).filter((c) => {
    if (!isMilitary) return c.is_faa; // Civilian: FAA only
    return showFaa || !c.is_faa; // Military: all (or mil-only if FAA disabled)
  });

  const faaCurrencies = all.filter((c) => c.is_faa);
  const militaryCurrencies = all.filter((c) => !c.is_faa);

  const currentCount = all.filter((c) => c.status === "current").length;
  const warningCount = all.filter((c) => c.status === "expiring_soon").length;
  const expiredCount = all.filter((c) => c.status === "expired").length;
  const overallPercent =
    all.length > 0 ? Math.round((currentCount / all.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            Currency Status
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Track your flight currency requirements and expiration dates
          </p>
        </div>
        <Link
          href="/settings"
          className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Settings
        </Link>
      </div>

      {all.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                <Clock className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">
                No currency data yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Complete your profile setup and add aircraft to see currency
                tracking. FAA currencies can be toggled in settings.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-900/20 border border-amber-800/50 px-4 py-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-400">
                  Add your aircraft type and qualifications to get started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4">
              <ProgressRing value={overallPercent} size={52} strokeWidth={5}>
                <span className="text-xs font-bold text-slate-200">
                  {overallPercent}%
                </span>
              </ProgressRing>
              <div>
                <p className="text-sm font-semibold text-slate-100">Overall</p>
                <p className="text-xs text-slate-500">
                  {currentCount}/{all.length} current
                </p>
              </div>
            </Card>
            <SummaryCard
              label="Current"
              count={currentCount}
              icon={CheckCircle2}
              color="text-emerald-400"
            />
            <SummaryCard
              label="Expiring"
              count={warningCount}
              icon={AlertTriangle}
              color="text-amber-400"
            />
            <SummaryCard
              label="Expired"
              count={expiredCount}
              icon={XCircle}
              color="text-red-400"
            />
          </div>

          {/* FAA Currencies */}
          {faaCurrencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    FAA Currencies
                  </span>
                </CardTitle>
                <CardDescription>
                  Federal Aviation Administration currency requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faaCurrencies.map((c) => (
                    <CurrencyItem key={c.rule_id} currency={c} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Military Currencies */}
          {militaryCurrencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Military Currencies
                  </span>
                </CardTitle>
                <CardDescription>
                  Branch-specific military currency requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {militaryCurrencies.map((c) => (
                    <CurrencyItem key={c.rule_id} currency={c} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: typeof CheckCircle2;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <div>
        <p className="text-xl font-bold text-slate-100">{count}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

function CurrencyItem({ currency }: { currency: CurrencyRow }) {
  const Icon = statusIcon[currency.status];
  const percent =
    currency.required_count > 0
      ? Math.min(
          Math.round((currency.achieved_count / currency.required_count) * 100),
          100
        )
      : 0;

  return (
    <div className="rounded-lg bg-slate-800/30 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-4 w-4 ${
              currency.status === "current"
                ? "text-emerald-400"
                : currency.status === "expiring_soon"
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          />
          <span className="text-sm font-medium text-slate-200">
            {currency.rule_name}
          </span>
          {currency.branch && (
            <Badge variant="default" className="text-[10px]">
              {currency.branch}
            </Badge>
          )}
        </div>
        <Badge variant={statusVariant[currency.status]}>
          {statusLabel[currency.status]}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">
            {currency.achieved_count} / {currency.required_count}{" "}
            {currency.required_event.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-slate-500">{percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700">
          <div
            className={`h-1.5 rounded-full transition-all ${
              percent >= 100
                ? "bg-emerald-500"
                : percent >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Period & countdown */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Period: {format(parseISO(currency.period_start), "MMM d, yyyy")} –{" "}
          {format(parseISO(currency.period_end), "MMM d, yyyy")}
        </span>
        <span>
          {currency.days_remaining > 0
            ? `${currency.days_remaining}d remaining`
            : `${Math.abs(currency.days_remaining)}d overdue`}
        </span>
      </div>
    </div>
  );
}
