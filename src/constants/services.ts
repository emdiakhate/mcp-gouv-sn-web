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
  color: string;
  description: string;
  website: string;
  available: boolean;
  initials: string;
}

export const GOV_SERVICES: GovService[] = [
  {
    id: "ansd",
    name: "ANSD",
    fullName: "Agence Nationale de la Statistique et de la Démographie",
    icon: "📊",
    color: "#00853F",
    description: "Statistiques nationales du Sénégal",
    website: "https://www.ansd.sn",
    available: true,
    initials: "AN",
  },
  {
    id: "apix",
    name: "APIX",
    fullName: "Agence pour la Promotion des Investissements",
    icon: "🏗️",
    color: "#2563EB",
    description: "Investissements et grands travaux",
    website: "https://investinsenegal.com",
    available: false,
    initials: "AP",
  },
  {
    id: "dgid",
    name: "DGID",
    fullName: "Direction Générale des Impôts et des Domaines",
    icon: "🏛️",
    color: "#7C3AED",
    description: "Fiscalité et domaines",
    website: "https://www.dgid.sn",
    available: false,
    initials: "DG",
  },
  {
    id: "mepc",
    name: "MEPC",
    fullName: "Ministère de l'Économie, du Plan et de la Coopération",
    icon: "📈",
    color: "#059669",
    description: "Politique économique et planification",
    website: "https://www.economie.gouv.sn",
    available: false,
    initials: "ME",
  },
  {
    id: "bceao",
    name: "BCEAO",
    fullName: "Banque Centrale des États de l'Afrique de l'Ouest",
    icon: "🏦",
    color: "#D97706",
    description: "Politique monétaire et statistiques bancaires",
    website: "https://www.bceao.int",
    available: false,
    initials: "BC",
  },
  {
    id: "armp",
    name: "ARMP",
    fullName: "Autorité de Régulation des Marchés Publics",
    icon: "📋",
    color: "#DC2626",
    description: "Marchés publics et transparence",
    website: "https://www.armp.sn",
    available: false,
    initials: "AR",
  },
  {
    id: "brvm",
    name: "BRVM",
    fullName: "Bourse Régionale des Valeurs Mobilières",
    icon: "📉",
    color: "#0891B2",
    description: "Marchés financiers UEMOA",
    website: "https://www.brvm.org",
    available: false,
    initials: "BR",
  },
  {
    id: "dpee",
    name: "DPEE",
    fullName: "Direction de la Prévision et des Études Économiques",
    icon: "🔮",
    color: "#BE185D",
    description: "Prévisions et conjoncture économique",
    website: "https://www.dpee.sn",
    available: false,
    initials: "DP",
  },
  {
    id: "msas",
    name: "MSAS",
    fullName: "Ministère de la Santé et de l'Action Sociale",
    icon: "🏥",
    color: "#EA580C",
    description: "Santé publique et action sociale",
    website: "https://www.sante.gouv.sn",
    available: false,
    initials: "MS",
  },
  {
    id: "men",
    name: "MEN",
    fullName: "Ministère de l'Éducation Nationale",
    icon: "🎓",
    color: "#4F46E5",
    description: "Éducation et formation",
    website: "https://www.education.gouv.sn",
    available: false,
    initials: "MN",
  },
];
