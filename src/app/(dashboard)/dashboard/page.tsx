"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Plane,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/supabase-provider";

// Mock data for demonstration purposes
const mockCurrencies = [
  { name: "Instrument Currency", status: "current" as const, daysRemaining: 45 },
  { name: "Night Currency", status: "current" as const, daysRemaining: 72 },
  { name: "NVG Currency", status: "warning" as const, daysRemaining: 12 },
  { name: "Formation Lead", status: "current" as const, daysRemaining: 90 },
  { name: "Tactical Currency", status: "warning" as const, daysRemaining: 8 },
  { name: "Passenger Currency", status: "danger" as const, daysRemaining: -5 },
  { name: "BFM Currency", status: "current" as const, daysRemaining: 30 },
];

const mockRecentFlights = [
  { date: "2026-02-20", aircraft: "C-17A", duration: 4.2, type: "Local Training" },
  { date: "2026-02-17", aircraft: "C-17A", duration: 8.5, type: "Cross Country" },
  { date: "2026-02-14", aircraft: "C-17A", duration: 2.1, type: "Instrument" },
  { date: "2026-02-10", aircraft: "C-17A", duration: 6.3, type: "Formation" },
  { date: "2026-02-05", aircraft: "C-17A", duration: 3.8, type: "Local Training" },
];

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  current: "success",
  warning: "warning",
  danger: "danger",
};

const statusLabel: Record<string, string> = {
  current: "Current",
  warning: "Expiring Soon",
  danger: "Expired",
};

export default function DashboardPage() {
  const { user } = useUser();

  const callsign =
    user?.user_metadata?.callsign ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pilot";

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const currentCount = mockCurrencies.filter((c) => c.status === "current").length;
  const warningCount = mockCurrencies.filter((c) => c.status === "warning").length;
  const expiredCount = mockCurrencies.filter((c) => c.status === "danger").length;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">
          Welcome back, {callsign}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{today}</p>
      </div>

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
                  <Clock className="h-5 w-5 text-emerald-500" />
                  Currency Overview
                </span>
              </CardTitle>
              <Link
                href="/currencies"
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="success">{currentCount} Current</Badge>
              <Badge variant="warning">{warningCount} Expiring</Badge>
              <Badge variant="danger">{expiredCount} Expired</Badge>
            </div>

            {/* Currency list */}
            <div className="space-y-2.5">
              {mockCurrencies.map((currency) => (
                <div
                  key={currency.name}
                  className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2"
                >
                  <span className="text-sm text-slate-300">
                    {currency.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {currency.daysRemaining > 0
                        ? `${currency.daysRemaining}d remaining`
                        : `${Math.abs(currency.daysRemaining)}d overdue`}
                    </span>
                    <Badge variant={statusVariant[currency.status]}>
                      {statusLabel[currency.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hours Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Flight Hours Summary
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-800/30 p-4 text-center">
                <p className="text-2xl font-bold text-slate-100">24.9</p>
                <p className="mt-1 text-xs text-slate-400">Last 30 Days</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-4 text-center">
                <p className="text-2xl font-bold text-slate-100">68.3</p>
                <p className="mt-1 text-xs text-slate-400">Last 90 Days</p>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-4 text-center">
                <p className="text-2xl font-bold text-slate-100">142.7</p>
                <p className="mt-1 text-xs text-slate-400">Year to Date</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Career Hours</span>
                <span className="font-medium text-slate-200">1,247.3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Night Hours (YTD)</span>
                <span className="font-medium text-slate-200">28.5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Instrument Hours (YTD)</span>
                <span className="font-medium text-slate-200">18.2</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Sorties (YTD)</span>
                <span className="font-medium text-slate-200">34</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Flights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-emerald-500" />
                  Recent Flights
                </span>
              </CardTitle>
              <Link
                href="/flights"
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {mockRecentFlights.length > 0 ? (
              <div className="overflow-x-auto">
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
                      <th className="pb-2 text-left font-medium text-slate-400">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRecentFlights.map((flight, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="py-2.5 text-slate-300">
                          {format(new Date(flight.date), "MMM d, yyyy")}
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {flight.aircraft}
                        </td>
                        <td className="py-2.5 text-right text-slate-300">
                          {flight.duration.toFixed(1)} hrs
                        </td>
                        <td className="py-2.5">
                          <Badge variant="default">{flight.type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
