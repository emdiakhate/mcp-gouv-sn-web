"use client";

import { GOV_SERVICES, type GovService } from "@/constants/services";

interface ServiceCarouselProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServiceCarousel({ onSelectService }: ServiceCarouselProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GOV_SERVICES.map((service) => (
          <ServiceChip
            key={service.id}
            service={service}
            onClick={() => {
              if (service.available) {
                onSelectService(service.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceChip({ service, onClick }: { service: GovService; onClick: () => void }) {
  const isAvailable = service.available;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
      style={{
        backgroundColor: isAvailable ? `${service.color}0A` : "var(--surface)",
        borderColor: isAvailable ? service.color : "var(--border)",
        borderWidth: isAvailable ? "1.5px" : "0.5px",
        boxShadow: isAvailable ? `0 0 0 3px ${service.color}15` : "none",
        opacity: isAvailable ? 1 : 0.4,
        filter: isAvailable ? "none" : "grayscale(0.8)",
        cursor: isAvailable ? "pointer" : "not-allowed",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (isAvailable) {
          e.currentTarget.style.boxShadow = `0 0 0 3px ${service.color}25`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isAvailable ? `0 0 0 3px ${service.color}15` : "none";
      }}
    >
      {/* Initials logo */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: isAvailable ? `${service.color}20` : "var(--chip-bg)",
          fontSize: "11px",
          fontWeight: 700,
          color: isAvailable ? service.color : "var(--muted)",
        }}
      >
        {service.initials}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: isAvailable ? service.color : "var(--muted)" }}>
            {service.name}
          </span>
          {isAvailable && (
            <span
              className="px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ fontSize: "8px", fontWeight: 600, color: "#059669", backgroundColor: "#05966910" }}
            >
              <span className="live-dot rounded-full" style={{ width: 5, height: 5, backgroundColor: "#059669" }} />
              LIVE
            </span>
          )}
          {!isAvailable && (
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{ fontSize: "8px", fontWeight: 600, backgroundColor: "var(--chip-bg)", color: "var(--muted)" }}
            >
              Bientôt
            </span>
          )}
        </div>
        <span className="block truncate" style={{ fontSize: "10px", color: "var(--muted)", lineHeight: 1.4 }}>
          {service.description}
        </span>
      </div>
    </button>
  );
}
