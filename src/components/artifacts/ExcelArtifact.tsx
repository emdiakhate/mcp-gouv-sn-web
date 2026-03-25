"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import type { VizChartData } from "@/utils/parseViz";

/* Tab colors for different sheets */
const TAB_COLORS = [
  { active: "#0F6E56", light: "#E1F5EE" },
  { active: "#378ADD", light: "#E8F2FD" },
  { active: "#7F77DD", light: "#EEEDF9" },
  { active: "#D85A30", light: "#FDEEE8" },
  { active: "#BA7517", light: "#FAF0E0" },
  { active: "#D4537E", light: "#FAEDF2" },
];

/**
 * Resolve Excel formula strings to computed values.
 * If a cell looks like "=SUM(...)" or "=A1+B1", return the raw string as-is
 * since we can't evaluate it client-side — but mark it visually.
 */
function resolveCell(cell: string | number | null): { value: string; isFormula: boolean } {
  if (cell === null || cell === undefined) return { value: "\u2014", isFormula: false };
  if (typeof cell === "number") return { value: cell.toLocaleString("fr-FR"), isFormula: false };
  const s = String(cell);
  if (s.startsWith("=")) {
    // Try to parse simple formulas
    return { value: s, isFormula: true };
  }
  return { value: s, isFormula: false };
}

/**
 * Full Excel artifact for the split panel.
 * Excel-style grid with row numbers, colored sheet tabs, total row highlighting.
 */
export default function ExcelArtifact({ viz }: { viz: VizChartData }) {
  const sheets = viz.sheets;
  const [activeSheet, setActiveSheet] = useState(0);

  if (!sheets || sheets.length === 0) return null;
  const sheet = sheets[activeSheet];
  if (!sheet) return null;

  const tabColor = TAB_COLORS[activeSheet % TAB_COLORS.length];

  // Process sheet data: evaluate formulas where possible using SheetJS
  const processedRows = useMemo(() => {
    if (!sheet) return [];
    // Build a SheetJS worksheet from headers + rows, then read back computed values
    try {
      const aoa = [sheet.headers, ...sheet.rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const json = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, { header: 1, raw: true });
      // Skip header row
      return json.slice(1);
    } catch {
      return sheet.rows;
    }
  }, [sheet]);

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    sheets.forEach((s) => {
      const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });
    XLSX.writeFile(wb, `${viz.title || "Export"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Detect "total" rows
  const isTotalRow = (row: (string | number | null)[], idx: number) => {
    const firstCell = String(row[0] || "").toLowerCase();
    return firstCell.includes("total") || (idx === processedRows.length - 1 && processedRows.length > 3);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E8E8E8" }}>
        <div>
          {viz.title && <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{viz.title}</h2>}
          <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>
            {processedRows.length} lignes · {sheet.headers.length} colonnes
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "#0F6E56", color: "#fff", fontSize: "12px", fontWeight: 500, border: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger .xlsx
        </button>
      </div>

      {/* Sheet tabs — different color per tab */}
      {sheets.length > 1 && (
        <div className="flex" style={{ borderBottom: "1px solid #E8E8E8", backgroundColor: "#FAFAFA" }}>
          {sheets.map((s, i) => {
            const tc = TAB_COLORS[i % TAB_COLORS.length];
            const isActive = i === activeSheet;
            return (
              <button
                key={i}
                onClick={() => setActiveSheet(i)}
                className="cursor-pointer"
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? tc.active : "#666",
                  background: isActive ? tc.light : "transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderLeft: i > 0 ? "1px solid #E8E8E8" : "none",
                  borderBottom: isActive ? `2px solid ${tc.active}` : "2px solid transparent",
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Excel-style grid */}
      <div className="flex-1 overflow-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "100%" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>
              {/* Row number header */}
              <th style={{
                backgroundColor: "#E8E8E8", color: "#888", padding: "8px 10px",
                textAlign: "center", fontWeight: 500, width: "40px", minWidth: "40px",
                borderRight: "1px solid #D0D0D0", borderBottom: `2px solid ${tabColor.active}`,
                borderTop: "none", borderLeft: "none",
                fontSize: "11px",
              }}>
                #
              </th>
              {sheet.headers.map((h, i) => (
                <th key={i} style={{
                  backgroundColor: tabColor.active, color: "#fff",
                  padding: "8px 14px", textAlign: "left", fontWeight: 500,
                  whiteSpace: "nowrap",
                  borderTop: "none", borderLeft: "none",
                  borderBottom: `2px solid ${tabColor.active}`,
                  borderRight: i < sheet.headers.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedRows.map((row, ri) => {
              const isTotal = isTotalRow(row, ri);
              return (
                <tr
                  key={ri}
                  style={{
                    backgroundColor: isTotal ? tabColor.light : ri % 2 === 0 ? "#fff" : "#FAFBFA",
                  }}
                >
                  {/* Row number */}
                  <td style={{
                    backgroundColor: "#F5F5F5", color: "#999", padding: "7px 10px",
                    textAlign: "center", fontSize: "11px",
                    borderTop: "none", borderLeft: "none",
                    borderRight: "1px solid #E8E8E8",
                    borderBottom: "0.5px solid #eee",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {ri + 1}
                  </td>
                  {(row as (string | number | null)[]).map((cell, ci) => {
                    const resolved = resolveCell(cell);
                    return (
                      <td key={ci} style={{
                        padding: "7px 14px",
                        borderTop: "none", borderLeft: "none",
                        borderBottom: "0.5px solid #eee",
                        borderRight: ci < (row as (string | number | null)[]).length - 1 ? "0.5px solid #f0f0f0" : "none",
                        color: resolved.isFormula ? "#BA7517" : typeof cell === "number" ? tabColor.active : "#333",
                        fontWeight: isTotal ? 600 : ci === 0 ? 500 : 400,
                        whiteSpace: "nowrap",
                        fontVariantNumeric: typeof cell === "number" ? "tabular-nums" : undefined,
                        fontStyle: resolved.isFormula ? "italic" : undefined,
                        fontSize: resolved.isFormula ? "12px" : undefined,
                      }}>
                        {resolved.isFormula ? (
                          <span title={resolved.value} style={{ cursor: "help" }}>
                            <span style={{ opacity: 0.5, marginRight: "2px" }}>fx</span>
                            {resolved.value}
                          </span>
                        ) : resolved.value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insight */}
      {viz.insight && (
        <div className="flex items-start gap-2 px-4 py-2" style={{ borderTop: "1px solid #E8E8E8", backgroundColor: "#FAEEDA", color: "#633806", fontSize: "12px" }}>
          <span className="flex-shrink-0">💡</span>
          <span>{viz.insight}</span>
        </div>
      )}
    </div>
  );
}
