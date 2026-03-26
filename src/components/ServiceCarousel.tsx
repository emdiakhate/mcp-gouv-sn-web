"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { GOV_SERVICES, type GovService } from "@/constants/services";

interface ServiceCarouselProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServiceCarousel({ onSelectService }: ServiceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 200;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-2xl relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="carousel-scroll flex gap-3 overflow-x-auto px-1 py-1"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          .carousel-scroll::-webkit-scrollbar { display: none; }
        `}</style>
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
      className="flex flex-col items-center gap-1.5 rounded-xl border flex-shrink-0"
      style={{
        width: "90px",
        padding: "12px 8px",
        scrollSnapAlign: "start",
        backgroundColor: "var(--surface)",
        borderColor: service.available ? service.color + "40" : "var(--border)",
        opacity: service.available ? 1 : 0.5,
        cursor: service.available ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (service.available) {
          e.currentTarget.style.borderColor = service.color;
          e.currentTarget.style.boxShadow = `0 0 0 1px ${service.color}40`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = service.available ? service.color + "40" : "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Active dot */}
      {service.available && (
        <span
          className="absolute top-1.5 right-1.5 rounded-full"
          style={{ width: 6, height: 6, backgroundColor: service.color }}
        />
      )}

      {/* Coming soon badge */}
      {!service.available && (
        <span
          className="absolute top-1 right-1 px-1 py-0.5 rounded-full"
          style={{
            fontSize: "7px",
            fontWeight: 600,
            backgroundColor: "var(--chip-bg)",
            color: "var(--muted)",
          }}
        >
          Bientot
        </span>
      )}

      <span style={{ fontSize: "24px" }}>{service.icon}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: service.available ? service.color : "var(--muted)" }}
      >
        {service.name}
      </span>
      <span
        className="text-center leading-tight"
        style={{ fontSize: "9px", color: "var(--muted)", lineHeight: 1.3 }}
      >
        {service.description}
      </span>
    </button>
  );
}
