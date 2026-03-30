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
    title: "Statistiques sociales & démographiques",
    icon: "👥",
    color: "#2563EB",
    sectors: [
      {
        name: "Santé",
        icon: "🏥",
        datasets: ["Mortalité infantile", "Espérance de vie", "Couverture vaccinale", "Infrastructure sanitaire"],
        available: true,
        examplePrompt: "Quels sont les principaux indicateurs de santé au Sénégal ? Mortalité infantile, espérance de vie, couverture vaccinale.",
      },
      {
        name: "Démographie",
        icon: "👥",
        datasets: ["Population par région", "Ménages", "Migrations", "État civil"],
        available: true,
        examplePrompt: "Quelle est la population du Sénégal par région ? Affiche les données sous forme de graphique.",
      },
      {
        name: "Éducation",
        icon: "🎓",
        datasets: ["Taux de scolarisation", "Alphabétisation", "Infrastructure scolaire", "Enseignement supérieur"],
        available: true,
        examplePrompt: "Quel est le taux de scolarisation au Sénégal par niveau (primaire, secondaire) ? Montre l'évolution.",
      },
      {
        name: "Emploi",
        icon: "💼",
        datasets: ["Taux de chômage", "Emploi par secteur", "Emploi informel", "Salaires"],
        available: true,
        examplePrompt: "Quelles sont les données sur l'emploi au Sénégal ? Taux de chômage et répartition par secteur.",
      },
      {
        name: "Pauvreté",
        icon: "📉",
        datasets: ["Indice de pauvreté", "Inégalités", "Conditions de vie", "Dépenses des ménages"],
        available: true,
        examplePrompt: "Quels sont les indicateurs de pauvreté au Sénégal ? Évolution et répartition par région.",
      },
      {
        name: "Genre",
        icon: "⚖️",
        datasets: ["Parité", "Accès aux services", "Violences basées sur le genre"],
        available: false,
        examplePrompt: "Quelles sont les données sur l'égalité de genre au Sénégal ?",
      },
      {
        name: "Justice",
        icon: "⚖️",
        datasets: ["Criminalité", "Système judiciaire", "Population carcérale"],
        available: false,
        examplePrompt: "Quelles sont les statistiques judiciaires au Sénégal ?",
      },
    ],
  },
  {
    title: "Statistiques économiques & financières",
    icon: "💰",
    color: "#059669",
    sectors: [
      {
        name: "PIB & Croissance",
        icon: "📈",
        datasets: ["PIB nominal", "PIB réel", "Croissance par secteur", "Comptes nationaux"],
        available: true,
        examplePrompt: "Quelle est l'évolution du PIB du Sénégal sur les 10 dernières années ? Affiche un graphique.",
      },
      {
        name: "Prix & Inflation",
        icon: "🏷️",
        datasets: ["Indice des prix", "Inflation", "Prix à la consommation"],
        available: true,
        examplePrompt: "Quelle est l'évolution de l'inflation au Sénégal ? Montre l'indice des prix à la consommation.",
      },
      {
        name: "Commerce extérieur",
        icon: "🚢",
        datasets: ["Exportations", "Importations", "Balance commerciale", "Partenaires commerciaux"],
        available: true,
        examplePrompt: "Quelles sont les données du commerce extérieur du Sénégal ? Exportations, importations et balance commerciale.",
      },
      {
        name: "Industrie",
        icon: "🏭",
        datasets: ["Production industrielle", "Indice de production", "Secteur manufacturier"],
        available: false,
        examplePrompt: "Quelles sont les données sur la production industrielle au Sénégal ?",
      },
      {
        name: "Entreprises",
        icon: "🏢",
        datasets: ["Création d'entreprises", "Secteur privé", "PME/PMI"],
        available: false,
        examplePrompt: "Combien d'entreprises sont créées chaque année au Sénégal ?",
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
        datasets: ["Production céréalière", "Cultures de rente", "Surfaces cultivées", "Rendements"],
        available: true,
        examplePrompt: "Quelles sont les données sur la production agricole au Sénégal ? Principales cultures et leur évolution.",
      },
      {
        name: "Élevage",
        icon: "🐄",
        datasets: ["Cheptel", "Production laitière", "Viande", "Aviculture"],
        available: true,
        examplePrompt: "Quelles sont les données sur l'élevage au Sénégal ? Cheptel et production animale.",
      },
      {
        name: "Pêche",
        icon: "🐟",
        datasets: ["Captures", "Pêche artisanale", "Pêche industrielle", "Aquaculture"],
        available: true,
        examplePrompt: "Quelles sont les statistiques de la pêche au Sénégal ? Captures et types de pêche.",
      },
      {
        name: "Horticulture",
        icon: "🥬",
        datasets: ["Fruits", "Légumes", "Exportations horticoles"],
        available: false,
        examplePrompt: "Quelles sont les données sur l'horticulture au Sénégal ?",
      },
      {
        name: "Mines & Carrières",
        icon: "⛏️",
        datasets: ["Or", "Phosphates", "Zircon", "Production minière"],
        available: false,
        examplePrompt: "Quelles sont les données sur le secteur minier au Sénégal ?",
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
        datasets: ["Arrivées touristiques", "Recettes", "Hébergement", "Emploi touristique"],
        available: false,
        examplePrompt: "Quelles sont les statistiques du tourisme au Sénégal ?",
      },
      {
        name: "Transport",
        icon: "🚌",
        datasets: ["Transport routier", "Transport aérien", "Port de Dakar", "Mobilité urbaine"],
        available: false,
        examplePrompt: "Quelles sont les données sur les transports au Sénégal ?",
      },
      {
        name: "Environnement",
        icon: "🌳",
        datasets: ["Forêts", "Émissions CO2", "Ressources en eau", "Biodiversité"],
        available: false,
        examplePrompt: "Quelles sont les données environnementales du Sénégal ?",
      },
      {
        name: "TIC",
        icon: "📱",
        datasets: ["Pénétration internet", "Téléphonie mobile", "Économie numérique"],
        available: false,
        examplePrompt: "Quelles sont les données sur les TIC au Sénégal ? Pénétration internet et mobile.",
      },
    ],
  },
];

export const ANSD_SUGGESTED_QUESTIONS = [
  "Quelle est la population du Sénégal par région ?",
  "Montre l'évolution du PIB sur 10 ans",
  "Quels sont les indicateurs de santé au Sénégal ?",
  "Compare la production agricole par culture",
  "Analyse les progrès du Sénégal sur les ODD",
];
