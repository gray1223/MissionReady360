import { cn } from "@/lib/utils/cn";
import type { EpMessage } from "@/lib/types/ep-practice";
import { EpCwsPanel, type CwsLightId } from "./ep-cws-panel";

interface EpChatMessageProps {
  message: EpMessage;
  isStreaming?: boolean;
}

/** Parse [CWS: LIGHT1, LIGHT2, ...] marker from text */
function parseCwsMarker(text: string): { cleaned: string; lights: CwsLightId[] } {
  const match = text.match(/\[CWS:\s*([^\]]+)\]/);
  if (!match) return { cleaned: text, lights: [] };
  const lights = match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as CwsLightId[];
  const cleaned = text.replace(/\s*\[CWS:\s*[^\]]+\]\s*/g, "");
  return { cleaned, lights };
}

/** Very basic markdown-ish rendering: bold, line breaks */
function renderContent(text: string) {
  // Strip phase markers, CWS markers, and position markers from display
  const cleaned = text
    .replace(/\[PHASE:\s*\w+\]\s*/g, "")
    .replace(/\s*\[CWS:\s*[^\]]+\]\s*/g, "")
    .replace(/\s*\[POSITION:\s*[^\]]+\]\s*/g, "");

  return cleaned.split("\n").map((line, i) => {
    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });

    return (
      <span key={i}>
        {i > 0 && <br />}
        {rendered}
      </span>
    );
  });
}

export function EpChatMessage({ message, isStreaming }: EpChatMessageProps) {
  const isIp = message.role === "ip";
  const { lights: cwsLights } = isIp ? parseCwsMarker(message.content) : { lights: [] };

  return (
    <div
      className={cn(
        "flex w-full",
        isIp ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
          isIp
            ? "bg-slate-800 text-slate-200"
            : "bg-primary/10 text-slate-200 border border-primary/20"
        )}
      >
        {isIp && (
          <div className="mb-1 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
            IP
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">
          {renderContent(message.content)}
          {isStreaming && (
            <span className="inline-block ml-0.5 w-1.5 h-4 bg-emerald-400 animate-pulse align-middle" />
          )}
        </div>
        {cwsLights.length > 0 && !isStreaming && (
          <div className="mt-3 border-t border-slate-700 pt-3">
            <div className="mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Cockpit Annunciator Panel
            </div>
            <EpCwsPanel litLights={cwsLights} />
          </div>
        )}
      </div>
    </div>
  );
}
