"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import type { VizChartData } from "@/utils/parseViz";

/**
 * Full Excel artifact for the split panel.
 * Excel-style grid with row numbers, green ANSD headers, total row highlighting.
 */
export default function ExcelArtifact({ viz }: { viz: VizChartData }) {
  const sheets = viz.sheets;
  const [activeSheet, setActiveSheet] = useState(0);

  if (!sheets || sheets.length === 0) return null;
  const sheet = sheets[activeSheet];
  if (!sheet) return null;

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    sheets.forEach((s) => {
      const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });
    XLSX.writeFile(wb, `${viz.title || "Export"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Detect "total" rows (last row or rows containing "total" in first cell)
  const isTotalRow = (row: (string | number | null)[], idx: number) => {
    const firstCell = String(row[0] || "").toLowerCase();
    return firstCell.includes("total") || (idx === sheet.rows.length - 1 && sheet.rows.length > 3);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E8E8E8" }}>
        <div>
          {viz.title && <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{viz.title}</h2>}
          <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>
            {sheet.rows.length} lignes · {sheet.headers.length} colonnes
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

      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex gap-0" style={{ borderBottom: "1px solid #E8E8E8", backgroundColor: "#FAFAFA" }}>
          {sheets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSheet(i)}
              className="cursor-pointer"
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: i === activeSheet ? 600 : 400,
                color: i === activeSheet ? "#0F6E56" : "#666",
                background: i === activeSheet ? "#fff" : "transparent",
                borderBottom: i === activeSheet ? "2px solid #0F6E56" : "2px solid transparent",
                border: "none",
                borderLeft: i > 0 ? "1px solid #E8E8E8" : "none",
              }}
            >
              {s.name}
            </button>
          ))}
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
                borderRight: "1px solid #D0D0D0", borderBottom: "2px solid #0F6E56",
                fontSize: "11px",
              }}>
                #
              </th>
              {sheet.headers.map((h, i) => (
                <th key={i} style={{
                  backgroundColor: "#0F6E56", color: "#fff",
                  padding: "8px 14px", textAlign: "left", fontWeight: 500,
                  whiteSpace: "nowrap", borderBottom: "2px solid #0A5A45",
                  borderRight: i < sheet.headers.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, ri) => {
              const isTotal = isTotalRow(row, ri);
              return (
                <tr
                  key={ri}
                  style={{
                    backgroundColor: isTotal ? "#E1F5EE" : ri % 2 === 0 ? "#fff" : "#FAFBFA",
                  }}
                >
                  {/* Row number */}
                  <td style={{
                    backgroundColor: "#F5F5F5", color: "#999", padding: "7px 10px",
                    textAlign: "center", fontSize: "11px", borderRight: "1px solid #E8E8E8",
                    borderBottom: "0.5px solid #eee", fontVariantNumeric: "tabular-nums",
                  }}>
                    {ri + 1}
                  </td>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: "7px 14px",
                      borderBottom: "0.5px solid #eee",
                      borderRight: ci < row.length - 1 ? "0.5px solid #f0f0f0" : "none",
                      color: typeof cell === "number" ? "#0F6E56" : "#333",
                      fontWeight: isTotal ? 600 : ci === 0 ? 500 : 400,
                      whiteSpace: "nowrap",
                      fontVariantNumeric: typeof cell === "number" ? "tabular-nums" : undefined,
                    }}>
                      {typeof cell === "number" ? cell.toLocaleString("fr-FR") : cell ?? "\u2014"}
                    </td>
                  ))}
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
