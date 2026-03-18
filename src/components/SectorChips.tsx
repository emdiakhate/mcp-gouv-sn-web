"use client";

const SECTORS = [
  {
    name: "Sante",
    icon: "\uD83C\uDFE5",
    prompt: "Quelles donnees sont disponibles sur la sante au Senegal ? Liste les themes et datasets.",
  },
  {
    name: "Economie",
    icon: "\uD83D\uDCCA",
    prompt: "Quelles donnees economiques sont disponibles pour le Senegal ? (PIB, commerce, finances)",
  },
  {
    name: "Agriculture",
    icon: "\uD83C\uDF3E",
    prompt: "Quelles donnees agricoles sont disponibles ? (production, elevage, peche)",
  },
  {
    name: "Education",
    icon: "\uD83C\uDF93",
    prompt: "Quelles donnees sur l'education au Senegal sont disponibles ? (scolarisation, alphabetisation)",
  },
  {
    name: "Demographie",
    icon: "\uD83D\uDC65",
    prompt: "Quelles donnees demographiques sont disponibles ? (population, menages, migration)",
  },
];

interface SectorChipsProps {
  onSelect: (prompt: string) => void;
}

export default function SectorChips({ onSelect }: SectorChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SECTORS.map((sector) => (
        <button
          key={sector.name}
          onClick={() => onSelect(sector.prompt)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border cursor-pointer"
          style={{
            backgroundColor: "var(--chip-bg)",
            borderColor: "var(--border)",
            color: "var(--chip-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--chip-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--chip-bg)";
          }}
        >
          <span>{sector.icon}</span>
          <span>{sector.name}</span>
        </button>
      ))}
    </div>
  );
}
