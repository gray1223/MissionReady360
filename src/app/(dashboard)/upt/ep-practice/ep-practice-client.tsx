"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Square, ArrowLeft } from "lucide-react";
import { EpDisclaimer } from "@/components/upt/ep-disclaimer";
import { EpPhaseIndicator } from "@/components/upt/ep-phase-indicator";
import { EpChatMessage } from "@/components/upt/ep-chat-message";
import { EpSetupForm } from "@/components/upt/ep-setup-form";
import { EpAreaMap } from "@/components/upt/ep-area-map";
import { createEpSession, updateEpSession } from "../actions";
import {
  EP_PHASES,
  type AircraftPosition,
  type EpMessage,
  type EpPhase,
  type EpSetupData,
  type EpEvaluation,
} from "@/lib/types/ep-practice";

function parsePhaseFromText(text: string): EpPhase | null {
  const match = text.match(/\[PHASE:\s*(\w+)\]/);
  if (!match) return null;
  const phase = match[1] as EpPhase;
  return EP_PHASES.includes(phase) ? phase : null;
}

function parsePositionMarker(text: string): AircraftPosition | null {
  const match = text.match(/\[POSITION:\s*([^\]]+)\]/);
  if (!match) return null;
  const parts = match[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 4 || parts.some(isNaN)) return null;
  return { lat: parts[0], lon: parts[1], heading: parts[2], altitude: parts[3] };
}

