import type { Flight, AircraftType } from "@/lib/types/database";
import { createPdfDocument, finalizePdf } from "./pdf-theme";
import { addFlightLogTable } from "./pdf-tables";
import { ALL_COLUMNS } from "./columns";

export async function generateFlightLogPdf(
  flights: (Flight & { aircraft_type?: AircraftType | null })[],
  selectedColumnKeys: string[],
  title = "Flight Log"
) {
  const columns = ALL_COLUMNS.filter((c) =>
    selectedColumnKeys.includes(c.key)
  );

  const headers = columns.map((c) => c.header);
  const rows = flights.map((f) => columns.map((c) => c.format(f)));

  // Add totals row for numeric time/landing columns
  const timeKeys = new Set([
    "total_time", "pilot_time", "copilot_time", "pic_time", "sic_time",
    "solo_time", "dual_received_time", "instructor_time", "evaluator_time",
    "night_time", "nvg_time", "instrument_time", "sim_instrument_time", "xc_time",
  ]);
  const landingKeys = new Set([
    "day_landings", "night_landings", "nvg_landings", "full_stop_landings",
    "touch_and_go_landings", "carrier_traps", "carrier_bolters",
  ]);

  const totalsRow = columns.map((col, i) => {
    if (i === 0) return "TOTALS";
    if (timeKeys.has(col.key)) {
      const sum = flights.reduce(
        (acc, f) => acc + (Number((f as any)[col.key]) || 0),
        0
      );
      return sum > 0 ? sum.toFixed(1) : "";
    }
    if (landingKeys.has(col.key)) {
      const sum = flights.reduce(
        (acc, f) => acc + (Number((f as any)[col.key]) || 0),
        0
      );
      return sum > 0 ? String(sum) : "";
    }
    return "";
  });
  rows.push(totalsRow);

  const { doc, yPos } = await createPdfDocument(title, "landscape");
  await addFlightLogTable(doc, yPos, rows, headers);

  finalizePdf(doc, `MR360_${title.replace(/\s+/g, "_")}.pdf`);
}
