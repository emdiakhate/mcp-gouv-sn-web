"use client";

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import type { VizChartData } from "@/utils/parseViz";
import { DATASET_COLORS, REGION_COLORS, withAlpha } from "@/constants/colors";
import { exportVizToExcel, copyVizData } from "@/utils/exportExcel";
import FullscreenModal from "./FullscreenModal";
import ExcelCard from "./ExcelCard";
import { useArtifact } from "@/contexts/ArtifactContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

/* ─── Design constants ─── */
const W = {
  bg: "#FFFFFF",
  border: "0.5px solid #E8E8E8",
  radius: "12px",
  titleColor: "#1a1a1a",
  titleSize: "14px",
  subtitleColor: "#888",
  subtitleSize: "11px",
  gridColor: "rgba(0,0,0,0.06)",
  axisColor: "#888",
  rowAlt: "#F8FFFE",
  headerBg: "#0F6E56",
  numColor: "#0F6E56",
  insightBg: "#FAEEDA",
  insightBorder: "#EF9F27",
  insightText: "#633806",
} as const;

/* ─── Status color map ─── */
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  danger:  { bg: "#FCEBEB", border: "#F09595", text: "#A32D2D" },
  warning: { bg: "#FAEEDA", border: "#EF9F27", text: "#854F0B" },
  success: { bg: "#E1F5EE", border: "#5DCAA5", text: "#0F6E56" },
  neutral: { bg: "#F1EFE8", border: "#B4B2A9", text: "#444441" },
};

const STATUS_ICONS: Record<string, string> = {
  danger: "\u2717", warning: "\u26A0", success: "\u2713", neutral: "\u2139",
};

const CHART_COLORS = [
  "#1D9E75", "#378ADD", "#7F77DD", "#D85A30",
  "#BA7517", "#D4537E", "#639922", "#E24B4A",
];

/* ─── Shared chart scale options ─── */
const GRID_OPTS = { color: W.gridColor };
const AXIS_TICKS = { color: W.axisColor, font: { size: 11 } };

