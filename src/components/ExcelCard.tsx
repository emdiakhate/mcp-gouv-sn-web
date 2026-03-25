"use client";

import type { VizChartData } from "@/utils/parseViz";
import { useArtifact } from "@/contexts/ArtifactContext";

/**
 * Compact Excel card shown in chat. Clicking opens the full ExcelArtifact in the side panel.
 */
export default function ExcelCard({ viz }: { viz: VizChartData }) {
  const { openArtifact } = useArtifact();

  if (!viz.sheets || viz.sheets.length === 0) return null;

  const totalRows = viz.sheets.reduce((sum, s) => sum + s.rows.length, 0);
  const totalCols = Math.max(...viz.sheets.map((s) => s.headers.length));

  return (
    <div
      className="my-3 overflow-hidden cursor-pointer group"
      onClick={() => openArtifact({ kind: "excel", viz })}
      style={{
        background: "#FFFFFF",
        border: "0.5px solid #E8E8E8",
        borderRadius: "12px",
        padding: "14px 16px",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#0F6E56";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(15,110,86,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E8E8E8";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-center gap-3">
        {/* Excel icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 40, height: 40, borderRadius: "10px",
            backgroundColor: "#E1F5EE", color: "#0F6E56",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a", margin: 0 }}>
            {viz.title || "Fichier Excel"}
          </p>
          <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>
            {viz.sheets.length > 1 ? `${viz.sheets.length} onglets · ` : ""}
            {totalRows} lignes · {totalCols} colonnes
          </p>
        </div>

        {/* Expand hint */}
        <div
          className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
          style={{ fontSize: "11px", color: "#0F6E56", transition: "opacity 0.15s" }}
        >
          <span>Ouvrir</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Mini preview: first 3 rows */}
      {viz.sheets[0] && (
        <div className="mt-3 overflow-hidden" style={{ borderRadius: "6px", border: "0.5px solid #E8E8E8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead>
              <tr>
                {viz.sheets[0].headers.slice(0, 5).map((h, i) => (
                  <th key={i} style={{
                    backgroundColor: "#0F6E56", color: "#fff",
                    padding: "5px 8px", textAlign: "left", fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
                {viz.sheets[0].headers.length > 5 && (
                  <th style={{ backgroundColor: "#0F6E56", color: "rgba(255,255,255,0.6)", padding: "5px 8px", fontSize: "10px" }}>
                    +{viz.sheets[0].headers.length - 5}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {viz.sheets[0].rows.slice(0, 3).map((row, ri) => (
                <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? "#fff" : "#F8FFFE" }}>
                  {row.slice(0, 5).map((cell, ci) => (
                    <td key={ci} style={{
                      padding: "4px 8px", borderBottom: "0.5px solid #eee",
                      color: typeof cell === "number" ? "#0F6E56" : "#555",
                      whiteSpace: "nowrap",
                    }}>
                      {typeof cell === "number" ? cell.toLocaleString("fr-FR") : cell ?? "\u2014"}
                    </td>
                  ))}
                  {row.length > 5 && <td style={{ padding: "4px 8px", color: "#999", fontSize: "10px" }}>...</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {viz.sheets[0].rows.length > 3 && (
            <div style={{ padding: "4px 8px", fontSize: "10px", color: "#999", textAlign: "center", backgroundColor: "#FAFAFA", borderTop: "0.5px solid #eee" }}>
              +{viz.sheets[0].rows.length - 3} lignes supplémentaires
            </div>
          )}
        </div>
      )}
    </div>
  );
}