function parseEvaluation(text: string): EpEvaluation | null {
  const evalMatch = text.match(/\[EVALUATION\]([\s\S]*?)\[\/EVALUATION\]/);
  if (!evalMatch) return null;

  const block = evalMatch[1];
  const get = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`, "i"));
    return m?.[1]?.trim() || "";
  };

  const scoreStr = get("Overall Score");
  const score = parseInt(scoreStr) || 3;

  return {
    overallScore: Math.min(5, Math.max(1, score)),
    boldfaceAccuracy: get("Boldface"),
    aircraftControlAssessment: get("Aircraft Control"),
    analysisQuality: get("Analysis"),
    decisionMaking: get("Decision Making"),
    communicationAssessment: get("Communication"),
    areasForImprovement: get("Improve")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    strengths: get("Strengths")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    summary: get("Summary"),
  };
}

export function EpPracticeClient() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<EpSetupData | null>(null);
  const [messages, setMessages] = useState<EpMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<EpPhase>("setup");
  const [phasesCompleted, setPhasesCompleted] = useState<EpPhase[]>([]);
  const [evaluation, setEvaluation] = useState<EpEvaluation | null>(null);
  const [aircraftPosition, setAircraftPosition] = useState<AircraftPosition | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-save periodically
  const saveSession = useCallback(
    async (
      msgs: EpMessage[],
      phase: EpPhase,
      completed: EpPhase[],
      eval_?: EpEvaluation | null
    ) => {
      if (!sessionId) return;
      try {
        const data: Parameters<typeof updateEpSession>[1] = {
          messages: msgs,
          currentPhase: phase,
          phasesCompleted: completed,
        };
        if (phase === "complete") {
          data.completedAt = new Date().toISOString();
          data.durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        }
        if (eval_) data.evaluation = eval_;
        await updateEpSession(sessionId, data);
      } catch {
        // Silent save failure
      }
    },
    [sessionId, startTime]
  );

  async function handleSetup(data: EpSetupData) {
    setSetupData(data);

    // Create session in DB
    const id = await createEpSession({
      title: `EP Practice — ${data.scenarioCategory === "random" ? "Random" : data.scenarioCategory}`,
      scenarioType: data.scenarioCategory,
      setupData: data,
    });
    setSessionId(id);

    // Immediately send initial request to get scenario
    setCurrentPhase("gather_info");
    sendToAI([], data, "gather_info");
  }

  async function sendToAI(
    currentMessages: EpMessage[],
    setup: EpSetupData,
    phase: EpPhase
  ) {
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    // Create placeholder IP message for streaming
    const streamingMsg: EpMessage = {
      role: "ip",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, streamingMsg];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/upt/ep-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages, // Don't include the placeholder
          setupData: setup,
          currentPhase: phase,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        streamingMsg.content = `Error: ${err.error || "Failed to get response"}`;
        setMessages([...currentMessages, streamingMsg]);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              accumulated += `\n[Error: ${parsed.error}]`;
            } else if (parsed.text) {
              accumulated += parsed.text;
            }
          } catch {
            // Skip malformed chunks
          }
        }

        streamingMsg.content = accumulated;
        setMessages([...currentMessages, { ...streamingMsg }]);
      }

      // Finalize message
      streamingMsg.content = accumulated;

      // Parse phase from response
      const detectedPhase = parsePhaseFromText(accumulated);
      let newPhase = phase;
      let newCompleted = [...phasesCompleted];

      if (detectedPhase && detectedPhase !== phase) {
        // Mark previous phase as completed
        if (!newCompleted.includes(phase)) {
          newCompleted.push(phase);
        }
        newPhase = detectedPhase;
      }

      // Check for position marker
      const pos = parsePositionMarker(accumulated);
      if (pos) setAircraftPosition(pos);

      // Check for evaluation
      const eval_ = parseEvaluation(accumulated);
      if (eval_) {
        setEvaluation(eval_);
        newPhase = "complete";
        if (!newCompleted.includes("land")) newCompleted.push("land");
        newCompleted.push("complete");
      }

      setCurrentPhase(newPhase);
      setPhasesCompleted(newCompleted);

      const finalMessages = [...currentMessages, streamingMsg];
      setMessages(finalMessages);

      // Auto-save
      if (sessionId) {
        saveSession(finalMessages, newPhase, newCompleted, eval_);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      streamingMsg.content =
        streamingMsg.content || "Failed to connect. Please try again.";
      setMessages([...currentMessages, streamingMsg]);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleSend() {
    if (!input.trim() || isStreaming || !setupData) return;

    const studentMsg: EpMessage = {
      role: "student",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, studentMsg];
    setMessages(updatedMessages);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    sendToAI(updatedMessages, setupData, currentPhase);
  }

  function handleEnd() {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (sessionId && messages.length > 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      updateEpSession(sessionId, {
        messages,
        currentPhase,
        phasesCompleted,
        durationSeconds: duration,
      });
    }

    router.push("/upt");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-resize textarea
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  // Setup form
  if (!setupData) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <EpDisclaimer />
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-1">
            EP Practice Setup
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Configure your tabletop EP session parameters.
          </p>
          <EpSetupForm onSubmit={handleSetup} />
        </div>
      </div>
    );
  }

  // Chat UI
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <EpDisclaimer />

      <div className="mt-2 flex items-center gap-3">
        <EpPhaseIndicator
          currentPhase={currentPhase}
          phasesCompleted={phasesCompleted}
        />
      </div>

      {/* Brevity shortcuts hint */}
      <div className="mt-1 px-1 text-[11px] text-slate-500">
        Brevity: <span className="text-slate-400 font-medium">BPWANTFACTS?</span> = full setup dump &middot; <span className="text-slate-400 font-medium">MATL</span> = take aircraft &rarr; MAC &middot; <span className="text-slate-400 font-medium">Skip</span> = reveal remaining &rarr; next phase
      </div>

      {/* Collapsible training area map */}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-400 transition-colors select-none">
          Training Area Map
        </summary>
        <div className="mt-1">
          <EpAreaMap runway={setupData.runway} aircraft={aircraftPosition} compact />
        </div>
      </details>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3 px-1">
        {messages.map((msg, i) => (
          <EpChatMessage
            key={i}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "ip"}
            runway={setupData.runway}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Evaluation display */}
      {evaluation && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-bold text-emerald-400 mb-2">
            Session Evaluation — {evaluation.overallScore}/5
          </h3>
          <div className="grid gap-2 text-xs text-slate-300">
            {evaluation.strengths.length > 0 && (
              <div>
                <span className="font-semibold text-emerald-400">Strengths: </span>
                {evaluation.strengths.join(", ")}
              </div>
            )}
            {evaluation.areasForImprovement.length > 0 && (
              <div>
                <span className="font-semibold text-amber-400">Improve: </span>
                {evaluation.areasForImprovement.join(", ")}
              </div>
            )}
            {evaluation.summary && (
              <p className="text-slate-400 mt-1">{evaluation.summary}</p>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      {currentPhase !== "complete" && (
        <div className="mt-3 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Respond to the IP..."
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-lg bg-primary-button px-3 py-2.5 text-white hover:bg-primary-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            onClick={handleEnd}
            className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-red-400 hover:bg-red-500/20 transition-colors"
            aria-label="End session"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Completed — return button */}
      {currentPhase === "complete" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => router.push("/upt")}
            className="flex items-center gap-2 rounded-lg bg-primary-button px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-button-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to UPT Hub
          </button>
          {sessionId && (
            <button
              onClick={() => router.push(`/upt/ep-practice/${sessionId}`)}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              View Session Details
            </button>
          )}
        </div>
      )}
    </div>
  );
}
