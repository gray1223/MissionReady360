import type { jsPDF } from "jspdf";
import type { UserOptions } from "jspdf-autotable";
import { PDF_COLORS } from "./pdf-theme";

type AutoTableDoc = jsPDF & {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: { finalY: number };
};

async function ensureAutoTable(doc: jsPDF): Promise<AutoTableDoc> {
  await import("jspdf-autotable");
  return doc as AutoTableDoc;
}

export async function addSectionHeader(
  doc: jsPDF,
  yPos: number,
  title: string
): Promise<number> {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 15;
  }

  doc.setFillColor(...PDF_COLORS.sectionBg);
  doc.rect(10, yPos, doc.internal.pageSize.getWidth() - 20, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.sectionText);
  doc.text(title, 13, yPos + 5);

  return yPos + 10;
}

export async function addKeyValueTable(
  doc: jsPDF,
  yPos: number,
  data: { label: string; value: string }[]
): Promise<number> {
  const atDoc = await ensureAutoTable(doc);

  atDoc.autoTable({
    startY: yPos,
    margin: { left: 10, right: 10 },
    head: [],
    body: data.map((d) => [d.label, d.value]),
    columnStyles: {
      0: {
        cellWidth: 45,
        fontStyle: "bold",
        textColor: PDF_COLORS.bodyText,
        fontSize: 8,
      },
      1: { textColor: PDF_COLORS.bodyText, fontSize: 8 },
    },
    theme: "plain",
    styles: { cellPadding: 2 },
    alternateRowStyles: { fillColor: PDF_COLORS.rowAlt },
  });

  return atDoc.lastAutoTable.finalY + 4;
}

export async function addFlightLogTable(
  doc: jsPDF,
  yPos: number,
  rows: string[][],
  headers: string[]
): Promise<number> {
  const atDoc = await ensureAutoTable(doc);

  atDoc.autoTable({
    startY: yPos,
    margin: { left: 5, right: 5 },
    head: [headers],
    body: rows,
    headStyles: {
      fillColor: PDF_COLORS.headerBg,
      textColor: PDF_COLORS.headerText,
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 1.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: PDF_COLORS.bodyText,
      cellPadding: 1.5,
    },
    alternateRowStyles: { fillColor: PDF_COLORS.rowAlt },
    styles: { overflow: "linebreak" },
    didDrawPage: (data: any) => {
      // Re-draw header on new pages
      if (data.pageNumber > 1) {
        doc.setFillColor(...PDF_COLORS.accent);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), 1, "F");
      }
    },
  });

  return atDoc.lastAutoTable.finalY + 4;
}
