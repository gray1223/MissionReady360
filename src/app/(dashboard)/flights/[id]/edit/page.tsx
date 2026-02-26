import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FlightForm } from "@/components/flights/flight-form";

interface EditFlightPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFlightPage({ params }: EditFlightPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: flight }, { data: aircraft }, { data: profile }] =
    await Promise.all([
      supabase
        .from("flights")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),
      supabase.from("aircraft_types").select("*").order("designation"),
      supabase
        .from("profiles")
        .select("flight_log_preferences, logbook_mode")
        .eq("id", user.id)
        .single(),
    ]);

  if (!flight) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/flights/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Edit Flight</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update your flight details
          </p>
        </div>
      </div>
      <FlightForm
        aircraft={aircraft || []}
        initialData={flight}
        flightId={id}
        preferences={profile?.flight_log_preferences}
        logbookMode={profile?.logbook_mode || "military"}
      />
    </div>
  );
}
