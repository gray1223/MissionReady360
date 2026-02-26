import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlightCard } from "@/components/flights/flight-card";
import { FlightsFilter } from "@/components/flights/flights-filter";

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("logbook_mode")
    .eq("id", user.id)
    .single();

  const params = await searchParams;
  const filter = params.filter || profile?.logbook_mode || "military";

  let query = supabase
    .from("flights")
    .select("*, aircraft_type:aircraft_types(*)")
    .eq("user_id", user.id)
    .order("flight_date", { ascending: false })
    .limit(50);

  if (filter === "military") {
    query = query.eq("is_military_flight", true);
  } else if (filter === "civilian") {
    query = query.eq("is_military_flight", false);
  }
  // "all" — no filter

  const { data: flights } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Flight Log</h2>
          <p className="mt-1 text-sm text-slate-400">
            View and manage your flight history
          </p>
        </div>
        <Link href="/flights/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Flight
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <FlightsFilter currentFilter={filter} />

      {!flights || flights.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 mb-4">
                <Plane className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">
                No flights logged yet
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Start logging your flights to track hours, currencies, and build
                your flight history.
              </p>
              <Link href="/flights/new" className="mt-6">
                <Button variant="outline">
                  <Plus className="h-4 w-4" />
                  Log Your First Flight
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flights.map((flight) => (
            <Link key={flight.id} href={`/flights/${flight.id}`}>
              <FlightCard flight={flight} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
