import * as XLSX from "xlsx";
import type { VizChartData } from "./parseViz";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportVizToExcel(viz: VizChartData): void {
  const rows: (string | number)[][] = [];
  let sheetName = "Données";
  let filename = "export";

  if (viz.type === "table" && viz.columns && viz.rows) {
    rows.push(viz.columns);
    viz.rows.forEach((r) => rows.push(r));
    if (viz.title) filename = slugify(viz.title);
  } else if (viz.labels && viz.datasets) {
    // bar, line, pie, grouped-bar
    const header = ["", ...viz.datasets.map((d) => d.label)];
    rows.push(header);
    viz.labels.forEach((label, i) => {
      const row: (string | number)[] = [label];
      viz.datasets!.forEach((ds) => row.push(ds.data[i] ?? ""));
      rows.push(row);
    });
    if (viz.title) filename = slugify(viz.title);
  } else if (viz.type === "stat") {
    rows.push(["Indicateur", "Valeur", "Unité"]);
    rows.push([viz.label || "", viz.value || "", viz.unit || ""]);
    filename = slugify(viz.label || "stat");
  }

  // Source footer
  rows.push([]);
  rows.push(["Source : ANSD - Données officielles du Sénégal"]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}-${todayStr()}.xlsx`);
}

export function copyVizData(viz: VizChartData): string {
  const lines: string[] = [];

  if (viz.type === "table" && viz.columns && viz.rows) {
    lines.push(viz.columns.join("\t"));
    viz.rows.forEach((r) => lines.push(r.map(String).join("\t")));
  } else if (viz.labels && viz.datasets) {
    const header = ["", ...viz.datasets.map((d) => d.label)];
    lines.push(header.join("\t"));
    viz.labels.forEach((label, i) => {
      const row = [label, ...viz.datasets!.map((ds) => String(ds.data[i] ?? ""))];
      lines.push(row.join("\t"));
    });
  } else if (viz.type === "stat") {
    lines.push(`${viz.label}: ${viz.value} ${viz.unit || ""}`);
  }

  return lines.join("\n");
}
