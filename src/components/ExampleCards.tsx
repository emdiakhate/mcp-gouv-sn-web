"use client";

const EXAMPLES = [
  {
    icon: "📊",
    title: "Population par région",
    description: "Répartition démographique du Sénégal",
    prompt: "Quelle est la population du Sénégal par région ? Affiche les données sous forme de graphique.",
  },
  {
    icon: "🏥",
    title: "Indicateurs de santé",
    description: "Mortalité infantile, espérance de vie",
    prompt: "Quels sont les principaux indicateurs de santé au Sénégal ? Mortalité infantile, espérance de vie, couverture vaccinale.",
  },
  {
    icon: "🎓",
    title: "Taux de scolarisation",
    description: "Accès à l'éducation par niveau",
    prompt: "Quel est le taux de scolarisation au Sénégal par niveau (primaire, secondaire) ? Montre l'évolution.",
  },
  {
    icon: "💰",
    title: "Données économiques",
    description: "PIB, commerce extérieur, inflation",
    prompt: "Quelles sont les données économiques disponibles pour le Sénégal ? PIB, commerce, finances publiques.",
  },
  {
    icon: "🌾",
    title: "Production agricole",
    description: "Cultures, élevage, pêche",
    prompt: "Quelles sont les données sur la production agricole au Sénégal ? Principales cultures et leur évolution.",
  },
  {
    icon: "🎯",
    title: "Analyse ODD",
    description: "Objectifs de développement durable",
    prompt: "Analyse les progrès du Sénégal sur les Objectifs de Développement Durable (ODD). Montre un dashboard avec les indicateurs clés.",
  },
];

interface ExampleCardsProps {
  onSelect: (prompt: string) => void;
}

export default function ExampleCards({ onSelect }: ExampleCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
      {EXAMPLES.map((ex) => (
        <button
          key={ex.title}
          onClick={() => onSelect(ex.prompt)}
          className="flex flex-col items-start text-left gap-1 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-hover)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{ex.icon}</span>
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {ex.title}
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {ex.description}
          </span>
        </button>
      ))}
    </div>
  );
}
