import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FlightForm } from "@/components/flights/flight-form";

export default async function NewFlightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aircraft } = await supabase
    .from("aircraft_types")
    .select("*")
    .order("designation");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Log New Flight</h2>
        <p className="mt-1 text-sm text-slate-400">
          Record your flight details below
        </p>
      </div>
      <FlightForm aircraft={aircraft || []} />
    </div>
  );
}
