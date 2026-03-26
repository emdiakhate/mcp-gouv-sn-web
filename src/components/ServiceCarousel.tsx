"use client";

import { GOV_SERVICES, type GovService } from "@/constants/services";

interface ServiceCarouselProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServiceCarousel({ onSelectService }: ServiceCarouselProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-4 gap-2">
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
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: service.available ? service.color + "40" : "var(--border)",
        opacity: service.available ? 1 : 0.55,
        cursor: service.available ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (service.available) {
          e.currentTarget.style.borderColor = service.color;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${service.color}40`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = service.available ? service.color + "40" : "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: service.color + "15", fontSize: "18px" }}
      >
        {service.icon}
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: service.available ? service.color : "var(--muted)" }}>
            {service.name}
          </span>
          {service.available && (
            <span
              className="px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ fontSize: "8px", fontWeight: 600, color: "#059669", backgroundColor: "#05966910" }}
            >
              <span className="rounded-full" style={{ width: 4, height: 4, backgroundColor: "#059669" }} />
              Live
            </span>
          )}
          {!service.available && (
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{ fontSize: "8px", fontWeight: 600, backgroundColor: "var(--chip-bg)", color: "var(--muted)" }}
            >
              Bientot
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
