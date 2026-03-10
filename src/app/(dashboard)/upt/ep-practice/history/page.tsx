import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import type { EpPracticeSession, EpPhase } from "@/lib/types/ep-practice";
import { EpSessionCard } from "@/components/upt/ep-session-card";
import { ArrowLeft, Plus } from "lucide-react";

export default async function EpHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("flight_log_preferences")
    .eq("id", user.id)
    .single();

  const profile = profileData as Pick<Profile, "flight_log_preferences"> | null;
  if (!profile?.flight_log_preferences?.uptEnabled) {
    redirect("/dashboard");
  }

  const { data: sessions } = await supabase
    .from("ep_practice_sessions")
    .select(
      "id, title, started_at, current_phase, duration_seconds, evaluation"
    )
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  const allSessions = (sessions || []) as Pick<
    EpPracticeSession,
    "id" | "title" | "started_at" | "current_phase" | "duration_seconds" | "evaluation"
  >[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/upt"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              EP Practice History
            </h2>
            <p className="text-xs text-slate-400">
              {allSessions.length} session{allSessions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/upt/ep-practice"
          className="flex items-center gap-1.5 rounded-lg bg-primary-button px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-button-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Link>
      </div>

      {allSessions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-sm text-slate-400">
            No EP practice sessions yet. Start your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allSessions.map((session) => (
            <EpSessionCard
              key={session.id}
              id={session.id}
              title={session.title}
              startedAt={session.started_at}
              durationSeconds={session.duration_seconds}
              currentPhase={session.current_phase as EpPhase}
              evaluation={session.evaluation as { overallScore: number } | null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
