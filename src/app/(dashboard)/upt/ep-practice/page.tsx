import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { EpPracticeClient } from "./ep-practice-client";

export default async function EpPracticePage() {
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
  if (!profile?.flight_log_preferences?.uptEnabled) {
    redirect("/dashboard");
  }

  return (
    <EpPracticeClient
      callsign={profile.callsign || "Student"}
    />
  );
}
