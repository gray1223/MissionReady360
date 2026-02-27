import { format } from "date-fns";
import { Plane, Clock, MapPin, Moon, Eye, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { Flight, AircraftType } from "@/lib/types/database";

interface FlightCardProps {
  flight: Flight & { aircraft_type?: AircraftType | null };
  onClick?: () => void;
}

export function FlightCard({ flight, onClick }: FlightCardProps) {
  const conditionBadge = {
    day: { variant: "default" as const, label: "Day" },
    night: { variant: "warning" as const, label: "Night" },
    nvg: { variant: "info" as const, label: "NVG" },
    mixed: { variant: "default" as const, label: "Mixed" },
  };

  const condition = conditionBadge[flight.flight_condition] || conditionBadge.day;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors",
        onClick && "cursor-pointer hover:border-slate-700 hover:bg-slate-900/80"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-100">
              {format(new Date(flight.flight_date), "dd MMM yyyy")}
            </span>
            <Badge variant={condition.variant}>{condition.label}</Badge>
            {flight.is_simulator && <Badge variant="info">SIM</Badge>}
            <Badge variant={flight.is_military_flight ? "success" : "default"}>
              {flight.is_military_flight ? "MIL" : "CIV"}
            </Badge>
            {flight.upt_grades?.progression_grade && (
              <Badge variant="info">
                {flight.upt_grades.progression_grade}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {flight.aircraft_type && (
              <span className="flex items-center gap-1">
                <Plane className="h-3.5 w-3.5" />
                {flight.aircraft_type.designation}
              </span>
            )}
            {flight.tail_number && (
              <span className="text-slate-500">#{flight.tail_number}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm font-medium text-slate-200">
            <Clock className="h-3.5 w-3.5" />
            {flight.total_time.toFixed(1)}h
          </div>
          {flight.sortie_type && (
            <span className="text-xs text-slate-500 capitalize">
              {flight.sortie_type.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {(flight.departure_icao || flight.arrival_icao) && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3" />
          {flight.departure_icao || "???"}
          {" → "}
          {flight.arrival_icao || "???"}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {flight.night_time > 0 && (
          <span className="flex items-center gap-1">
            <Moon className="h-3 w-3" /> {flight.night_time.toFixed(1)}h night
          </span>
        )}
        {flight.nvg_time > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {flight.nvg_time.toFixed(1)}h NVG
          </span>
        )}
        {flight.day_landings + flight.night_landings > 0 && (
          <span>
            {flight.day_landings + flight.night_landings} landing
            {flight.day_landings + flight.night_landings !== 1 ? "s" : ""}
          </span>
        )}
        {flight.approaches.length > 0 && (
          <span>{flight.approaches.length} approach{flight.approaches.length !== 1 ? "es" : ""}</span>
        )}
        {flight.carrier_traps > 0 && (
          <span>{flight.carrier_traps} trap{flight.carrier_traps !== 1 ? "s" : ""}</span>
        )}
        {flight.debrief_items && flight.debrief_items.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {flight.debrief_items.length} debrief
          </span>
        )}
      </div>
    </div>
  );
}
