export interface ANSDSector {
  name: string;
  icon: string;
  datasets: string[];
  available: boolean;
  examplePrompt: string;
}

export interface ANSDFamily {
  title: string;
  icon: string;
  color: string;
  sectors: ANSDSector[];
}

export const ANSD_FAMILIES: ANSDFamily[] = [
  {
    title: "Statistiques sociales & demographiques",
    icon: "👥",
    color: "#2563EB",
    sectors: [
      {
        name: "Sante",
        icon: "🏥",
        datasets: ["Mortalite infantile", "Esperance de vie", "Couverture vaccinale", "Infrastructure sanitaire"],
        available: true,
        examplePrompt: "Quels sont les principaux indicateurs de sante au Senegal ? Mortalite infantile, esperance de vie, couverture vaccinale.",
      },
      {
        name: "Demographie",
        icon: "👥",
        datasets: ["Population par region", "Menages", "Migrations", "Etat civil"],
        available: true,
        examplePrompt: "Quelle est la population du Senegal par region ? Affiche les donnees sous forme de graphique.",
      },
      {
        name: "Education",
        icon: "🎓",
        datasets: ["Taux de scolarisation", "Alphabetisation", "Infrastructure scolaire", "Enseignement superieur"],
        available: true,
        examplePrompt: "Quel est le taux de scolarisation au Senegal par niveau (primaire, secondaire) ? Montre l'evolution.",
      },
      {
        name: "Emploi",
        icon: "💼",
        datasets: ["Taux de chomage", "Emploi par secteur", "Emploi informel", "Salaires"],
        available: true,
        examplePrompt: "Quelles sont les donnees sur l'emploi au Senegal ? Taux de chomage et repartition par secteur.",
      },
      {
        name: "Pauvrete",
        icon: "📉",
        datasets: ["Indice de pauvrete", "Inegalites", "Conditions de vie", "Depenses des menages"],
        available: true,
        examplePrompt: "Quels sont les indicateurs de pauvrete au Senegal ? Evolution et repartition par region.",
      },
      {
        name: "Genre",
        icon: "⚖️",
        datasets: ["Parite", "Acces aux services", "Violences basees sur le genre"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur l'egalite de genre au Senegal ?",
      },
      {
        name: "Justice",
        icon: "⚖️",
        datasets: ["Criminalite", "Systeme judiciaire", "Population carcerale"],
        available: false,
        examplePrompt: "Quelles sont les statistiques judiciaires au Senegal ?",
      },
    ],
  },
  {
    title: "Statistiques economiques & financieres",
    icon: "💰",
    color: "#059669",
    sectors: [
      {
        name: "PIB & Croissance",
        icon: "📈",
        datasets: ["PIB nominal", "PIB reel", "Croissance par secteur", "Comptes nationaux"],
        available: true,
        examplePrompt: "Quelle est l'evolution du PIB du Senegal sur les 10 dernieres annees ? Affiche un graphique.",
      },
      {
        name: "Prix & Inflation",
        icon: "🏷️",
        datasets: ["Indice des prix", "Inflation", "Prix a la consommation"],
        available: true,
        examplePrompt: "Quelle est l'evolution de l'inflation au Senegal ? Montre l'indice des prix a la consommation.",
      },
      {
        name: "Commerce exterieur",
        icon: "🚢",
        datasets: ["Exportations", "Importations", "Balance commerciale", "Partenaires commerciaux"],
        available: true,
        examplePrompt: "Quelles sont les donnees du commerce exterieur du Senegal ? Exportations, importations et balance commerciale.",
      },
      {
        name: "Industrie",
        icon: "🏭",
        datasets: ["Production industrielle", "Indice de production", "Secteur manufacturier"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur la production industrielle au Senegal ?",
      },
      {
        name: "Entreprises",
        icon: "🏢",
        datasets: ["Creation d'entreprises", "Secteur prive", "PME/PMI"],
        available: false,
        examplePrompt: "Combien d'entreprises sont creees chaque annee au Senegal ?",
      },
    ],
  },
  {
    title: "Secteur primaire",
    icon: "🌾",
    color: "#D97706",
    sectors: [
      {
        name: "Agriculture",
        icon: "🌾",
        datasets: ["Production cerealiere", "Cultures de rente", "Surfaces cultivees", "Rendements"],
        available: true,
        examplePrompt: "Quelles sont les donnees sur la production agricole au Senegal ? Principales cultures et leur evolution.",
      },
      {
        name: "Elevage",
        icon: "🐄",
        datasets: ["Cheptel", "Production laitiere", "Viande", "Aviculture"],
        available: true,
        examplePrompt: "Quelles sont les donnees sur l'elevage au Senegal ? Cheptel et production animale.",
      },
      {
        name: "Peche",
        icon: "🐟",
        datasets: ["Captures", "Peche artisanale", "Peche industrielle", "Aquaculture"],
        available: true,
        examplePrompt: "Quelles sont les statistiques de la peche au Senegal ? Captures et types de peche.",
      },
      {
        name: "Horticulture",
        icon: "🥬",
        datasets: ["Fruits", "Legumes", "Exportations horticoles"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur l'horticulture au Senegal ?",
      },
      {
        name: "Mines & Carrieres",
        icon: "⛏️",
        datasets: ["Or", "Phosphates", "Zircon", "Production miniere"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur le secteur minier au Senegal ?",
      },
    ],
  },
  {
    title: "Services & environnement",
    icon: "🌍",
    color: "#7C3AED",
    sectors: [
      {
        name: "Tourisme",
        icon: "✈️",
        datasets: ["Arrivees touristiques", "Recettes", "Hebergement", "Emploi touristique"],
        available: false,
        examplePrompt: "Quelles sont les statistiques du tourisme au Senegal ?",
      },
      {
        name: "Transport",
        icon: "🚌",
        datasets: ["Transport routier", "Transport aerien", "Port de Dakar", "Mobilite urbaine"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur les transports au Senegal ?",
      },
      {
        name: "Environnement",
        icon: "🌳",
        datasets: ["Forets", "Emissions CO2", "Ressources en eau", "Biodiversite"],
        available: false,
        examplePrompt: "Quelles sont les donnees environnementales du Senegal ?",
      },
      {
        name: "TIC",
        icon: "📱",
        datasets: ["Penetration internet", "Telephonie mobile", "Economie numerique"],
        available: false,
        examplePrompt: "Quelles sont les donnees sur les TIC au Senegal ? Penetration internet et mobile.",
      },
    ],
  },
];

export const ANSD_SUGGESTED_QUESTIONS = [
  "Quelle est la population du Senegal par region ?",
  "Montre l'evolution du PIB sur 10 ans",
  "Quels sont les indicateurs de sante au Senegal ?",
  "Compare la production agricole par culture",
  "Analyse les progres du Senegal sur les ODD",
];
