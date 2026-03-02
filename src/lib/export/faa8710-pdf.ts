import type { Flight, AircraftType, PriorHoursInput } from "@/lib/types/database";
import { createPdfDocument, finalizePdf } from "./pdf-theme";
import { addSectionHeader } from "./pdf-tables";
import { PDF_COLORS } from "./pdf-theme";

export interface CategoryTotals {
  category: string;
  label: string;
  total_time: number;
  pic: number;
  sic: number;
  solo: number;
  dual_received: number;
  xc: number;
  night: number;
  instrument_actual: number;
  instrument_simulated: number;
  day_landings: number;
  night_landings: number;
  flights_last_6_months: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  airplane_single_engine_land: "Airplane SEL",
  airplane_single_engine_sea: "Airplane SES",
  airplane_multi_engine_land: "Airplane MEL",
  airplane_multi_engine_sea: "Airplane MES",
  rotorcraft_helicopter: "Rotorcraft Helicopter",
  rotorcraft_gyroplane: "Rotorcraft Gyroplane",
  glider: "Glider",
  lighter_than_air_airship: "LTA Airship",
  lighter_than_air_balloon: "LTA Balloon",
  powered_lift: "Powered Lift",
  powered_parachute_land: "Powered Parachute Land",
  powered_parachute_sea: "Powered Parachute Sea",
  weight_shift_control_land: "WSC Land",
  weight_shift_control_sea: "WSC Sea",
};

function buildCategoryKey(aircraft: AircraftType): string {
  const cat = (aircraft.faa_category || "airplane").toLowerCase().replace(/\s+/g, "_");
  const cls = (aircraft.faa_class || "").toLowerCase().replace(/\s+/g, "_");
  if (cls) return `${cat}_${cls}`;
  return cat;
}

export function aggregateByCategory(
  flights: (Flight & { aircraft_type?: AircraftType | null })[],
  fromDate?: string,
  toDate?: string
): CategoryTotals[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthStr = sixMonthsAgo.toISOString().split("T")[0];

  const filtered = flights.filter((f) => {
    if (fromDate && f.flight_date < fromDate) return false;
    if (toDate && f.flight_date > toDate) return false;
    return true;
  });

  const map = new Map<string, CategoryTotals>();

  for (const f of filtered) {
    if (!f.aircraft_type) continue;
    const key = buildCategoryKey(f.aircraft_type);
    if (!map.has(key)) {
      map.set(key, {
        category: key,
        label: CATEGORY_LABELS[key] || key.replace(/_/g, " "),
        total_time: 0,
        pic: 0,
        sic: 0,
        solo: 0,
        dual_received: 0,
        xc: 0,
        night: 0,
        instrument_actual: 0,
        instrument_simulated: 0,
        day_landings: 0,
        night_landings: 0,
        flights_last_6_months: 0,
      });
    }
    const t = map.get(key)!;
    t.total_time += Number(f.total_time) || 0;
    t.pic += Number(f.pic_time) || 0;
    t.sic += Number(f.sic_time) || 0;
    t.solo += Number(f.solo_time) || 0;
    t.dual_received += Number(f.dual_received_time) || 0;
    t.xc += Number(f.xc_time) || 0;
    t.night += Number(f.night_time) || 0;
    t.instrument_actual += Number(f.instrument_time) || 0;
    t.instrument_simulated += Number(f.sim_instrument_time) || 0;
    t.day_landings += Number(f.day_landings) || 0;
    t.night_landings += Number(f.night_landings) || 0;
    if (f.flight_date >= sixMonthStr) {
      t.flights_last_6_months += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export function computeTotalsRow(categories: CategoryTotals[]): CategoryTotals {
  const totals: CategoryTotals = {
    category: "totals",
    label: "TOTALS",
    total_time: 0,
    pic: 0,
    sic: 0,
    solo: 0,
    dual_received: 0,
    xc: 0,
    night: 0,
    instrument_actual: 0,
    instrument_simulated: 0,
    day_landings: 0,
    night_landings: 0,
    flights_last_6_months: 0,
  };

  for (const c of categories) {
    totals.total_time += c.total_time;
    totals.pic += c.pic;
    totals.sic += c.sic;
    totals.solo += c.solo;
    totals.dual_received += c.dual_received;
    totals.xc += c.xc;
    totals.night += c.night;
    totals.instrument_actual += c.instrument_actual;
    totals.instrument_simulated += c.instrument_simulated;
    totals.day_landings += c.day_landings;
    totals.night_landings += c.night_landings;
    totals.flights_last_6_months += c.flights_last_6_months;
  }

  return totals;
}

export function mergePriorHours(
  categories: CategoryTotals[],
  prior: PriorHoursInput
): CategoryTotals[] {
  if (!categories.length) return categories;
  // Add prior hours to first category (or totals if called on totals)
  const merged = categories.map((c) => ({ ...c }));
  const first = merged[0];
  first.total_time += prior.total_time || 0;
  first.pic += prior.pic_time || 0;
  first.xc += prior.solo_xc_time || prior.pic_xc_time || 0;
  first.night += prior.night_time || 0;
  first.instrument_actual += prior.instrument_actual || 0;
  first.instrument_simulated += prior.instrument_sim || 0;
  first.solo += prior.solo_time || 0;
  first.dual_received += prior.dual_received_time || 0;
  return merged;
}

const HEADERS_8710 = [
  "Category/Class",
  "Total\nTime",
  "PIC",
  "SIC",
  "Solo",
  "Dual\nRcvd",
  "XC",
  "Night",
  "Inst\n(Act)",
  "Inst\n(Sim)",
  "Day\nLdg",
  "Night\nLdg",
  "Last\n6 Mo",
];

function catRow(c: CategoryTotals): string[] {
  const num = (v: number) => (v > 0 ? v.toFixed(1) : "");
  const int = (v: number) => (v > 0 ? String(v) : "");
  return [
    c.label,
    num(c.total_time),
    num(c.pic),
    num(c.sic),
    num(c.solo),
    num(c.dual_received),
    num(c.xc),
    num(c.night),
    num(c.instrument_actual),
    num(c.instrument_simulated),
    int(c.day_landings),
    int(c.night_landings),
    int(c.flights_last_6_months),
  ];
}

export async function generateFaa8710Pdf(
  categories: CategoryTotals[],
  pilotName: string
) {
  const { doc, yPos: startY } = await createPdfDocument(
    "FAA 8710-1 Section III — Flight Time",
    "landscape"
  );

  let y = startY;

  // Pilot name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.bodyText);
  doc.text(`Applicant: ${pilotName}`, 10, y);
  y += 6;

  y = await addSectionHeader(doc, y, "SECTION III — FLIGHT TIME / AIRCRAFT CATEGORY & CLASS");

  const totals = computeTotalsRow(categories);
  const rows = [...categories.map(catRow), catRow(totals)];

  // autoTable
  await import("jspdf-autotable");
  const atDoc = doc as any;

  atDoc.autoTable({
    startY: y,
    margin: { left: 5, right: 5 },
    head: [HEADERS_8710],
    body: rows,
    headStyles: {
      fillColor: PDF_COLORS.headerBg,
      textColor: PDF_COLORS.headerText,
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 1.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: PDF_COLORS.bodyText,
      cellPadding: 1.5,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 35 },
    },
    alternateRowStyles: { fillColor: PDF_COLORS.rowAlt },
    // Bold the totals row
    didParseCell: (data: any) => {
      if (data.section === "body" && data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [226, 232, 240]; // slate-200
      }
    },
  });

  finalizePdf(doc, "MR360_FAA_8710_Section_III.pdf");
}
