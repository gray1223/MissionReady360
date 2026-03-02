import type { Profile } from "@/lib/types/database";
import { createPdfDocument, finalizePdf } from "./pdf-theme";
import { addSectionHeader, addKeyValueTable } from "./pdf-tables";

export interface CareerStats {
  total: number;
  night: number;
  instrument: number;
  pic: number;
  sic: number;
  xc: number;
  solo: number;
  dual: number;
  instructor: number;
  combat: number;
  sorties: number;
  simHours: number;
}

export interface YtdStats {
  total: number;
  night: number;
  instrument: number;
  pic: number;
  xc: number;
  sorties: number;
}

export async function generateSummaryPdf(
  profile: Profile,
  career: CareerStats,
  ytd: YtdStats,
  year: number
) {
  const { doc, yPos: startY } = await createPdfDocument(
    "Career Summary Report",
    "portrait"
  );

  let y = startY;

  // Pilot Info
  y = await addSectionHeader(doc, y, "PILOT INFORMATION");
  const pilotInfo: { label: string; value: string }[] = [];
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  if (name) pilotInfo.push({ label: "Name", value: name });
  if (profile.rank) pilotInfo.push({ label: "Rank", value: profile.rank });
  if (profile.branch) pilotInfo.push({ label: "Branch", value: profile.branch });
  if (profile.unit) pilotInfo.push({ label: "Unit", value: profile.unit });
  if (profile.callsign) pilotInfo.push({ label: "Callsign", value: profile.callsign });
  if (profile.faa_certificate_number)
    pilotInfo.push({ label: "FAA Certificate #", value: profile.faa_certificate_number });
  if (profile.certificate_type && profile.certificate_type !== "none")
    pilotInfo.push({ label: "Certificate Type", value: profile.certificate_type.toUpperCase() });

  if (pilotInfo.length > 0) {
    y = await addKeyValueTable(doc, y, pilotInfo);
  }

  // Career Totals
  y = await addSectionHeader(doc, y, "CAREER TOTALS");
  const careerRows = [
    { label: "Total Sorties", value: String(career.sorties) },
    { label: "Total Hours", value: `${career.total.toFixed(1)} hrs` },
    { label: "PIC", value: `${career.pic.toFixed(1)} hrs` },
    { label: "SIC", value: `${career.sic.toFixed(1)} hrs` },
    { label: "Cross-Country", value: `${career.xc.toFixed(1)} hrs` },
    { label: "Night", value: `${career.night.toFixed(1)} hrs` },
    { label: "Instrument", value: `${career.instrument.toFixed(1)} hrs` },
    { label: "Solo", value: `${career.solo.toFixed(1)} hrs` },
    { label: "Dual Received", value: `${career.dual.toFixed(1)} hrs` },
    { label: "Instructor", value: `${career.instructor.toFixed(1)} hrs` },
  ];
  if (career.combat > 0)
    careerRows.push({ label: "Combat", value: `${career.combat.toFixed(1)} hrs` });
  if (career.simHours > 0)
    careerRows.push({ label: "Simulator", value: `${career.simHours.toFixed(1)} hrs` });

  y = await addKeyValueTable(doc, y, careerRows);

  // YTD
  y = await addSectionHeader(doc, y, `YEAR TO DATE (${year})`);
  y = await addKeyValueTable(doc, y, [
    { label: "Sorties", value: String(ytd.sorties) },
    { label: "Total Hours", value: `${ytd.total.toFixed(1)} hrs` },
    { label: "PIC", value: `${ytd.pic.toFixed(1)} hrs` },
    { label: "Cross-Country", value: `${ytd.xc.toFixed(1)} hrs` },
    { label: "Night", value: `${ytd.night.toFixed(1)} hrs` },
    { label: "Instrument", value: `${ytd.instrument.toFixed(1)} hrs` },
  ]);

  finalizePdf(doc, `MR360_Career_Summary.pdf`);
}
