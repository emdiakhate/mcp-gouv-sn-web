"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { VizChartData } from "@/utils/parseViz";

export type ArtifactContent =
  | { kind: "viz"; viz: VizChartData }
  | { kind: "excel"; viz: VizChartData };

interface ArtifactContextValue {
  artifact: ArtifactContent | null;
  isOpen: boolean;
  openArtifact: (content: ArtifactContent) => void;
  closeArtifact: () => void;
}

const ArtifactContext = createContext<ArtifactContextValue | null>(null);

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifact, setArtifact] = useState<ArtifactContent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openArtifact = useCallback((content: ArtifactContent) => {
    setArtifact(content);
    setIsOpen(true);
  }, []);

  const closeArtifact = useCallback(() => {
    setIsOpen(false);
    // Delay clearing content so slide-out animation can play
    setTimeout(() => setArtifact(null), 300);
  }, []);

  return (
    <ArtifactContext.Provider value={{ artifact, isOpen, openArtifact, closeArtifact }}>
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifact() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error("useArtifact must be used within ArtifactProvider");
  return ctx;
}
