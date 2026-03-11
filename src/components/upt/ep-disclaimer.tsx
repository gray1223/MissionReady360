import { AlertTriangle } from "lucide-react";

export function EpDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
      <div className="text-sm text-amber-200">
        <span className="font-semibold">Practice tool only — UNCLASS.</span> This
        system is not equipped to handle CUI or any controlled information.
        Reference data is not official source material and should not be used
        in place of actual resources or documents. Do not use for actual
        emergency response.
      </div>
    </div>
  );
}
