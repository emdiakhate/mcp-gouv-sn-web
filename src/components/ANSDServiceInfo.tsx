"use client";

import { useState } from "react";
import { ANSD_FAMILIES, ANSD_SUGGESTED_QUESTIONS, type ANSDFamily, type ANSDSector } from "@/data/ansdSectors";

interface ANSDServiceInfoProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ANSDServiceInfo({ onSelectPrompt }: ANSDServiceInfoProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span style={{ fontSize: "28px" }}>📊</span>
        <div>
          <div className="font-semibold" style={{ fontSize: "16px", color: "var(--foreground)" }}>
            ANSD — Donnees disponibles
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)" }}>
            Agence Nationale de la Statistique et de la Demographie
          </div>
        </div>
        <a
          href="https://www.ansd.sn"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1"
          style={{ fontSize: "11px", color: "var(--accent)", textDecoration: "none" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          ansd.sn
        </a>
      </div>

      {/* Families */}
      <div className="space-y-4">
        {ANSD_FAMILIES.map((family) => (
          <FamilySection
            key={family.title}
            family={family}
            onSelectPrompt={onSelectPrompt}
          />
        ))}
      </div>

      {/* Suggested questions */}
      <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="font-semibold mb-2"
          style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}
        >
          Questions suggerees
        </div>
        <div className="flex flex-wrap gap-2">
          {ANSD_SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => onSelectPrompt(q)}
              className="px-3 py-1.5 rounded-full cursor-pointer"
              style={{
                fontSize: "12px",
                backgroundColor: "var(--chip-bg)",
                color: "var(--chip-text)",
                border: "1px solid var(--border)",
                transition: "border-color 0.15s, background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.backgroundColor = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.backgroundColor = "var(--chip-bg)";
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FamilySection({ family, onSelectPrompt }: { family: ANSDFamily; onSelectPrompt: (prompt: string) => void }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      {/* Family header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-2 cursor-pointer w-full text-left"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <span
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: family.color + "15", fontSize: "12px" }}
        >
          {family.icon}
        </span>
        <span className="font-semibold" style={{ fontSize: "13px", color: family.color }}>
          {family.title}
        </span>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          ({family.sectors.length} secteurs)
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: "auto",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Sectors grid */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-7">
          {family.sectors.map((sector) => (
            <SectorCard
              key={sector.name}
              sector={sector}
              familyColor={family.color}
              onSelect={() => {
                if (sector.available) {
                  onSelectPrompt(sector.examplePrompt);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectorCard({
  sector,
  familyColor,
  onSelect,
}: {
  sector: ANSDSector;
  familyColor: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="flex flex-col gap-1 px-3 py-2.5 rounded-lg text-left"
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
        opacity: sector.available ? 1 : 0.5,
        cursor: sector.available ? "pointer" : "default",
        transition: "border-color 0.15s, background-color 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (sector.available) {
          e.currentTarget.style.borderColor = familyColor;
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.backgroundColor = "var(--background)";
      }}
    >
      {/* Live badge */}
      {sector.available && (
        <span
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full flex items-center gap-1"
          style={{ fontSize: "8px", fontWeight: 600, color: "#059669", backgroundColor: "#05966910" }}
        >
          <span className="rounded-full" style={{ width: 4, height: 4, backgroundColor: "#059669" }} />
          Live
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <span style={{ fontSize: "14px" }}>{sector.icon}</span>
        <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
          {sector.name}
        </span>
      </div>

      {/* Datasets */}
      <div className="flex flex-wrap gap-1 mt-0.5">
        {sector.datasets.slice(0, 3).map((ds) => (
          <span
            key={ds}
            className="px-1.5 py-0.5 rounded"
            style={{ fontSize: "9px", backgroundColor: "var(--chip-bg)", color: "var(--muted)" }}
          >
            {ds}
          </span>
        ))}
        {sector.datasets.length > 3 && (
          <span style={{ fontSize: "9px", color: "var(--muted)" }}>
            +{sector.datasets.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
