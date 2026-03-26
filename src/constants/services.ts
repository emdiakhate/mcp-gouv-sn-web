export interface ServiceSector {
  name: string;
  icon: string;
  description: string;
  examplePrompt: string;
}

export interface GovService {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  description: string;
  website: string;
  available: boolean;
  sectors: ServiceSector[];
  dataSources: string[];
  howToUse: string;
}

export const GOV_SERVICES: GovService[] = [
  {
    id: "ansd",
    name: "ANSD",
    fullName: "Agence Nationale de la Statistique et de la Démographie",
    icon: "📊",
    description:
      "L'ANSD est l'organisme officiel de production statistique du Sénégal. Elle collecte, traite et diffuse les données démographiques, économiques et sociales du pays à travers des recensements, enquêtes et études régulières.",
    website: "https://www.ansd.sn",
    available: true,
    sectors: [
      {
        name: "Santé",
        icon: "🏥",
        description: "Mortalité infantile, espérance de vie, couverture vaccinale, infrastructure sanitaire",
        examplePrompt: "Quels sont les principaux indicateurs de santé au Sénégal ? Mortalité infantile, espérance de vie, couverture vaccinale.",
      },
      {
        name: "Économie",
        icon: "💰",
        description: "PIB, commerce extérieur, inflation, finances publiques, emploi",
        examplePrompt: "Quelles sont les données économiques disponibles pour le Sénégal ? PIB, commerce, finances publiques.",
      },
      {
        name: "Agriculture",
        icon: "🌾",
        description: "Production agricole, élevage, pêche, sécurité alimentaire",
        examplePrompt: "Quelles sont les données sur la production agricole au Sénégal ? Principales cultures et leur évolution.",
      },
      {
        name: "Éducation",
        icon: "🎓",
        description: "Taux de scolarisation, alphabétisation, infrastructure scolaire",
        examplePrompt: "Quel est le taux de scolarisation au Sénégal par niveau (primaire, secondaire) ? Montre l'évolution.",
      },
      {
        name: "Démographie",
        icon: "👥",
        description: "Population par région, ménages, migrations, état civil",
        examplePrompt: "Quelle est la population du Sénégal par région ? Affiche les données sous forme de graphique.",
      },
      {
        name: "ODD",
        icon: "🎯",
        description: "Suivi des Objectifs de Développement Durable au Sénégal",
        examplePrompt: "Analyse les progrès du Sénégal sur les Objectifs de Développement Durable (ODD). Montre un dashboard avec les indicateurs clés.",
      },
    ],
    dataSources: [
      "Recensement Général de la Population et de l'Habitat (RGPH)",
      "Enquête Démographique et de Santé (EDS)",
      "Enquête Nationale sur l'Emploi (ENES)",
      "Comptes Nationaux",
      "Enquête Harmonisée sur les Conditions de Vie des Ménages (EHCVM)",
      "Situation Économique et Sociale (SES)",
    ],
    howToUse:
      "Posez une question en langage naturel sur n'importe quel indicateur. Le système interroge automatiquement les datasets ANSD via le protocole MCP, récupère les données et génère des visualisations (graphiques, tableaux, dashboards). Exemples : \"Évolution du PIB sur 10 ans\", \"Comparer la mortalité infantile par région\", \"Dashboard ODD du Sénégal\".",
  },
  {
    id: "apix",
    name: "APIX",
    fullName: "Agence pour la Promotion des Investissements et des Grands Travaux",
    icon: "🏗️",
    description:
      "L'APIX facilite les investissements au Sénégal et pilote les grands projets d'infrastructure. Données sur les flux d'investissement, projets en cours et climat des affaires.",
    website: "https://investinsenegal.com",
    available: false,
    sectors: [],
    dataSources: [],
    howToUse: "",
  },
  {
    id: "dgid",
    name: "DGID",
    fullName: "Direction Générale des Impôts et des Domaines",
    icon: "🏛️",
    description:
      "La DGID gère la politique fiscale du Sénégal. Données sur les recettes fiscales, la pression fiscale et les réformes du système d'imposition.",
    website: "https://www.dgid.sn",
    available: false,
    sectors: [],
    dataSources: [],
    howToUse: "",
  },
  {
    id: "mepc",
    name: "MEPC",
    fullName: "Ministère de l'Économie, du Plan et de la Coopération",
    icon: "📈",
    description:
      "Le MEPC élabore la politique économique et coordonne la planification du développement. Données sur les finances publiques, le budget et la coopération internationale.",
    website: "https://www.economie.gouv.sn",
    available: false,
    sectors: [],
    dataSources: [],
    howToUse: "",
  },
];
