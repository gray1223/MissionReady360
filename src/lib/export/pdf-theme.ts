import type { jsPDF } from "jspdf";

export const PDF_COLORS = {
  headerBg: [15, 23, 42] as [number, number, number], // slate-900
  headerText: [255, 255, 255] as [number, number, number],
  sectionBg: [30, 41, 59] as [number, number, number], // slate-800
  sectionText: [226, 232, 240] as [number, number, number], // slate-200
  bodyText: [51, 65, 85] as [number, number, number], // slate-700
  mutedText: [100, 116, 139] as [number, number, number], // slate-500
  accent: [16, 185, 129] as [number, number, number], // emerald-500
  rowAlt: [241, 245, 249] as [number, number, number], // slate-100
  white: [255, 255, 255] as [number, number, number],
  border: [203, 213, 225] as [number, number, number], // slate-300
};

export interface PdfCursor {
  doc: jsPDF;
  yPos: number;
}

export async function createPdfDocument(
  title: string,
  orientation: "portrait" | "landscape" = "portrait"
): Promise<PdfCursor> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation, unit: "mm", format: "letter" });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(...PDF_COLORS.headerBg);
  doc.rect(0, 0, pageWidth, 18, "F");

  // Accent stripe
  doc.setFillColor(...PDF_COLORS.accent);
  doc.rect(0, 18, pageWidth, 1.5, "F");

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.headerText);
  doc.text("MR360", 10, 12);

  // Title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(title, pageWidth / 2, 12, { align: "center" });

  // Date
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth - 10, 12, {
    align: "right",
  });

  // Page number footer via autoTable hook
  addPageFooters(doc);

  return { doc, yPos: 25 };
}

function addPageFooters(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Use internal event system for page footers
  const addFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(...PDF_COLORS.mutedText);
      doc.text(
        `MissionReady360 - Page ${i} of ${pages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    }
  };

  // Store the footer function on the doc instance for calling before save
  (doc as any)._mr360AddFooters = addFooter;
}

export function finalizePdf(doc: jsPDF, filename: string) {
  if ((doc as any)._mr360AddFooters) {
    (doc as any)._mr360AddFooters();
  }
  doc.save(filename);
}