/* ─── Shared wrapper ─── */
function VizCard({ children, viz }: { children: React.ReactNode; viz: VizChartData }) {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const { openArtifact } = useArtifact();
  const showExport = ["bar", "line", "grouped-bar", "table", "excel"].includes(viz.type);
  const canExpand = ["bar", "line", "pie", "grouped-bar", "table", "stat", "dashboard", "comparison"].includes(viz.type);

  const handleCopy = async () => {
    const text = copyVizData(viz);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpand = () => {
    openArtifact({ kind: "viz", viz });
  };

  return (
    <>
      <div
        className="my-3 overflow-hidden group/viz"
        style={{
          background: W.bg, border: W.border, borderRadius: W.radius, padding: "16px",
          cursor: canExpand ? "zoom-in" : undefined,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onClick={canExpand ? handleExpand : undefined}
        onMouseEnter={canExpand ? (e) => {
          e.currentTarget.style.borderColor = "#0F6E56";
          e.currentTarget.style.boxShadow = "0 0 0 1px rgba(15,110,86,0.1)";
        } : undefined}
        onMouseLeave={canExpand ? (e) => {
          e.currentTarget.style.borderColor = "#E8E8E8";
          e.currentTarget.style.boxShadow = "none";
        } : undefined}
      >
        {/* Header */}
        {(viz.title || viz.subtitle) && (
          <div className="flex items-start justify-between mb-3">
            <div>
              {viz.title && (
                <h3 style={{ fontSize: W.titleSize, fontWeight: 500, color: W.titleColor, margin: 0 }}>
                  {viz.title}
                </h3>
              )}
              {viz.subtitle && (
                <p style={{ fontSize: W.subtitleSize, color: W.subtitleColor, margin: "2px 0 0" }}>
                  {viz.subtitle}
                </p>
              )}
            </div>
            {canExpand && (
              <span
                className="flex items-center gap-1 opacity-0 group-hover/viz:opacity-100 flex-shrink-0"
                style={{ fontSize: "10px", color: "#0F6E56", transition: "opacity 0.15s", pointerEvents: "none" }}
              >
                cliquer pour agrandir
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {children}

        {/* Insight */}
        {viz.insight && (
          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2 mt-3"
            style={{ backgroundColor: W.insightBg, border: `0.5px solid ${W.insightBorder}`, color: W.insightText, fontSize: "12px" }}
          >
            <span className="flex-shrink-0">💡</span>
            <span>{viz.insight}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "0.5px solid #E8E8E8" }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:opacity-80"
            style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px", border: "0.5px solid #E8E8E8" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "Copié !" : "Copier"}
          </button>
          {showExport && (
            <button
              onClick={() => exportVizToExcel(viz)}
              className="flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:opacity-80"
              style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px", border: "0.5px solid #E8E8E8" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Excel
            </button>
          )}
          {canExpand && (
            <button
              onClick={handleExpand}
              className="flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:opacity-80 ml-auto"
              style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px", border: "0.5px solid #E8E8E8" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
              Agrandir
            </button>
          )}
        </div>
      </div>

      {fullscreen && (
        <FullscreenModal onClose={() => setFullscreen(false)} title={viz.title}>
          <VizRendererFullscreen viz={viz} />
        </FullscreenModal>
      )}
    </>
  );
}

/* ─── Fullscreen viz renderer ─── */
function VizRendererFullscreen({ viz }: { viz: VizChartData }) {
  switch (viz.type) {
    case "bar": return <BarVizFS viz={viz} />;
    case "line": return <LineVizFS viz={viz} />;
    case "pie": return <PieVizFS viz={viz} />;
    case "grouped-bar": return <GroupedBarVizFS viz={viz} />;
    case "table": return <TableViz viz={viz} />;
    default: return null;
  }
}

function BarVizFS({ viz }: { viz: VizChartData }) {
  const hasLongLabels = viz.labels?.some((l) => l.length > 8);
  const isHorizontal = hasLongLabels;
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: (viz.datasets || []).map((ds, i) => {
      const useMulti = viz.multiColor && (viz.datasets?.length || 0) <= 1;
      return {
        label: ds.label, data: ds.data,
        backgroundColor: useMulti ? (viz.labels || []).map((_, li) => REGION_COLORS[li % REGION_COLORS.length]) : DATASET_COLORS[i % DATASET_COLORS.length],
        borderRadius: 4, maxBarThickness: 50,
      };
    }),
  }), [viz]);
  const options = useMemo(() => ({
    indexAxis: (isHorizontal ? "y" : "x") as "x" | "y",
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: (viz.datasets?.length || 0) > 1 } },
    scales: { x: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), [viz, isHorizontal]);
  const h = isHorizontal ? Math.max(400, (viz.labels?.length || 0) * 45) : 500;
  return <div style={{ height: h }}><Bar data={data} options={options} /></div>;
}

function LineVizFS({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const main = (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      borderColor: ds.color || DATASET_COLORS[i % DATASET_COLORS.length],
      backgroundColor: withAlpha(ds.color || DATASET_COLORS[i % DATASET_COLORS.length], 0.08),
      fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 8,
    }));
    const refs = (viz.referenceLines || []).map((ref) => ({
      label: ref.label, data: new Array((viz.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A", backgroundColor: "transparent",
      borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0,
    }));
    return { labels: viz.labels || [], datasets: [...main, ...refs] };
  }, [viz]);
  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" as const, labels: { color: W.axisColor } } },
    scales: { x: { ticks: AXIS_TICKS, grid: { display: false } }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), []);
  return <div style={{ height: 500 }}><Line data={data} options={options} /></div>;
}

function PieVizFS({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: [{ data: viz.datasets?.[0]?.data || [], backgroundColor: (viz.labels || []).map((_, i) => REGION_COLORS[i % REGION_COLORS.length]), borderWidth: 1, borderColor: "#fff" }],
  }), [viz]);
  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "right" as const, labels: { boxWidth: 14, padding: 16, font: { size: 13 }, color: W.axisColor } } },
  }), []);
  return <div style={{ height: 500 }}><Pie data={data} options={options} /></div>;
}

function GroupedBarVizFS({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      backgroundColor: DATASET_COLORS[i % DATASET_COLORS.length], borderRadius: 4, maxBarThickness: 50,
    })),
  }), [viz]);
  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" as const, labels: { color: W.axisColor } } },
    scales: { x: { grid: { display: false }, ticks: AXIS_TICKS }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), []);
  return <div style={{ height: 500 }}><Bar data={data} options={options} /></div>;
}

