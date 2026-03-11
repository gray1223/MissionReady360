import { cn } from "@/lib/utils/cn";
import type { EpMessage, EyebrowLightId } from "@/lib/types/ep-practice";
import { EpEyebrowPanel, EpCwsPanel, type CwsLightId } from "./ep-cws-panel";

interface EpChatMessageProps {
  message: EpMessage;
  isStreaming?: boolean;
}

/** Parse [EYEBROW: LIGHT1, LIGHT2, ...] marker from text */
function parseEyebrowMarker(text: string): {
  cleaned: string;
  lights: EyebrowLightId[];
} {
  const match = text.match(/\[EYEBROW:\s*([^\]]+)\]/);
  if (!match) return { cleaned: text, lights: [] };
  const lights = match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as EyebrowLightId[];
  const cleaned = text.replace(/\s*\[EYEBROW:\s*[^\]]+\]\s*/g, "");
  return { cleaned, lights };
}

/** Parse [CWS: LIGHT1, LIGHT2, ...] marker from text */
function parseCwsMarker(text: string): {
  cleaned: string;
  lights: CwsLightId[];
} {
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
  // Strip phase markers, CWS markers, eyebrow markers, and position markers from display
  const cleaned = text
    .replace(/\[PHASE:\s*\w+\]\s*/g, "")
    .replace(/\s*\[CWS:\s*[^\]]+\]\s*/g, "")
    .replace(/\s*\[EYEBROW:\s*[^\]]+\]\s*/g, "")
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

  // Parse both panel markers (only from IP messages)
  const { lights: eyebrowLights } = isIp
    ? parseEyebrowMarker(message.content)
    : { lights: [] as EyebrowLightId[] };
  const { lights: cwsLights } = isIp
    ? parseCwsMarker(message.content)
    : { lights: [] as CwsLightId[] };

  const hasPanel = (eyebrowLights.length > 0 || cwsLights.length > 0) && !isStreaming;

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
        {hasPanel && (
          <div className="mt-3 border-t border-slate-700 pt-3 space-y-3">
            {eyebrowLights.length > 0 && (
              <div>
                <div className="mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Glareshield Eyebrow Lights
                </div>
                <EpEyebrowPanel litLights={eyebrowLights} />
              </div>
            )}
            {cwsLights.length > 0 && (
              <div>
                <div className="mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  CWS Annunciator Panel
                </div>
                <EpCwsPanel litLights={cwsLights} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
