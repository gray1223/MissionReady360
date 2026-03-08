import type { Flight, AircraftType } from "@/lib/types/database";
import { format } from "date-fns";
import { formatLabel, formatCondition } from "@/lib/utils/format";
import { createPdfDocument, finalizePdf } from "./pdf-theme";
import { addSectionHeader, addKeyValueTable } from "./pdf-tables";

export async function generateFlightPdf(
  flight: Flight & { aircraft_type?: AircraftType | null }
) {
  const { doc, yPos: startY } = await createPdfDocument(
    `Flight - ${format(new Date(flight.flight_date), "MM/dd/yyyy")}`,
    "portrait"
  );

  let y = startY;

  // Overview
  y = await addSectionHeader(doc, y, "OVERVIEW");
  y = await addKeyValueTable(doc, y, [
    { label: "Date", value: format(new Date(flight.flight_date), "EEEE, MMMM d, yyyy") },
    { label: "Aircraft", value: flight.aircraft_type?.designation || "—" },
    { label: "Tail Number", value: flight.tail_number || "—" },
    { label: "Route", value: `${flight.departure_icao || "?"} → ${flight.arrival_icao || "?"}` },
    ...(flight.route ? [{ label: "Via", value: flight.route }] : []),
    { label: "Condition", value: formatCondition(flight.flight_condition) },
    { label: "Total Time", value: `${Number(flight.total_time).toFixed(1)} hrs` },
    ...(flight.sortie_type ? [{ label: "Sortie Type", value: formatLabel(flight.sortie_type) }] : []),
    ...(flight.crew_position ? [{ label: "Crew Position", value: formatLabel(flight.crew_position) }] : []),
    ...(flight.mission_number ? [{ label: "Mission #", value: flight.mission_number }] : []),
  ]);

  // Time Breakdown
  const timeFields = [
    { label: "Pilot", value: flight.pilot_time },
    { label: "Copilot", value: flight.copilot_time },
    { label: "PIC", value: flight.pic_time },
    { label: "SIC", value: flight.sic_time },
    { label: "Instructor", value: flight.instructor_time },
    { label: "Evaluator", value: flight.evaluator_time },
    { label: "Night", value: flight.night_time },
    { label: "NVG", value: flight.nvg_time },
    { label: "Instrument (Actual)", value: flight.instrument_time },
    { label: "Instrument (Sim)", value: flight.sim_instrument_time },
    { label: "Cross-Country", value: flight.xc_time },
    { label: "Solo", value: flight.solo_time },
    { label: "Dual Received", value: flight.dual_received_time },
  ].filter((f) => Number(f.value) > 0);

  if (timeFields.length > 0) {
    y = await addSectionHeader(doc, y, "TIME BREAKDOWN");
    y = await addKeyValueTable(
      doc,
      y,
      timeFields.map((f) => ({ label: f.label, value: `${Number(f.value).toFixed(1)} hrs` }))
    );
  }

  // Landings
  const landingFields = [
    { label: "Day", value: flight.day_landings },
    { label: "Night", value: flight.night_landings },
    { label: "NVG", value: flight.nvg_landings },
    { label: "Full Stop", value: flight.full_stop_landings },
    { label: "Touch & Go", value: flight.touch_and_go_landings },
    { label: "Carrier Traps", value: flight.carrier_traps },
    { label: "Bolters", value: flight.carrier_bolters },
  ].filter((f) => Number(f.value) > 0);

  if (landingFields.length > 0) {
    y = await addSectionHeader(doc, y, "LANDINGS");
    y = await addKeyValueTable(
      doc,
      y,
      landingFields.map((f) => ({ label: f.label, value: String(f.value) }))
    );
  }

  // Approaches
  const approaches = (flight.approaches || []) as { type: string; runway: string; airport: string }[];
  if (approaches.length > 0) {
    y = await addSectionHeader(doc, y, "APPROACHES");
    y = await addKeyValueTable(
      doc,
      y,
      approaches.map((a, i) => ({
        label: `#${i + 1} ${a.type}`,
        value: [a.runway && `Rwy ${a.runway}`, a.airport].filter(Boolean).join(" - "),
      }))
    );
  }

  // UPT Grades
  if (flight.upt_grades) {
    const grades = flight.upt_grades as {
      progression_grade?: string;
      overall_grade?: string;
      upgrades?: number;
      downgrades?: number;
      mif_notes?: string;
    };
    const gradeRows: { label: string; value: string }[] = [];
    if (grades.progression_grade) gradeRows.push({ label: "Progression", value: grades.progression_grade });
    if (grades.overall_grade) gradeRows.push({ label: "Overall", value: grades.overall_grade });
    if (grades.upgrades) gradeRows.push({ label: "Upgrades", value: `+${grades.upgrades}` });
    if (grades.downgrades) gradeRows.push({ label: "Downgrades", value: `-${grades.downgrades}` });
    if (grades.mif_notes) gradeRows.push({ label: "MIF Notes", value: grades.mif_notes });

    if (gradeRows.length > 0) {
      y = await addSectionHeader(doc, y, "UPT GRADING");
      y = await addKeyValueTable(doc, y, gradeRows);
    }
  }

  // Remarks
  if (flight.remarks) {
    y = await addSectionHeader(doc, y, "REMARKS");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(flight.remarks, doc.internal.pageSize.getWidth() - 26);
    doc.text(lines, 13, y);
  }

  const dateStr = format(new Date(flight.flight_date), "yyyy-MM-dd");
  const aircraft = flight.aircraft_type?.designation || "flight";
  finalizePdf(doc, `MR360_Flight_${dateStr}_${aircraft}.pdf`);
}
