"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: (string | number | null)[][];
}

export interface ExcelData {
  title: string;
  sheets: ExcelSheet[];
}

function downloadExcel(data: ExcelData) {
  const wb = XLSX.utils.book_new();
  data.sheets.forEach((sheet) => {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  XLSX.writeFile(wb, `${data.title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function ExcelViewer({ data }: { data: ExcelData }) {
  const [activeSheet, setActiveSheet] = useState(0);
  const sheet = data.sheets[activeSheet];
  if (!sheet) return null;

  return (
    <div className="my-3" style={{ fontFamily: "system-ui, sans-serif", width: "100%" }}>
      {/* Sheet tabs */}
      {data.sheets.length > 1 && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px", borderBottom: "1px solid #E8E8E8", paddingBottom: 0 }}>
          {data.sheets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSheet(i)}
              className="cursor-pointer"
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                background: i === activeSheet ? "#fff" : "transparent",
                border: "0.5px solid",
                borderColor: i === activeSheet ? "#E8E8E8" : "transparent",
                borderBottom: i === activeSheet ? "2px solid #0F6E56" : "none",
                borderRadius: "6px 6px 0 0",
                color: i === activeSheet ? "#0F6E56" : "#666",
                fontWeight: i === activeSheet ? 500 : 400,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "8px", border: "0.5px solid #E8E8E8", marginBottom: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "400px" }}>
          <thead>
            <tr>
              {sheet.headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    background: "#0F6E56",
                    color: "#fff",
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    position: "sticky" as const,
                    top: 0,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F8FFFE" }}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "7px 12px",
                      borderBottom: "0.5px solid #eee",
                      color: typeof cell === "number" ? "#0F6E56" : "#333",
                      fontWeight: j === 0 ? 500 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {typeof cell === "number"
                      ? cell.toLocaleString("fr-FR")
                      : cell ?? "\u2014"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#888" }}>
        <span>{sheet.rows.length} lignes · {sheet.headers.length} colonnes</span>
        <button
          onClick={() => downloadExcel(data)}
          className="cursor-pointer hover:opacity-80"
          style={{
            fontSize: "12px",
            padding: "4px 12px",
            background: "transparent",
            border: "0.5px solid #ccc",
            borderRadius: "6px",
            color: "#555",
          }}
        >
          ⬇ Télécharger .xlsx
        </button>
      </div>
    </div>
  );
}
