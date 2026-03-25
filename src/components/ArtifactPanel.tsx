"use client";

import { useArtifact } from "@/contexts/ArtifactContext";
import ChartArtifact from "@/components/artifacts/ChartArtifact";
import ExcelArtifact from "@/components/artifacts/ExcelArtifact";
import { exportVizToExcel, copyVizData } from "@/utils/exportExcel";
import { useState } from "react";

/**
 * Right-side artifact panel with slide-in animation.
 * Renders full-size viz or Excel content.
 */
export default function ArtifactPanel() {
  const { artifact, isOpen, closeArtifact } = useArtifact();
  const [copied, setCopied] = useState(false);

  if (!artifact && !isOpen) return null;

  const handleCopy = async () => {
    if (!artifact) return;
    const text = copyVizData(artifact.viz);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!artifact) return;
    exportVizToExcel(artifact.viz);
  };

  return (
    <div
      className="flex flex-col h-full border-l"
      style={{
        borderColor: "#E8E8E8",
        backgroundColor: "#FFFFFF",
        animation: isOpen ? "slideIn 0.25s ease-out" : "slideOut 0.25s ease-in",
        minWidth: 0,
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid #E8E8E8", backgroundColor: "#FAFAFA" }}
      >
        <div className="flex items-center gap-2">
          {artifact?.kind === "excel" ? (
            <div style={{ width: 20, height: 20, borderRadius: "4px", backgroundColor: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          ) : (
            <div style={{ width: 20, height: 20, borderRadius: "4px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
          )}
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#1a1a1a" }}>
            {artifact?.kind === "excel" ? "Tableur" : "Visualisation"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md cursor-pointer hover:opacity-80"
            style={{ backgroundColor: "#f5f5f5", border: "0.5px solid #E8E8E8" }}
            title="Copier"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied && (
              <span style={{ position: "absolute", top: -24, left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "#0F6E56", whiteSpace: "nowrap" }}>
                Copié !
              </span>
            )}
          </button>

          {/* Export Excel */}
          {artifact && ["bar", "line", "grouped-bar", "table", "excel", "dashboard", "comparison"].includes(artifact.viz.type) && (
            <button
              onClick={handleExport}
              className="p-1.5 rounded-md cursor-pointer hover:opacity-80"
              style={{ backgroundColor: "#f5f5f5", border: "0.5px solid #E8E8E8" }}
              title="Télécharger Excel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}

          {/* Close */}
          <button
            onClick={closeArtifact}
            className="p-1.5 rounded-md cursor-pointer hover:opacity-80"
            style={{ backgroundColor: "#f5f5f5", border: "0.5px solid #E8E8E8" }}
            title="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {artifact?.kind === "excel" && <ExcelArtifact viz={artifact.viz} />}
        {artifact?.kind === "viz" && <ChartArtifact viz={artifact.viz} />}
      </div>
    </div>
  );
}
