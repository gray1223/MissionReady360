import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  LogbookMode,
  DebriefItem,
  DebriefItemStatus,
  UptGrades,
  AircraftType,
} from "@/lib/types/database";
import { DebriefPageClient } from "./debrief-page-client";

interface FlightWithAircraft {
  id: string;
  flight_date: string;
  debrief_items: DebriefItem[];
  upt_grades: UptGrades | null;
  aircraft_type: Pick<AircraftType, "designation"> | null;
}

export default async function DebriefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const uptEnabled = profile?.flight_log_preferences?.uptEnabled ?? false;

  const { data: rawFlights } = await supabase
    .from("flights")
    .select("id, flight_date, debrief_items, upt_grades, aircraft_type:aircraft_types(designation)")
    .eq("user_id", user.id)
    .order("flight_date", { ascending: false });

  const flights = (rawFlights || []) as unknown as FlightWithAircraft[];

  // Flatten debrief items with flight metadata
  type FlatItem = {
    flightId: string;
    flightDate: string;
    aircraftDesignation: string;
    itemIndex: number;
    category: string;
    item: string;
    resolution: string;
    status: DebriefItemStatus;
    hasUptGrades: boolean;
  };

  const flatItems: FlatItem[] = [];

  for (const flight of flights) {
    const items = (flight.debrief_items || []) as DebriefItem[];
    if (items.length === 0) continue;

    const designation =
      (flight.aircraft_type as any)?.designation ?? "Unknown";

    for (let i = 0; i < items.length; i++) {
      flatItems.push({
        flightId: flight.id,
        flightDate: flight.flight_date,
        aircraftDesignation: designation,
        itemIndex: i,
        category: items[i].category || "",
        item: items[i].item,
        resolution: items[i].resolution || "",
        status: items[i].status || "open",
        hasUptGrades: flight.upt_grades !== null,
      });
    }
  }

  // Aggregate stats
  const total = flatItems.length;
  const open = flatItems.filter((i) => i.status === "open").length;
  const inProgress = flatItems.filter((i) => i.status === "in_progress").length;
  const resolved = flatItems.filter((i) => i.status === "resolved").length;

  // Category breakdown
  const catMap = new Map<string, { open: number; total: number }>();
  for (const item of flatItems) {
    const cat = item.category || "Uncategorized";
    const entry = catMap.get(cat) || { open: 0, total: 0 };
    entry.total++;
    if (item.status === "open") entry.open++;
    catMap.set(cat, entry);
  }
  const categoryBreakdown = Array.from(catMap.entries())
    .map(([category, counts]) => ({ category, ...counts }))
    .sort((a, b) => b.total - a.total);

  // Unique categories for filter
  const uniqueCategories = Array.from(new Set(flatItems.map((i) => i.category).filter(Boolean))).sort();

  // UPT data (if enabled)
  type UptFlightData = { flightDate: string; grades: UptGrades };
  let uptFlights: UptFlightData[] = [];
  let belowMifOpen = 0;
  let belowMifResolved = 0;

  if (uptEnabled) {
    uptFlights = flights
      .filter((f) => f.upt_grades?.progression_grade)
      .map((f) => ({ flightDate: f.flight_date, grades: f.upt_grades! }))
      .reverse(); // chronological order

    const belowMifItems = flatItems.filter(
      (i) => i.category.toLowerCase() === "below mif"
    );
    belowMifOpen = belowMifItems.filter((i) => i.status !== "resolved").length;
    belowMifResolved = belowMifItems.filter((i) => i.status === "resolved").length;
  }

  return (
    <DebriefPageClient
      items={flatItems}
      stats={{ total, open, inProgress, resolved }}
      categoryBreakdown={categoryBreakdown}
      uniqueCategories={uniqueCategories}
      uptEnabled={uptEnabled}
      uptFlights={uptFlights}
      belowMifOpen={belowMifOpen}
      belowMifResolved={belowMifResolved}
    />
  );
}
