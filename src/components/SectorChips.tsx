"use client";

const SECTORS = [
  {
    name: "Santé",
    icon: "\uD83C\uDFE5",
    prompt: "Quelles données sont disponibles sur la santé au Sénégal ? Liste les thèmes et datasets.",
  },
  {
    name: "Économie",
    icon: "\uD83D\uDCCA",
    prompt: "Quelles données économiques sont disponibles pour le Sénégal ? (PIB, commerce, finances)",
  },
  {
    name: "Agriculture",
    icon: "\uD83C\uDF3E",
    prompt: "Quelles données agricoles sont disponibles ? (production, élevage, pêche)",
  },
  {
    name: "Éducation",
    icon: "\uD83C\uDF93",
    prompt: "Quelles données sur l'éducation au Sénégal sont disponibles ? (scolarisation, alphabétisation)",
  },
  {
    name: "Démographie",
    icon: "\uD83D\uDC65",
    prompt: "Quelles données démographiques sont disponibles ? (population, ménages, migration)",
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
