import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Trash2, ArrowLeft, Plane, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteFlightButton } from "./delete-button";

interface FlightDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlightDetailPage({ params }: FlightDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: flight } = await supabase
    .from("flights")
    .select("*, aircraft_type:aircraft_types(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!flight) notFound();

  const conditionVariant = {
    day: "default" as const,
    night: "warning" as const,
    nvg: "info" as const,
    mixed: "default" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/flights">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Flight Details</h2>
            <p className="text-sm text-slate-400">
              {format(new Date(flight.flight_date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/flights/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteFlightButton flightId={id} />
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Aircraft</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-200">
                <Plane className="h-3.5 w-3.5" />
                {flight.aircraft_type?.designation || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Tail Number</p>
              <p className="mt-1 text-sm text-slate-200">{flight.tail_number || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Total Time</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-200">
                <Clock className="h-3.5 w-3.5" />
                {Number(flight.total_time).toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Condition</p>
              <Badge variant={conditionVariant[flight.flight_condition as keyof typeof conditionVariant]}>
                {flight.flight_condition}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Route</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-200">
                <MapPin className="h-3.5 w-3.5" />
                {flight.departure_icao || "?"} → {flight.arrival_icao || "?"}
              </p>
            </div>
            {flight.sortie_type && (
              <div>
                <p className="text-xs text-slate-500 uppercase">Sortie Type</p>
                <p className="mt-1 text-sm text-slate-200 capitalize">
                  {flight.sortie_type.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {flight.crew_position && (
              <div>
                <p className="text-xs text-slate-500 uppercase">Crew Position</p>
                <p className="mt-1 text-sm text-slate-200 capitalize">
                  {flight.crew_position.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {flight.mission_number && (
              <div>
                <p className="text-xs text-slate-500 uppercase">Mission #</p>
                <p className="mt-1 text-sm text-slate-200">{flight.mission_number}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Time Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {[
              { label: "Pilot", value: flight.pilot_time },
              { label: "Copilot", value: flight.copilot_time },
              { label: "Instructor", value: flight.instructor_time },
              { label: "Evaluator", value: flight.evaluator_time },
              { label: "Night", value: flight.night_time },
              { label: "NVG", value: flight.nvg_time },
              { label: "Instrument", value: flight.instrument_time },
              { label: "Sim Instrument", value: flight.sim_instrument_time },
              { label: "PIC", value: flight.pic_time },
              { label: "SIC", value: flight.sic_time },
              { label: "XC", value: flight.xc_time },
              { label: "Solo", value: flight.solo_time },
              { label: "Dual Received", value: flight.dual_received_time },
            ]
              .filter((item) => Number(item.value) > 0)
              .map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500 uppercase">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {Number(item.value).toFixed(1)}h
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Landings */}
      {(flight.day_landings > 0 ||
        flight.night_landings > 0 ||
        flight.full_stop_landings > 0 ||
        flight.touch_and_go_landings > 0 ||
        flight.carrier_traps > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Landings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {[
                { label: "Day", value: flight.day_landings },
                { label: "Night", value: flight.night_landings },
                { label: "NVG", value: flight.nvg_landings },
                { label: "Full Stop", value: flight.full_stop_landings },
                { label: "Touch & Go", value: flight.touch_and_go_landings },
                { label: "Carrier Traps", value: flight.carrier_traps },
                { label: "Bolters", value: flight.carrier_bolters },
              ]
                .filter((item) => Number(item.value) > 0)
                .map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-slate-500 uppercase">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approaches */}
      {flight.approaches && (flight.approaches as unknown[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(flight.approaches as { type: string; runway: string; airport: string }[]).map(
                (approach, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-slate-800/30 px-3 py-2 text-sm"
                  >
                    <Badge>{approach.type}</Badge>
                    {approach.runway && (
                      <span className="text-slate-400">Rwy {approach.runway}</span>
                    )}
                    {approach.airport && (
                      <span className="text-slate-500">{approach.airport}</span>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remarks */}
      {flight.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{flight.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
