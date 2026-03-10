import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import type { EpPracticeSession, EpPhase, EpMessage, EpEvaluation } from "@/lib/types/ep-practice";
import { EpPhaseIndicator } from "@/components/upt/ep-phase-indicator";
import { EpChatMessage } from "@/components/upt/ep-chat-message";
import { EpDisclaimer } from "@/components/upt/ep-disclaimer";
import { ArrowLeft, Clock, Trophy } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
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

  const { data: sessionData } = await supabase
    .from("ep_practice_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!sessionData) notFound();

  const session = sessionData as unknown as EpPracticeSession;
  const messages = (session.messages || []) as EpMessage[];
  const evaluation = session.evaluation as EpEvaluation | null;

  return (
    <div className="space-y-4">
      <EpDisclaimer />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/upt/ep-practice/history"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {session.title}
            </h2>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
              <span>
                {new Date(session.started_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {session.duration_seconds != null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(session.duration_seconds)}
                </span>
              )}
            </div>
          </div>
        </div>
        {evaluation && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400">
            <Trophy className="h-4 w-4" />
            {evaluation.overallScore}/5
          </div>
        )}
      </div>

      {/* Phase indicator */}
      <EpPhaseIndicator
        currentPhase={session.current_phase as EpPhase}
        phasesCompleted={(session.phases_completed || []) as EpPhase[]}
      />

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <EpChatMessage key={i} message={msg} />
        ))}
      </div>

      {/* Evaluation */}
      {evaluation && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400">
            Session Evaluation
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {evaluation.boldfaceAccuracy && (
              <div>
                <span className="font-medium text-slate-300">Boldface: </span>
                <span className="text-slate-400">{evaluation.boldfaceAccuracy}</span>
              </div>
            )}
            {evaluation.aircraftControlAssessment && (
              <div>
                <span className="font-medium text-slate-300">Aircraft Control: </span>
                <span className="text-slate-400">{evaluation.aircraftControlAssessment}</span>
              </div>
            )}
            {evaluation.analysisQuality && (
              <div>
                <span className="font-medium text-slate-300">Analysis: </span>
                <span className="text-slate-400">{evaluation.analysisQuality}</span>
              </div>
            )}
            {evaluation.decisionMaking && (
              <div>
                <span className="font-medium text-slate-300">Decision Making: </span>
                <span className="text-slate-400">{evaluation.decisionMaking}</span>
              </div>
            )}
            {evaluation.communicationAssessment && (
              <div>
                <span className="font-medium text-slate-300">Communication: </span>
                <span className="text-slate-400">{evaluation.communicationAssessment}</span>
              </div>
            )}
          </div>
          {evaluation.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 mb-1">
                Strengths
              </h4>
              <ul className="list-disc list-inside text-sm text-slate-400 space-y-0.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {evaluation.areasForImprovement.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-amber-400 mb-1">
                Areas for Improvement
              </h4>
              <ul className="list-disc list-inside text-sm text-slate-400 space-y-0.5">
                {evaluation.areasForImprovement.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {evaluation.summary && (
            <p className="text-sm text-slate-400 pt-2 border-t border-emerald-500/20">
              {evaluation.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
