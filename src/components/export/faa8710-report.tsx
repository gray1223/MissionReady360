"use client";

import { useState, useMemo } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { Flight, AircraftType, Profile } from "@/lib/types/database";
import {
  aggregateByCategory,
  computeTotalsRow,
  mergePriorHours,
  type CategoryTotals,
} from "@/lib/export/faa8710-pdf";

interface Faa8710ReportProps {
  flights: (Flight & { aircraft_type?: AircraftType | null })[];
  profile: Profile;
}

export function Faa8710Report({ flights, profile }: Faa8710ReportProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includePrior, setIncludePrior] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => {
    let cats = aggregateByCategory(flights, fromDate || undefined, toDate || undefined);
    if (includePrior && profile.flight_log_preferences?.priorHours) {
      cats = mergePriorHours(cats, profile.flight_log_preferences.priorHours);
    }
    return cats;
  }, [flights, fromDate, toDate, includePrior, profile]);

  const totals = useMemo(() => computeTotalsRow(categories), [categories]);

  const pilotName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ") || "—";

  async function handleDownload() {
    setLoading(true);
    try {
      const { generateFaa8710Pdf } = await import("@/lib/export/faa8710-pdf");
      await generateFaa8710Pdf(categories, pilotName);
    } finally {
      setLoading(false);
    }
  }

  const num = (v: number) => (v > 0 ? v.toFixed(1) : "—");
  const int = (v: number) => (v > 0 ? String(v) : "—");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            FAA 8710-1 Section III
          </span>
        </CardTitle>
        <CardDescription>
          Flight time by aircraft category &amp; class for certificate
          applications. Includes all flights (military time counts toward FAA).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Input
                label="From"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Input
                label="To"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            {profile.flight_log_preferences?.priorHours && (
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={includePrior}
                  onChange={(e) => setIncludePrior(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                />
                <span className="text-sm text-slate-400">
                  Include prior hours
                </span>
              </label>
            )}
          </div>

          {/* Preview Table */}
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No flights match the selected criteria.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <Th align="left">Category/Class</Th>
                    <Th>Total</Th>
                    <Th>PIC</Th>
                    <Th>SIC</Th>
                    <Th>Solo</Th>
                    <Th>Dual</Th>
                    <Th>XC</Th>
                    <Th>Night</Th>
                    <Th>Inst</Th>
                    <Th>Day Ldg</Th>
                    <Th>Ngt Ldg</Th>
                    <Th>6 Mo</Th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.category}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="py-1.5 pr-3 text-slate-200 font-medium whitespace-nowrap">
                        {c.label}
                      </td>
                      <Td>{num(c.total_time)}</Td>
                      <Td>{num(c.pic)}</Td>
                      <Td>{num(c.sic)}</Td>
                      <Td>{num(c.solo)}</Td>
                      <Td>{num(c.dual_received)}</Td>
                      <Td>{num(c.xc)}</Td>
                      <Td>{num(c.night)}</Td>
                      <Td>
                        {num(c.instrument_actual + c.instrument_simulated)}
                      </Td>
                      <Td>{int(c.day_landings)}</Td>
                      <Td>{int(c.night_landings)}</Td>
                      <Td>{int(c.flights_last_6_months)}</Td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="border-t border-slate-600 font-bold">
                    <td className="py-1.5 pr-3 text-slate-100">TOTALS</td>
                    <Td bold>{num(totals.total_time)}</Td>
                    <Td bold>{num(totals.pic)}</Td>
                    <Td bold>{num(totals.sic)}</Td>
                    <Td bold>{num(totals.solo)}</Td>
                    <Td bold>{num(totals.dual_received)}</Td>
                    <Td bold>{num(totals.xc)}</Td>
                    <Td bold>{num(totals.night)}</Td>
                    <Td bold>
                      {num(
                        totals.instrument_actual + totals.instrument_simulated
                      )}
                    </Td>
                    <Td bold>{int(totals.day_landings)}</Td>
                    <Td bold>{int(totals.night_landings)}</Td>
                    <Td bold>{int(totals.flights_last_6_months)}</Td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Download */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleDownload}
              loading={loading}
              disabled={categories.length === 0}
            >
              <Download className="h-4 w-4" />
              Download 8710 PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      className={`py-1.5 px-1.5 text-xs text-slate-500 uppercase font-medium whitespace-nowrap ${
        align === "left" ? "text-left" : "text-center"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  bold,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td
      className={`py-1.5 px-1.5 text-center tabular-nums whitespace-nowrap ${
        bold ? "text-slate-100" : "text-slate-400"
      }`}
    >
      {children}
    </td>
  );
}
