"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleCurrencyDisabled } from "@/app/(dashboard)/settings/actions";

interface HideCurrencyButtonProps {
  ruleId: string;
}

export function HideCurrencyButton({ ruleId }: HideCurrencyButtonProps) {
  const [hiding, setHiding] = useState(false);
  const router = useRouter();

  async function handleHide() {
    setHiding(true);
    await toggleCurrencyDisabled(ruleId, true);
    router.refresh();
  }

  return (
    <button
      onClick={handleHide}
      disabled={hiding}
      title="Hide this currency"
      className="rounded p-1 text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
    >
      <EyeOff className="h-3.5 w-3.5" />
    </button>
  );
}
