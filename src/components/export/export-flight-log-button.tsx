"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ColumnPicker } from "./column-picker";
import { DEFAULT_COLUMN_KEYS, ALL_COLUMNS } from "@/lib/export/columns";
import type { Flight, AircraftType } from "@/lib/types/database";

interface ExportFlightLogButtonProps {
  flights: (Flight & { aircraft_type?: AircraftType | null })[];
}

export function ExportFlightLogButton({ flights }: ExportFlightLogButtonProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(
    () => new Set(DEFAULT_COLUMN_KEYS)
  );
  const [loading, setLoading] = useState(false);

  function getFilteredFlights() {
    return flights.filter((f) => {
      if (fromDate && f.flight_date < fromDate) return false;
      if (toDate && f.flight_date > toDate) return false;
      return true;
    });
  }

  async function handleExport() {
    setLoading(true);
    try {
      const filtered = getFilteredFlights();
      const columnKeys = Array.from(selectedColumns);

      if (format === "pdf") {
        const { generateFlightLogPdf } = await import(
          "@/lib/export/flight-log-pdf"
        );
        await generateFlightLogPdf(filtered, columnKeys);
      } else {
        const columns = ALL_COLUMNS.filter((c) =>
          selectedColumns.has(c.key)
        );
        const { generateCsv, downloadCsv } = await import(
          "@/lib/export/csv"
        );
        const headers = columns.map((c) => c.header);
        const rows = filtered.map((f) => columns.map((c) => c.format(f)));
        const csv = generateCsv(headers, rows);
        downloadCsv(csv, "MR360_Flight_Log.csv");
      }
      setOpen(false);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate export. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCount = getFilteredFlights().length;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" />
        Export
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Export Flight Log">
        <div className="space-y-5">
          {/* Format Toggle */}
          <div>
            <p className="text-xs text-slate-500 uppercase mb-2">Format</p>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat("pdf")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  format === "pdf"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  format === "csv"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Columns */}
          <div>
            <p className="text-xs text-slate-500 uppercase mb-2">Columns</p>
            <ColumnPicker
              selected={selectedColumns}
              onChange={setSelectedColumns}
            />
          </div>

          {/* Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-sm text-slate-400">
              {filteredCount} flight{filteredCount !== 1 ? "s" : ""}
            </span>
            <Button
              onClick={handleExport}
              loading={loading}
              disabled={selectedColumns.size === 0 || filteredCount === 0}
            >
              <Download className="h-4 w-4" />
              Download {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
