"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flight, AircraftType } from "@/lib/types/database";

interface ExportFlightButtonProps {
  flight: Flight & { aircraft_type?: AircraftType | null };
}

export function ExportFlightButton({ flight }: ExportFlightButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { generateFlightPdf } = await import("@/lib/export/flight-pdf");
      await generateFlightPdf(flight);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} loading={loading}>
      <Download className="h-4 w-4" />
      PDF
    </Button>
  );
}