/* ─── Stat card ─── */
function StatViz({ viz }: { viz: VizChartData }) {
  const isUp = viz.trendDirection === "up";
  const isDown = viz.trendDirection === "down";

  return (
    <VizCard viz={viz}>
      <div
        className="flex flex-col items-center py-5 rounded-lg"
        style={{ backgroundColor: "#E1F5EE" }}
      >
        <span style={{ fontSize: "24px", fontWeight: 600, color: "#0F6E56" }}>
          {viz.value}
        </span>
        {viz.unit && (
          <span style={{ fontSize: "11px", marginTop: "4px", color: "#666", opacity: 0.85 }}>
            {viz.unit}
          </span>
        )}
        {viz.label && (
          <span style={{ fontSize: "11px", marginTop: "8px", fontWeight: 500, color: "#1a1a1a" }}>
            {viz.label}
          </span>
        )}
        {viz.trend && (
          <span
            className="mt-2 px-2 py-0.5 rounded-full"
            style={{
              fontSize: "11px", fontWeight: 500,
              backgroundColor: isUp ? "#E1F5EE" : isDown ? "#FCEBEB" : "#F1EFE8",
              color: isUp ? "#0F6E56" : isDown ? "#A32D2D" : "#444",
              border: `0.5px solid ${isUp ? "#5DCAA5" : isDown ? "#F09595" : "#B4B2A9"}`,
            }}
          >
            {viz.trend}
          </span>
        )}
      </div>
    </VizCard>
  );
}

