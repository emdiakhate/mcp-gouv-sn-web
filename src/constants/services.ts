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
}

export const GOV_SERVICES: GovService[] = [
  {
    id: "ansd",
    name: "ANSD",
    fullName: "Agence Nationale de la Statistique et de la Demographie",
    icon: "📊",
    color: "#00853F",
    description: "Statistiques nationales du Senegal",
    website: "https://www.ansd.sn",
    available: true,
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
  },
  {
    id: "dgid",
    name: "DGID",
    fullName: "Direction Generale des Impots et des Domaines",
    icon: "🏛️",
    color: "#7C3AED",
    description: "Fiscalite et domaines",
    website: "https://www.dgid.sn",
    available: false,
  },
  {
    id: "mepc",
    name: "MEPC",
    fullName: "Ministere de l'Economie, du Plan et de la Cooperation",
    icon: "📈",
    color: "#059669",
    description: "Politique economique et planification",
    website: "https://www.economie.gouv.sn",
    available: false,
  },
  {
    id: "bceao",
    name: "BCEAO",
    fullName: "Banque Centrale des Etats de l'Afrique de l'Ouest",
    icon: "🏦",
    color: "#D97706",
    description: "Politique monetaire et statistiques bancaires",
    website: "https://www.bceao.int",
    available: false,
  },
  {
    id: "armp",
    name: "ARMP",
    fullName: "Autorite de Regulation des Marches Publics",
    icon: "📋",
    color: "#DC2626",
    description: "Marches publics et transparence",
    website: "https://www.armp.sn",
    available: false,
  },
  {
    id: "brvm",
    name: "BRVM",
    fullName: "Bourse Regionale des Valeurs Mobilieres",
    icon: "📉",
    color: "#0891B2",
    description: "Marches financiers UEMOA",
    website: "https://www.brvm.org",
    available: false,
  },
  {
    id: "dpee",
    name: "DPEE",
    fullName: "Direction de la Prevision et des Etudes Economiques",
    icon: "🔮",
    color: "#BE185D",
    description: "Previsions et conjoncture economique",
    website: "https://www.dpee.sn",
    available: false,
  },
  {
    id: "msas",
    name: "MSAS",
    fullName: "Ministere de la Sante et de l'Action Sociale",
    icon: "🏥",
    color: "#EA580C",
    description: "Sante publique et action sociale",
    website: "https://www.sante.gouv.sn",
    available: false,
  },
  {
    id: "men",
    name: "MEN",
    fullName: "Ministere de l'Education Nationale",
    icon: "🎓",
    color: "#4F46E5",
    description: "Education et formation",
    website: "https://www.education.gouv.sn",
    available: false,
  },
];
