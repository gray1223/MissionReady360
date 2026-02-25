import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FlightForm } from "@/components/flights/flight-form";

export default async function NewFlightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: aircraft }, { data: profile }] = await Promise.all([
    supabase.from("aircraft_types").select("*").order("designation"),
    supabase
      .from("profiles")
      .select("flight_log_preferences")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Log New Flight</h2>
        <p className="mt-1 text-sm text-slate-400">
          Record your flight details below
        </p>
      </div>
      <FlightForm
        aircraft={aircraft || []}
        preferences={profile?.flight_log_preferences}
      />
    </div>
  );
}
