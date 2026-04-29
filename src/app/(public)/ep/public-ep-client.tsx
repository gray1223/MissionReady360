"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, RotateCcw } from "lucide-react";
import { EpDisclaimer } from "@/components/upt/ep-disclaimer";
import { EpPhaseIndicator } from "@/components/upt/ep-phase-indicator";
import { EpChatMessage } from "@/components/upt/ep-chat-message";
import { EpSetupForm } from "@/components/upt/ep-setup-form";
import { EpAreaMap } from "@/components/upt/ep-area-map";
import { EpShortcutButtons } from "@/components/upt/ep-shortcut-buttons";
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

export function PublicEpClient() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [setupData, setSetupData] = useState<EpSetupData | null>(null);
  const [messages, setMessages] = useState<EpMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<EpPhase>("setup");
  const [phasesCompleted, setPhasesCompleted] = useState<EpPhase[]>([]);
  const [evaluation, setEvaluation] = useState<EpEvaluation | null>(null);
  const [aircraftPosition, setAircraftPosition] = useState<AircraftPosition | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setAuthError("");
    setAuthenticated(true);
  }

  async function handleSetup(data: EpSetupData) {
    setSetupData(data);
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

    const streamingMsg: EpMessage = {
      role: "ip",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, streamingMsg];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/public/ep-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          messages: currentMessages,
          setupData: setup,
          currentPhase: phase,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        if (res.status === 401) {
          setAuthenticated(false);
          setAuthError("Invalid password. Please try again.");
          setSetupData(null);
          setMessages([]);
          setCurrentPhase("setup");
          setPhasesCompleted([]);
          setIsStreaming(false);
          return;
        }
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

      streamingMsg.content = accumulated;

      const detectedPhase = parsePhaseFromText(accumulated);
      let newPhase = phase;
      let newCompleted = [...phasesCompleted];

      if (detectedPhase && detectedPhase !== phase) {
        if (!newCompleted.includes(phase)) {
          newCompleted.push(phase);
        }
        newPhase = detectedPhase;
      }

      const pos = parsePositionMarker(accumulated);
      if (pos) setAircraftPosition(pos);

      const eval_ = parseEvaluation(accumulated);
      if (eval_) {
        setEvaluation(eval_);
        newPhase = "complete";
        if (!newCompleted.includes("land")) newCompleted.push("land");
        newCompleted.push("complete");
      }

      setCurrentPhase(newPhase);
      setPhasesCompleted(newCompleted);
      setMessages([...currentMessages, streamingMsg]);
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
    sendStudentMessage(input.trim());
  }

  function sendStudentMessage(text: string) {
    if (!setupData) return;

    const studentMsg: EpMessage = {
      role: "student",
      content: text,
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

  function handleShortcut(text: string) {
    if (isStreaming || !setupData) return;
    sendStudentMessage(text);
  }

  function handleEnd() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    window.location.reload();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  // Password gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100">EP Practice</h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter the access password to begin.
            </p>
          </div>
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
          >
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-sm text-red-400">{authError}</p>
            )}
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full rounded-lg bg-primary-button px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Setup form
  if (!setupData) {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4 pt-8">
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
    <div className="flex flex-col h-screen p-4">
      <EpDisclaimer />

      <div className="mt-2 flex items-center gap-3">
        <EpPhaseIndicator
          currentPhase={currentPhase}
          phasesCompleted={phasesCompleted}
        />
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
        <div className="mt-3 space-y-2">
          <EpShortcutButtons
            currentPhase={currentPhase}
            isStreaming={isStreaming}
            onShortcut={handleShortcut}
          />
          <div className="flex items-end gap-2">
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
        </div>
      )}

      {/* Completed — new session button */}
      {currentPhase === "complete" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg bg-primary-button px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-button-hover transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            New Session
          </button>
        </div>
      )}
    </div>
  );
}