/* ─── Bar chart ─── */
function BarViz({ viz }: { viz: VizChartData }) {
  const hasLongLabels = viz.labels?.some((l) => l.length > 8);
  const isHorizontal = hasLongLabels;

  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: (viz.datasets || []).map((ds, i) => {
      const useMulti = viz.multiColor && (viz.datasets?.length || 0) <= 1;
      return {
        label: ds.label, data: ds.data,
        backgroundColor: useMulti
          ? (viz.labels || []).map((_, li) => REGION_COLORS[li % REGION_COLORS.length])
          : DATASET_COLORS[i % DATASET_COLORS.length],
        borderRadius: 4, maxBarThickness: 40,
      };
    }),
  }), [viz]);

  const options = useMemo(() => ({
    indexAxis: (isHorizontal ? "y" : "x") as "x" | "y",
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: (viz.datasets?.length || 0) > 1, position: "top" as const, labels: { color: W.axisColor } },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            const dsIndex = ctx.datasetIndex ?? 0;
            const unit = viz.datasets?.[dsIndex]?.unit || "";
            const val = isHorizontal ? ctx.parsed.x : ctx.parsed.y;
            return `${ctx.dataset.label}: ${(val ?? 0).toLocaleString("fr-FR")} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true, grid: { display: !isHorizontal, color: W.gridColor }, ticks: AXIS_TICKS },
      y: { beginAtZero: true, grid: { display: isHorizontal, color: W.gridColor }, ticks: AXIS_TICKS },
    },
  }), [viz, isHorizontal]);

  const height = isHorizontal ? Math.max(200, (viz.labels?.length || 0) * 35) : 280;

  return (
    <VizCard viz={viz}>
      <div style={{ height }}><Bar data={data} options={options} /></div>
    </VizCard>
  );
}

/* ─── Line chart ─── */
function LineViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const mainDatasets = (viz.datasets || []).map((ds, i) => {
      const color = ds.color || DATASET_COLORS[i % DATASET_COLORS.length];
      return {
        label: ds.label, data: ds.data,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.08),
        fill: true, tension: 0.3, pointRadius: 4, pointHoverRadius: 6,
      };
    });
    const refDatasets = (viz.referenceLines || []).map((ref) => ({
      label: ref.label,
      data: new Array((viz.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A", backgroundColor: "transparent",
      borderWidth: 2, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0,
    }));
    return { labels: viz.labels || [], datasets: [...mainDatasets, ...refDatasets] };
  }, [viz]);

  const hasRefLines = (viz.referenceLines?.length || 0) > 0;

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: (viz.datasets?.length || 0) > 1 || hasRefLines, position: "top" as const, labels: { color: W.axisColor } },
    },
    scales: {
      x: { ticks: AXIS_TICKS, grid: { display: false } },
      y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS },
    },
  }), [viz, hasRefLines]);

  return (
    <VizCard viz={viz}>
      <div style={{ height: 280 }}><Line data={data} options={options} /></div>
    </VizCard>
  );
}

/* ─── Pie / Donut ─── */
function PieViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: [{
      data: viz.datasets?.[0]?.data || [],
      backgroundColor: (viz.labels || []).map((_, i) => REGION_COLORS[i % REGION_COLORS.length]),
      borderWidth: 1, borderColor: "#fff",
    }],
  }), [viz]);

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false, cutout: "55%",
    plugins: {
      legend: { position: "right" as const, labels: { boxWidth: 12, padding: 12, font: { size: 11 }, color: W.axisColor } },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            const unit = viz.datasets?.[0]?.unit || "";
            return `${ctx.label}: ${ctx.parsed}${unit}`;
          },
        },
      },
    },
  }), [viz]);

  return (
    <VizCard viz={viz}>
      <div style={{ height: 260 }}><Pie data={data} options={options} /></div>
    </VizCard>
  );
}

/* ─── Table ─── */
function TableViz({ viz }: { viz: VizChartData }) {
  const highlightIdx = viz.columns?.indexOf(viz.highlight || "");

  return (
    <VizCard viz={viz}>
      <div className="overflow-x-auto" style={{ borderRadius: "8px", border: "0.5px solid #E8E8E8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              {viz.columns?.map((col, i) => (
                <th key={i} style={{
                  backgroundColor: W.headerBg, color: "#fff",
                  padding: "8px 12px", textAlign: "left", fontWeight: i === highlightIdx ? 700 : 500, whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viz.rows?.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? "#fff" : W.rowAlt }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "7px 12px", borderBottom: "0.5px solid #eee",
                    color: typeof cell === "number" ? W.numColor : "#333",
                    fontWeight: ci === 0 ? 500 : (ci === highlightIdx ? 600 : 400),
                    whiteSpace: "nowrap",
                  }}>
                    {typeof cell === "number" ? cell.toLocaleString("fr-FR") : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VizCard>
  );
}

/* ─── Grouped bar ─── */
function GroupedBarViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      backgroundColor: DATASET_COLORS[i % DATASET_COLORS.length], borderRadius: 4, maxBarThickness: 32,
    })),
  }), [viz]);

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" as const, labels: { color: W.axisColor } } },
    scales: {
      x: { grid: { display: false }, ticks: AXIS_TICKS },
      y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS },
    },
  }), []);

  return (
    <VizCard viz={viz}>
      <div style={{ height: 300 }}><Bar data={data} options={options} /></div>
    </VizCard>
  );
}

/* ─── Dashboard ─── */
function DashboardViz({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;
    const mainDatasets = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label, data: ds.data,
        borderColor: color, backgroundColor: withAlpha(color, 0.08),
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, fill: true, tension: 0.3,
      };
    });
    const refDatasets = (viz.chart.referenceLines || []).map((ref) => ({
      label: ref.label,
      data: new Array((viz.chart!.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A", backgroundColor: "transparent",
      borderWidth: 1.5, borderDash: [6, 4] as number[], pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0,
    }));
    return { labels: viz.chart.labels || [], datasets: [...mainDatasets, ...refDatasets] };
  }, [viz.chart]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: AXIS_TICKS },
      y: { beginAtZero: true, grid: GRID_OPTS, ticks: AXIS_TICKS },
    },
  }), []);

  return (
    <div className="my-3 overflow-hidden" style={{ background: W.bg, border: W.border, borderRadius: W.radius, padding: "16px" }}>
      {/* Title */}
      {(viz.title || viz.subtitle) && (
        <div className="mb-3">
          {viz.title && <h3 style={{ fontSize: W.titleSize, fontWeight: 500, color: W.titleColor, margin: 0 }}>{viz.title}</h3>}
          {viz.subtitle && <p style={{ fontSize: W.subtitleSize, color: W.subtitleColor, margin: "2px 0 0" }}>{viz.subtitle}</p>}
        </div>
      )}

      <div className="space-y-3">
        {/* Stat cards */}
        {viz.statCards && viz.statCards.length > 0 && (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(viz.statCards.length, 4)}, 1fr)` }}>
            {viz.statCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              return (
                <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                  <p style={{ fontSize: "24px", fontWeight: 600, color: s.text }}>{card.value}</p>
                  <p style={{ fontSize: "11px", marginTop: "2px", color: s.text, opacity: 0.85 }}>{card.unit}</p>
                  <p style={{ fontSize: "11px", marginTop: "4px", color: s.text, opacity: 0.7 }}>{card.label}</p>
                  {card.context && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.5)", color: s.text }}>
                      {card.context}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Chart legend + chart */}
        {chartData && viz.chart && (
          <>
            <div className="flex flex-wrap gap-3">
              {viz.chart.datasets.map((ds, i) => (
                <span key={i} className="flex items-center gap-1.5" style={{ fontSize: "11px", color: W.axisColor }}>
                  <span className="inline-block rounded-sm" style={{ width: 16, height: 3, backgroundColor: ds.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                  {ds.label}
                </span>
              ))}
              {viz.chart.referenceLines?.map((ref, i) => (
                <span key={`ref-${i}`} className="flex items-center gap-1.5" style={{ fontSize: "11px", color: W.axisColor }}>
                  <span className="inline-block" style={{ width: 16, height: 0, borderTop: `2px dashed ${ref.color || "#E24B4A"}` }} />
                  {ref.label}
                </span>
              ))}
            </div>
            <div style={{ height: 260 }}>
              {viz.chart.type === "bar" ? <Bar data={chartData} options={chartOptions} /> : <Line data={chartData} options={chartOptions} />}
            </div>
          </>
        )}

        {/* Analysis cards */}
        {viz.analysisCards && viz.analysisCards.length > 0 && (
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {viz.analysisCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              const icon = STATUS_ICONS[card.status] || "\u2139";
              return (
                <div key={i} className="rounded-lg px-3 py-2.5" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: s.text }}>{icon} {card.title}</p>
                  <p style={{ fontSize: "11px", lineHeight: 1.5, color: s.text, opacity: 0.9 }}>{card.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insight */}
      {viz.insight && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 mt-3" style={{ backgroundColor: W.insightBg, border: `0.5px solid ${W.insightBorder}`, color: W.insightText, fontSize: "12px" }}>
          <span className="flex-shrink-0">💡</span>
          <span>{viz.insight}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "0.5px solid #E8E8E8" }}>
        <button
          onClick={() => exportVizToExcel(viz)}
          className="flex items-center gap-1 rounded px-2 py-1 cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "12px", border: "0.5px solid #E8E8E8" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Excel
        </button>
      </div>
    </div>
  );
}

/* ─── Comparison ─── */
function ComparisonViz({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;
    const datasets = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label, data: ds.data,
        borderColor: color, backgroundColor: withAlpha(color, 0.08),
        borderWidth: 2.5, pointRadius: 4, fill: true, tension: 0.3,
      };
    });
    return { labels: viz.chart.labels || [], datasets };
  }, [viz.chart]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: (viz.chart?.datasets?.length || 0) > 1, position: "top" as const, labels: { color: W.axisColor } } },
    scales: {
      x: { ticks: AXIS_TICKS, grid: { display: false } },
      y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS },
    },
  }), [viz.chart]);

  return (
    <VizCard viz={viz}>
      {viz.items && viz.items.length > 0 && (
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${Math.min(viz.items.length, 4)}, 1fr)` }}>
          {viz.items.map((item, i) => {
            const s = STATUS_STYLES[item.color] || STATUS_STYLES.neutral;
            return (
              <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                <p style={{ fontSize: "18px", fontWeight: 600, color: s.text }}>{item.value}</p>
                {item.unit && <p style={{ fontSize: "11px", color: s.text, opacity: 0.85 }}>{item.unit}</p>}
                <p style={{ fontSize: "11px", marginTop: "4px", color: s.text, opacity: 0.7 }}>{item.label}</p>
              </div>
            );
          })}
        </div>
      )}
      {chartData && (
        <div style={{ height: 220 }}>
          {viz.chart?.type === "bar" ? <Bar data={chartData} options={chartOptions} /> : <Line data={chartData} options={chartOptions} />}
        </div>
      )}
    </VizCard>
  );
}

/* ─── Excel card (compact, opens in artifact panel) ─── */
function ExcelViz({ viz }: { viz: VizChartData }) {
  return <ExcelCard viz={viz} />;
}

/* ─── Main renderer ─── */
export default function VizRenderer({ viz }: { viz: VizChartData }) {
  switch (viz.type) {
    case "stat": return <StatViz viz={viz} />;
    case "bar": return <BarViz viz={viz} />;
    case "line": return <LineViz viz={viz} />;
    case "pie": return <PieViz viz={viz} />;
    case "table": return <TableViz viz={viz} />;
    case "grouped-bar": return <GroupedBarViz viz={viz} />;
    case "dashboard": return <DashboardViz viz={viz} />;
    case "comparison": return <ComparisonViz viz={viz} />;
    case "excel": return <ExcelViz viz={viz} />;
    default: return null;
  }
}
