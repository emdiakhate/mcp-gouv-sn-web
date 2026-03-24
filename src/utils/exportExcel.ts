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
  const wb = XLSX.utils.book_new();
  let filename = "export";

  if (viz.type === "dashboard") {
    // Dashboard: multiple sheets
    if (viz.title) filename = slugify(viz.title);

    // Chart data sheet
    if (viz.chart) {
      const rows: (string | number)[][] = [];
      const header = ["", ...viz.chart.datasets.map((d) => d.label)];
      rows.push(header);
      viz.chart.labels.forEach((label, i) => {
        const row: (string | number)[] = [label];
        viz.chart!.datasets.forEach((ds) => row.push(ds.data[i] ?? ""));
        rows.push(row);
      });
      rows.push([]);
      rows.push(["Source : ANSD - Données officielles du Sénégal"]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Données");
    }

    // Stat cards sheet
    if (viz.statCards && viz.statCards.length > 0) {
      const statRows: (string | number)[][] = [["Indicateur", "Valeur", "Unité", "Contexte"]];
      viz.statCards.forEach((c) => {
        statRows.push([c.label, c.value, c.unit, c.context || ""]);
      });
      const ws2 = XLSX.utils.aoa_to_sheet(statRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Indicateurs");
    }

    // Analysis sheet
    if (viz.analysisCards && viz.analysisCards.length > 0) {
      const analysisRows: (string | number)[][] = [["Indicateur", "Analyse"]];
      viz.analysisCards.forEach((c) => {
        analysisRows.push([c.title, c.text]);
      });
      const ws3 = XLSX.utils.aoa_to_sheet(analysisRows);
      XLSX.utils.book_append_sheet(wb, ws3, "Analyse");
    }

    XLSX.writeFile(wb, `${filename}-${todayStr()}.xlsx`);
    return;
  }

  if (viz.type === "comparison") {
    if (viz.title) filename = slugify(viz.title);
    const rows: (string | number)[][] = [["Période", "Valeur", "Unité"]];
    viz.items?.forEach((item) => {
      rows.push([item.label, String(item.value), item.unit]);
    });
    if (viz.chart) {
      rows.push([]);
      rows.push(["--- Détail ---"]);
      const header = ["", ...viz.chart.datasets.map((d) => d.label)];
      rows.push(header);
      viz.chart.labels.forEach((label, i) => {
        const row: (string | number)[] = [label];
        viz.chart!.datasets.forEach((ds) => row.push(ds.data[i] ?? ""));
        rows.push(row);
      });
    }
    rows.push([]);
    rows.push(["Source : ANSD - Données officielles du Sénégal"]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    XLSX.writeFile(wb, `${filename}-${todayStr()}.xlsx`);
    return;
  }

  // Original types
  const rows: (string | number)[][] = [];

  if (viz.type === "table" && viz.columns && viz.rows) {
    rows.push(viz.columns);
    viz.rows.forEach((r) => rows.push(r));
    if (viz.title) filename = slugify(viz.title);
  } else if (viz.labels && viz.datasets) {
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

  rows.push([]);
  rows.push(["Source : ANSD - Données officielles du Sénégal"]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  XLSX.writeFile(wb, `${filename}-${todayStr()}.xlsx`);
}

export function copyVizData(viz: VizChartData): string {
  const lines: string[] = [];

  if (viz.type === "dashboard") {
    if (viz.statCards) {
      lines.push("Indicateur\tValeur\tUnité");
      viz.statCards.forEach((c) => lines.push(`${c.label}\t${c.value}\t${c.unit}`));
      lines.push("");
    }
    if (viz.chart) {
      const header = ["", ...viz.chart.datasets.map((d) => d.label)];
      lines.push(header.join("\t"));
      viz.chart.labels.forEach((label, i) => {
        const row = [label, ...viz.chart!.datasets.map((ds) => String(ds.data[i] ?? ""))];
        lines.push(row.join("\t"));
      });
    }
    return lines.join("\n");
  }

  if (viz.type === "comparison" && viz.items) {
    lines.push("Période\tValeur\tUnité");
    viz.items.forEach((item) => lines.push(`${item.label}\t${item.value}\t${item.unit}`));
    return lines.join("\n");
  }

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
