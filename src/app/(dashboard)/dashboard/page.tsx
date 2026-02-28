import Link from "next/link";
import { redirect } from "next/navigation";
import { format, subDays, startOfYear } from "date-fns";
import {
  Plane,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  GraduationCap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingProgressCard } from "@/components/dashboard/rating-progress-card";
import { computeRatingProgress } from "@/lib/flights/rating-progress";
import { InstallAppBanner } from "@/components/pwa/install-prompt";
import type { FlightLogPreferences, LogbookMode } from "@/lib/types/database";

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  current: "success",
  expiring_soon: "warning",
  expired: "danger",
};

const statusLabel: Record<string, string> = {
  current: "Current",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile, recent flights, all flights for hours, and currencies in parallel
  const now = new Date();
  const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");
  const ninetyDaysAgo = format(subDays(now, 90), "yyyy-MM-dd");
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");

  const [
    { data: profile },
    { data: currencies },
  ] = await Promise.all([
    supabase.from("profiles").select("callsign, first_name, last_name, logbook_mode, flight_log_preferences").eq("id", user.id).single(),
    supabase.rpc("compute_user_currencies", { p_user_id: user.id }),
  ]);

  const mode: LogbookMode = (profile?.logbook_mode as LogbookMode) || "military";
  const isMilitary = mode === "military";
  const isMilitaryFilter = isMilitary ? true : false;

  // Fetch mode-filtered flights for hours and recent
  const uptEnabled = !!(isMilitary && ((profile?.flight_log_preferences || {}) as FlightLogPreferences).uptEnabled);

  const [{ data: recentFlights }, { data: modeFlights }, { data: allFlights }, { data: uptFlights }] =
    await Promise.all([
      supabase
        .from("flights")
        .select(
          "id, flight_date, total_time, sortie_type, tail_number, aircraft_type_id, is_military_flight, upt_grades, aircraft_types(designation, name)"
        )
        .eq("user_id", user.id)
        .eq("is_military_flight", isMilitaryFilter)
        .order("flight_date", { ascending: false })
        .limit(5),
      supabase
        .from("flights")
        .select(
          "flight_date, total_time, night_time, instrument_time, sim_instrument_time, pic_time, xc_time, solo_time, dual_received_time, is_simulator, is_military_flight"
        )
        .eq("user_id", user.id)
        .eq("is_military_flight", isMilitaryFilter),
      // All flights (for rating progress — mil time counts toward FAA)
      supabase
        .from("flights")
        .select(
          "flight_date, total_time, night_time, instrument_time, sim_instrument_time, pic_time, xc_time, solo_time, dual_received_time, is_simulator"
        )
        .eq("user_id", user.id),
      // UPT graded flights (last 10)
      uptEnabled
        ? supabase
            .from("flights")
            .select("id, flight_date, upt_grades")
            .eq("user_id", user.id)
            .not("upt_grades", "is", null)
            .order("flight_date", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] }),
    ]);

  // Greeting: callsign (mil) or first name (civ)
  const greeting = isMilitary
    ? profile?.callsign ||
      user.user_metadata?.callsign ||
      user.email?.split("@")[0] ||
      "Pilot"
    : profile?.first_name || user.email?.split("@")[0] || "Pilot";

  const today = format(now, "EEEE, MMMM do, yyyy");

  // Compute hours from mode-filtered flights
  const flights = modeFlights || [];
  let last30 = 0,
    last90 = 0,
    ytd = 0,
    career = 0;
  let nightYtd = 0,
    instrumentYtd = 0,
    sortiesYtd = 0;

  for (const f of flights) {
    const total = Number(f.total_time) || 0;
    career += total;

    if (f.flight_date >= thirtyDaysAgo) last30 += total;
    if (f.flight_date >= ninetyDaysAgo) last90 += total;
    if (f.flight_date >= yearStart) {
      ytd += total;
      nightYtd += Number(f.night_time) || 0;
      instrumentYtd += Number(f.instrument_time) || 0;
      sortiesYtd += 1;
    }
  }

  // Preferences
  const flightLogPrefs = (profile?.flight_log_preferences || {}) as FlightLogPreferences;

  // Currency summary — military mode shows all, civilian mode shows FAA only
  const showFaa = flightLogPrefs.showFaaCurrencies ?? !isMilitary;
  const currencyList = (
    (currencies || []) as Array<{
      rule_name: string;
      status: string;
      days_remaining: number;
      is_faa: boolean;
    }>
  ).filter((c) => {
    if (!isMilitary) return c.is_faa; // Civilian: FAA only
    return showFaa || !c.is_faa; // Military: all (or mil-only if FAA disabled)
  });
  const currentCount = currencyList.filter(
    (c) => c.status === "current"
  ).length;
  const warningCount = currencyList.filter(
    (c) => c.status === "expiring_soon"
  ).length;
  const expiredCount = currencyList.filter(
    (c) => c.status === "expired"
  ).length;

  // Rating progress — ALWAYS uses all flights (mil time counts toward FAA ratings)
  const ratingFlights = allFlights || [];
  const ratingProgress =
    flightLogPrefs.showRatingProgress && flightLogPrefs.trackedRatings?.length
      ? computeRatingProgress(
          ratingFlights as never[],
          flightLogPrefs.trackedRatings,
          flightLogPrefs.priorHours
        )
      : [];
  const hasPriorHours = Object.values(flightLogPrefs.priorHours || {}).some(
    (v) => typeof v === "number" && v > 0
  );

  // UPT grade stats
  interface UptGradeData {
    progression_grade?: string | null;
    overall_grade?: string | null;
    upgrades?: number;
    downgrades?: number;
  }
  const uptGradedFlights = ((uptFlights || []) as Array<{ upt_grades: UptGradeData }>);
  let totalUpgrades = 0, totalDowngrades = 0;
  const gradeCounts: Record<string, number> = {};
  for (const f of uptGradedFlights) {
    const g = f.upt_grades;
    if (!g) continue;
    totalUpgrades += g.upgrades || 0;
    totalDowngrades += g.downgrades || 0;
    if (g.progression_grade) {
      gradeCounts[g.progression_grade] = (gradeCounts[g.progression_grade] || 0) + 1;
    }
  }
  const lastGrade = uptGradedFlights[0]?.upt_grades;
  const mostCommonGrade = Object.entries(gradeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Format recent flights for display — Supabase joins return arrays
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recent = ((recentFlights || []) as any[]).map((f) => ({
    ...f,
    aircraft_types: Array.isArray(f.aircraft_types)
      ? f.aircraft_types[0] ?? null
      : f.aircraft_types ?? null,
  })) as Array<{
    id: string;
    flight_date: string;
    total_time: number;
    sortie_type: string | null;
    tail_number: string | null;
    aircraft_type_id: string | null;
    is_military_flight: boolean;
    aircraft_types: { designation: string; name: string } | null;
  }>;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">
          Welcome back, {greeting}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{today}</p>
      </div>

      {/* Install App Banner */}
      <InstallAppBanner />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/flights/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            Log New Flight
          </Button>
        </Link>
        <Link href="/currencies">
          <Button variant="outline" size="md">
            <Clock className="h-4 w-4" />
            View All Currencies
          </Button>
        </Link>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Currency Overview
                </span>
              </CardTitle>
              <Link
                href="/currencies"
                className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {currencyList.length > 0 ? (
              <>
                {/* Summary badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="success">{currentCount} Current</Badge>
                  <Badge variant="warning">{warningCount} Expiring</Badge>
                  <Badge variant="danger">{expiredCount} Expired</Badge>
                </div>

                {/* Currency list */}
                <div className="space-y-2.5">
                  {currencyList.map((currency) => (
                    <div
                      key={currency.rule_name}
                      className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-slate-800/30 px-3 py-2"
                    >
                      <span className="text-sm text-slate-300 min-w-0 truncate">
                        {currency.rule_name}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {currency.days_remaining > 0
                            ? `${currency.days_remaining}d remaining`
                            : `${Math.abs(currency.days_remaining)}d overdue`}
                        </span>
                        <Badge
                          variant={
                            statusVariant[currency.status] || "default"
                          }
                        >
                          {statusLabel[currency.status] || currency.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-slate-700 mb-2" />
                <p className="text-sm text-slate-400">
                  No currency rules configured
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add aircraft to get currency tracking
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hours Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {isMilitary ? "Military" : "Civilian"} Flight Hours
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-lg bg-slate-800/30 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {last30.toFixed(1)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">Last 30d</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {last90.toFixed(1)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">Last 90d</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-slate-100">
                  {ytd.toFixed(1)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">Year to Date</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {isMilitary ? "Career Military Hours" : "Career Civilian Hours"}
                </span>
                <span className="font-medium text-slate-200">
                  {career.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Night Hours (YTD)</span>
                <span className="font-medium text-slate-200">
                  {nightYtd.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Instrument Hours (YTD)</span>
                <span className="font-medium text-slate-200">
                  {instrumentYtd.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {isMilitary ? "Sorties" : "Flights"} (YTD)
                </span>
                <span className="font-medium text-slate-200">
                  {sortiesYtd}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UPT Grade Summary */}
        {uptEnabled && uptGradedFlights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  UPT Grade Summary
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-800/30 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {lastGrade?.progression_grade || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Last Grade</p>
                </div>
                <div className="rounded-lg bg-slate-800/30 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-100">
                    {lastGrade?.overall_grade || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Last Overall</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Most Common Grade</span>
                  <span className="font-medium text-blue-400">{mostCommonGrade || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
                    Total Upgrades
                  </span>
                  <span className="font-medium text-emerald-400">{totalUpgrades}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-slate-400">
                    <ArrowDown className="h-3.5 w-3.5 text-red-400" />
                    Total Downgrades
                  </span>
                  <span className="font-medium text-red-400">{totalDowngrades}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Graded Flights</span>
                  <span className="font-medium text-slate-200">{uptGradedFlights.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Progress */}
        {ratingProgress.length > 0 && (
          <RatingProgressCard
            ratings={ratingProgress}
            hasPriorHours={hasPriorHours}
          />
        )}

        {/* Recent Flights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Recent {isMilitary ? "Military" : "Civilian"} Flights
                </span>
              </CardTitle>
              <Link
                href="/flights"
                className="text-xs text-slate-400 hover:text-primary flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length > 0 ? (
              <>
                {/* Mobile: card layout */}
                <div className="space-y-2 sm:hidden">
                  {recent.map((flight) => (
                    <Link
                      key={flight.id}
                      href={`/flights/${flight.id}`}
                      className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200">
                          {format(new Date(flight.flight_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {flight.aircraft_types?.designation || "—"}
                          {flight.sortie_type
                            ? ` \u00B7 ${flight.sortie_type.replace(/_/g, " ")}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 ml-3 text-sm font-medium text-slate-300">
                        {Number(flight.total_time).toFixed(1)}h
                      </span>
                    </Link>
                  ))}
                </div>
                {/* Desktop: table layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="pb-2 text-left font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Date
                          </span>
                        </th>
                        <th className="pb-2 text-left font-medium text-slate-400">
                          Aircraft
                        </th>
                        <th className="pb-2 text-right font-medium text-slate-400">
                          Duration
                        </th>
                        <th className="pb-2 pl-3 text-left font-medium text-slate-400">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((flight) => (
                        <tr
                          key={flight.id}
                          className="border-b border-slate-800/50 last:border-0"
                        >
                          <td className="py-2.5 text-slate-300">
                            {format(
                              new Date(flight.flight_date),
                              "MMM d, yyyy"
                            )}
                          </td>
                          <td className="py-2.5 text-slate-300">
                            {flight.aircraft_types?.designation || "—"}
                          </td>
                          <td className="py-2.5 text-right text-slate-300">
                            {Number(flight.total_time).toFixed(1)} hrs
                          </td>
                          <td className="py-2.5 pl-3">
                            <Badge
                              variant="default"
                              className="capitalize whitespace-nowrap"
                            >
                              {flight.sortie_type
                                ? flight.sortie_type.replace(/_/g, " ")
                                : "—"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Plane className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  No flights logged yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start by logging your first flight
                </p>
                <Link href="/flights/new" className="mt-4">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4" />
                    Log First Flight
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
