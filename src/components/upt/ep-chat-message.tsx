import { cn } from "@/lib/utils/cn";
import type { EpMessage } from "@/lib/types/ep-practice";

interface EpChatMessageProps {
  message: EpMessage;
  isStreaming?: boolean;
}

/** Very basic markdown-ish rendering: bold, line breaks */
function renderContent(text: string) {
  // Strip phase markers from display
  const cleaned = text.replace(/\[PHASE:\s*\w+\]\s*/g, "");

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
      </div>
    </div>
  );
}
