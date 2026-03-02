"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types/database";
import type { CareerStats, YtdStats } from "@/lib/export/summary-pdf";

interface ExportSummaryButtonProps {
  profile: Profile;
  career: CareerStats;
  ytd: YtdStats;
  year: number;
}

export function ExportSummaryButton({
  profile,
  career,
  ytd,
  year,
}: ExportSummaryButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { generateSummaryPdf } = await import("@/lib/export/summary-pdf");
      await generateSummaryPdf(profile, career, ytd, year);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} loading={loading}>
      <Download className="h-4 w-4" />
      Summary PDF
    </Button>
  );
}
