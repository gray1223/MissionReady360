import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrackingClient } from "./tracking-client";

export default async function TrackingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Live Tracking</h2>
        <p className="mt-1 text-sm text-slate-400">
          Search live aircraft positions by callsign, registration, or flight
          number. Powered by Flightradar24.
        </p>
      </div>
      <TrackingClient />
    </div>
  );
}
