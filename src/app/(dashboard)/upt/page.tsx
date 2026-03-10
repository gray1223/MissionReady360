import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import type { EpPracticeSession } from "@/lib/types/ep-practice";
import { Zap, BookOpen, Clock, Trophy } from "lucide-react";

export default async function UptPage() {
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

  // Get recent EP sessions
  const { data: recentSessions } = await supabase
    .from("ep_practice_sessions")
    .select("id, title, started_at, current_phase, duration_seconds, evaluation")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const sessions = (recentSessions || []) as Pick<
    EpPracticeSession,
    "id" | "title" | "started_at" | "current_phase" | "duration_seconds" | "evaluation"
  >[];

  const completedCount = sessions.filter((s) => s.current_phase === "complete").length;
  const avgScore =
    sessions
      .filter((s) => s.evaluation?.overallScore)
      .reduce((sum, s) => sum + (s.evaluation?.overallScore ?? 0), 0) /
      (sessions.filter((s) => s.evaluation?.overallScore).length || 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">UPT Training Tools</h2>
        <p className="mt-1 text-sm text-slate-400">
          Practice tools for Undergraduate Pilot Training
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* EP Practice */}
        <Link
          href="/upt/ep-practice"
          className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-emerald-500/40 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">EP Practice</h3>
              <p className="text-xs text-slate-400">
                Tabletop emergency procedure practice with AI IP
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Work through structured EP flows: BPWANTFACTS, Maintain Aircraft
            Control, Analyze, Take Action, Land ASAP.
          </p>
        </Link>

        {/* Shotgun (coming soon) */}
        <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-5 opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/30 text-slate-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-400">Shotgun Quiz</h3>
              <p className="text-xs text-slate-500">Coming soon</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Quick-fire boldface, ops limits, and systems knowledge quiz.
          </p>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">
              Recent EP Sessions
            </h3>
            <Link
              href="/upt/ep-practice/history"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Sessions
              </div>
              <p className="mt-1 text-lg font-bold text-slate-200">
                {sessions.length}
              </p>
            </div>
            {completedCount > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Trophy className="h-3.5 w-3.5" />
                  Avg Score
                </div>
                <p className="mt-1 text-lg font-bold text-slate-200">
                  {avgScore.toFixed(1)}/5
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/upt/ep-practice/${session.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {session.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(session.started_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {session.evaluation?.overallScore && (
                  <span className="text-sm font-bold text-emerald-400">
                    {session.evaluation.overallScore}/5
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
