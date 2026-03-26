"use client";

import { useState } from "react";
import { GOV_SERVICES, type GovService, type ServiceSector } from "@/constants/services";

interface ServiceCatalogProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ServiceCatalog({ onSelectPrompt }: ServiceCatalogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardClick = (service: GovService) => {
    if (!service.available) return;
    setExpandedId((prev) => (prev === service.id ? null : service.id));
  };

  const expandedService = GOV_SERVICES.find((s) => s.id === expandedId);

  return (
    <div className="w-full max-w-3xl">
      {/* Service cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GOV_SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isExpanded={expandedId === service.id}
            onClick={() => handleCardClick(service)}
          />
        ))}
      </div>

      {/* Expanded detail panel */}
      {expandedService && (
        <ServiceDetail
          service={expandedService}
          onClose={() => setExpandedId(null)}
          onSelectPrompt={onSelectPrompt}
        />
      )}
    </div>
  );
}

/* ─── Service card (collapsed) ─── */
function ServiceCard({
  service,
  isExpanded,
  onClick,
}: {
  service: GovService;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center text-center gap-1.5 px-3 py-4 rounded-xl border relative"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: isExpanded ? "var(--accent)" : "var(--border)",
        boxShadow: isExpanded ? "0 0 0 1px var(--accent)" : "none",
        opacity: service.available ? 1 : 0.45,
        cursor: service.available ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s, opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        if (service.available) {
          e.currentTarget.style.borderColor = "var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = "var(--border)";
        }
      }}
    >
      <span style={{ fontSize: "28px" }}>{service.icon}</span>
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {service.name}
      </span>
      <span
        className="text-[10px] leading-tight"
        style={{ color: "var(--muted)" }}
      >
        {service.available ? service.fullName : "Bientôt disponible"}
      </span>

      {/* Badge for unavailable */}
      {!service.available && (
        <span
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full"
          style={{
            fontSize: "9px",
            fontWeight: 600,
            backgroundColor: "var(--chip-bg)",
            color: "var(--muted)",
          }}
        >
          Bientôt
        </span>
      )}

      {/* Active indicator */}
      {service.available && (
        <span
          className="absolute top-1.5 left-1.5 rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: "var(--accent)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Expanded service detail panel ─── */
function ServiceDetail({
  service,
  onClose,
  onSelectPrompt,
}: {
  service: GovService;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}) {
  return (
    <div
      className="mt-4 rounded-xl border overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        animation: "fadeSlideIn 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "24px" }}>{service.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold"
                style={{ fontSize: "15px", color: "var(--foreground)" }}
              >
                {service.name}
              </span>
              <a
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80"
                style={{
                  fontSize: "11px",
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {service.website.replace("https://", "")}
              </a>
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              {service.fullName}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: "var(--chip-bg)",
            border: "none",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Description */}
        <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--foreground)", margin: 0 }}>
          {service.description}
        </p>

        {/* Sectors */}
        <div>
          <h4
            className="font-semibold mb-2"
            style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            Secteurs disponibles
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {service.sectors.map((sector) => (
              <SectorChip
                key={sector.name}
                sector={sector}
                onSelect={() => onSelectPrompt(sector.examplePrompt)}
              />
            ))}
          </div>
        </div>

        {/* Data sources */}
        {service.dataSources.length > 0 && (
          <div>
            <h4
              className="font-semibold mb-2"
              style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}
            >
              Sources de données
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {service.dataSources.map((src) => (
                <span
                  key={src}
                  className="px-2 py-1 rounded-md"
                  style={{
                    fontSize: "11px",
                    backgroundColor: "var(--chip-bg)",
                    color: "var(--chip-text)",
                  }}
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* How to use */}
        {service.howToUse && (
          <div
            className="rounded-lg px-4 py-3"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <h4
              className="font-semibold mb-1.5"
              style={{ fontSize: "12px", color: "var(--accent)" }}
            >
              Comment exploiter ces données ?
            </h4>
            <p
              style={{
                fontSize: "12px",
                lineHeight: 1.7,
                color: "var(--muted)",
                margin: 0,
              }}
            >
              {service.howToUse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sector chip (clickable → sends prompt) ─── */
function SectorChip({
  sector,
  onSelect,
}: {
  sector: ServiceSector;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-left cursor-pointer"
      style={{
        backgroundColor: "var(--background)",
        border: "1px solid var(--border)",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.backgroundColor = "var(--surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.backgroundColor = "var(--background)";
      }}
    >
      <span style={{ fontSize: "16px", flexShrink: 0 }}>{sector.icon}</span>
      <div>
        <span
          className="block text-xs font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {sector.name}
        </span>
        <span
          className="block mt-0.5"
          style={{ fontSize: "10px", lineHeight: 1.4, color: "var(--muted)" }}
        >
          {sector.description}
        </span>
      </div>
    </button>
  );
}
