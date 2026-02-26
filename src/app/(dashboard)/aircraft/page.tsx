import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AircraftList } from "@/components/aircraft/aircraft-list";
import { AddAircraftButton } from "@/components/aircraft/add-aircraft-button";

export default async function AircraftPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: userAircraft }, { data: allAircraft }, { data: profile }] =
    await Promise.all([
      supabase
        .from("user_aircraft")
        .select("id, qualification_level, is_primary, aircraft_type_id, aircraft_types(id, designation, name, engine_count, engine_type)")
        .eq("user_id", user.id)
        .order("created_at"),
      supabase
        .from("aircraft_types")
        .select("*")
        .order("designation"),
      supabase
        .from("profiles")
        .select("primary_aircraft_id, branch")
        .eq("id", user.id)
        .single(),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aircraftRows = ((userAircraft || []) as any[]).map((ua) => ({
    ...ua,
    aircraft_types: Array.isArray(ua.aircraft_types)
      ? ua.aircraft_types[0]
      : ua.aircraft_types,
  }));

  // Filter available aircraft by user's branch if set
  const branch = profile?.branch;
  const available = (allAircraft || []).filter(
    (a) => !branch || !a.branch || a.branch === branch
  );

  const existingIds = aircraftRows.map((ua: any) => ua.aircraft_types?.id).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">My Aircraft</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your qualified aircraft types
          </p>
        </div>
        <AddAircraftButton
          availableAircraft={available}
          userId={user.id}
          existingAircraftIds={existingIds}
        />
      </div>

      <AircraftList
        userAircraft={aircraftRows}
        userId={user.id}
        primaryAircraftId={profile?.primary_aircraft_id || null}
      />
    </div>
  );
}
