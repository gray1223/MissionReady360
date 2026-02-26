import { redirect } from "next/navigation";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Plane,
  Moon,
  Gauge,
  Calendar,
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

import type { LogbookMode } from "@/lib/types/database";

interface FlightRow {
  flight_date: string;
  total_time: number;
  night_time: number;
  instrument_time: number;
  sim_instrument_time: number;
  pic_time: number;
  sic_time: number;
  xc_time: number;
  solo_time: number;
  dual_received_time: number;
  instructor_time: number;
  combat_time: number;
  sortie_type: string | null;
  is_simulator: boolean;
  is_military_flight: boolean;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("logbook_mode")
    .eq("id", user.id)
    .single();

  const mode: LogbookMode = (profileData?.logbook_mode as LogbookMode) || "military";
  const isMilitary = mode === "military";

  const { data: rawFlights } = await supabase
    .from("flights")
    .select(
      "flight_date, total_time, night_time, instrument_time, sim_instrument_time, pic_time, sic_time, xc_time, solo_time, dual_received_time, instructor_time, combat_time, sortie_type, is_simulator, is_military_flight"
    )
    .eq("user_id", user.id)
    .order("flight_date", { ascending: true });

  // Default to current mode filter
  const allFlightRows = (rawFlights || []) as FlightRow[];
  const flights = allFlightRows.filter((f) =>
    isMilitary ? f.is_military_flight : !f.is_military_flight
  );

  if (flights.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Reports</h2>
          <p className="mt-1 text-sm text-slate-400">
            Flight analytics, trends, and hour breakdowns
          </p>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                <BarChart3 className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">
                No flight data yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Log flights to see analytics, hour breakdowns, and trends here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Compute totals
  const now = new Date();
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");
  let career = { total: 0, night: 0, instrument: 0, pic: 0, sic: 0, xc: 0, solo: 0, dual: 0, instructor: 0, combat: 0, sorties: 0, simHours: 0 };
  let ytd = { total: 0, night: 0, instrument: 0, pic: 0, xc: 0, sorties: 0 };

  for (const f of flights) {
    const total = Number(f.total_time) || 0;
    const night = Number(f.night_time) || 0;
    const instrument = (Number(f.instrument_time) || 0) + (Number(f.sim_instrument_time) || 0);
    const pic = Number(f.pic_time) || 0;
    const sic = Number(f.sic_time) || 0;
    const xc = Number(f.xc_time) || 0;
    const solo = Number(f.solo_time) || 0;
    const dual = Number(f.dual_received_time) || 0;
    const instr = Number(f.instructor_time) || 0;
    const combat = Number(f.combat_time) || 0;

    career.total += total;
    career.night += night;
    career.instrument += instrument;
    career.pic += pic;
    career.sic += sic;
    career.xc += xc;
    career.solo += solo;
    career.dual += dual;
    career.instructor += instr;
    career.combat += combat;
    career.sorties += 1;
    if (f.is_simulator) career.simHours += total;

    if (f.flight_date >= yearStart) {
      ytd.total += total;
      ytd.night += night;
      ytd.instrument += instrument;
      ytd.pic += pic;
      ytd.xc += xc;
      ytd.sorties += 1;
    }
  }

  // Monthly breakdown for last 12 months
  const months: { label: string; hours: number; sorties: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const mStart = format(startOfMonth(monthDate), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(monthDate), "yyyy-MM-dd");
    const label = format(monthDate, "MMM yyyy");

    let hours = 0;
    let sorties = 0;
    for (const f of flights) {
      if (f.flight_date >= mStart && f.flight_date <= mEnd) {
        hours += Number(f.total_time) || 0;
        sorties += 1;
      }
    }
    months.push({ label, hours, sorties });
  }

  const maxMonthHours = Math.max(...months.map((m) => m.hours), 1);

  // Sortie type breakdown
  const typeMap = new Map<string, number>();
  for (const f of flights) {
    const t = f.sortie_type || "unspecified";
    typeMap.set(t, (typeMap.get(t) || 0) + 1);
  }
  const sortieTypes = Array.from(typeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Reports</h2>
        <p className="mt-1 text-sm text-slate-400">
          Flight analytics, trends, and hour breakdowns
        </p>
      </div>

      {/* Career Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Plane} label="Total Sorties" value={career.sorties.toString()} />
        <StatCard icon={Clock} label="Total Hours" value={career.total.toFixed(1)} />
        <StatCard icon={Moon} label="Night Hours" value={career.night.toFixed(1)} />
        <StatCard icon={Gauge} label="Instrument" value={career.instrument.toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Hour Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Career Hour Breakdown
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <HourRow label="PIC" hours={career.pic} total={career.total} />
              <HourRow label="SIC" hours={career.sic} total={career.total} />
              <HourRow label="Cross-Country" hours={career.xc} total={career.total} />
              <HourRow label="Night" hours={career.night} total={career.total} />
              <HourRow label="Instrument" hours={career.instrument} total={career.total} />
              <HourRow label="Solo" hours={career.solo} total={career.total} />
              <HourRow label="Dual Received" hours={career.dual} total={career.total} />
              <HourRow label="Instructor" hours={career.instructor} total={career.total} />
              {career.combat > 0 && (
                <HourRow label="Combat" hours={career.combat} total={career.total} />
              )}
              {career.simHours > 0 && (
                <HourRow label="Simulator" hours={career.simHours} total={career.total} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Year to Date */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Year to Date ({format(now, "yyyy")})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-slate-800/30 p-3 text-center">
                <p className="text-xl font-bold text-slate-100">
                  {ytd.total.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">Hours</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 text-center">
                <p className="text-xl font-bold text-slate-100">
                  {ytd.sorties}
                </p>
                <p className="text-xs text-slate-500">Sorties</p>
              </div>
            </div>
            <div className="space-y-3">
              <HourRow label="PIC" hours={ytd.pic} total={ytd.total} />
              <HourRow label="Cross-Country" hours={ytd.xc} total={ytd.total} />
              <HourRow label="Night" hours={ytd.night} total={ytd.total} />
              <HourRow label="Instrument" hours={ytd.instrument} total={ytd.total} />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Hours (Last 12 Months)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-40">
              {months.map((m) => {
                const pct = (m.hours / maxMonthHours) * 100;
                return (
                  <div
                    key={m.label}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-slate-400">
                      {m.hours > 0 ? m.hours.toFixed(1) : ""}
                    </span>
                    <div className="w-full flex items-end h-28">
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all min-h-[2px]"
                        style={{ height: `${Math.max(pct, m.hours > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 -rotate-45 origin-top-left whitespace-nowrap">
                      {m.label.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sortie Type Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Sortie Type Breakdown
              </span>
            </CardTitle>
            <CardDescription>
              Distribution of sorties by mission type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {sortieTypes.map(([type, count]) => (
                <div
                  key={type}
                  className="rounded-lg bg-slate-800/30 p-3 text-center"
                >
                  <p className="text-lg font-bold text-slate-100">{count}</p>
                  <Badge variant="default" className="capitalize mt-1">
                    {type.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

function HourRow({
  label,
  hours,
  total,
}: {
  label: string;
  hours: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((hours / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-medium text-slate-300">
          {hours.toFixed(1)} hrs
          <span className="ml-1.5 text-slate-500">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700">
        <div
          className="h-1.5 rounded-full bg-primary/80 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
