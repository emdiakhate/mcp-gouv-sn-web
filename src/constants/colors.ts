/** Palette de couleurs pour les visualisations */
export const VIZ_COLORS = {
  primary: "#1D9E75",
  secondary: "#378ADD",
  tertiary: "#7F77DD",
  warning: "#BA7517",
  danger: "#E24B4A",
  statBg: "#E1F5EE",
} as const;

/** Ordre des couleurs pour les datasets multiples */
export const DATASET_COLORS = [
  VIZ_COLORS.primary,
  VIZ_COLORS.secondary,
  VIZ_COLORS.tertiary,
  VIZ_COLORS.warning,
  VIZ_COLORS.danger,
] as const;

/** Couleurs individuelles par région / catégorie (multiColor bars) */
export const REGION_COLORS = [
  "#1D9E75", "#378ADD", "#7F77DD", "#D85A30",
  "#BA7517", "#D4537E", "#639922", "#888780",
  "#5DCAA5", "#85B7EB", "#AFA9EC", "#F0997B",
  "#EF9F27", "#ED93B1",
] as const;

/** Versions avec opacité pour les remplissages */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
