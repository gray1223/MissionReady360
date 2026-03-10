import { AlertTriangle } from "lucide-react";

export function EpDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
      <div className="text-sm text-amber-200">
        <span className="font-semibold">Practice tool only.</span> This is not
        an authoritative source for T-6A emergency procedures. Always verify
        against official publications (-1, -1CL). Do not use for actual
        emergency response.
      </div>
    </div>
  );
}
