"use client";

import { useEffect, useCallback, type ReactNode } from "react";

interface FullscreenModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export default function FullscreenModal({ children, onClose, title }: FullscreenModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative overflow-y-auto rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", width: "70vw", maxWidth: "800px", maxHeight: "75vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg cursor-pointer hover:opacity-80"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            title="Fermer (Échap)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {children}

        {/* Hint */}
        <p className="text-center text-[10px] mt-4" style={{ color: "var(--muted)" }}>
          Appuyez sur <kbd className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>Échap</kbd> pour fermer
        </p>
      </div>
    </div>
  );
}
