"use client";

import { useMemo } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const GRID_COLOR = "rgba(0,0,0,0.06)";
const AXIS_TICKS = { color: "#888", font: { size: 12 } };
const GRID_OPTS = { color: GRID_COLOR };
const CHART_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#D85A30", "#BA7517", "#D4537E", "#639922", "#E24B4A"];

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  danger:  { bg: "#FCEBEB", border: "#F09595", text: "#A32D2D" },
  warning: { bg: "#FAEEDA", border: "#EF9F27", text: "#854F0B" },
  success: { bg: "#E1F5EE", border: "#5DCAA5", text: "#0F6E56" },
  neutral: { bg: "#F1EFE8", border: "#B4B2A9", text: "#444441" },
};

const STATUS_ICONS: Record<string, string> = {
  danger: "\u2717", warning: "\u26A0", success: "\u2713", neutral: "\u2139",
};

/**
 * Full-size chart artifact for the split panel.
 * Renders any viz type at full height for detailed viewing.
 */
export default function ChartArtifact({ viz }: { viz: VizChartData }) {
  switch (viz.type) {
    case "stat": return <StatFull viz={viz} />;
    case "bar": return <BarFull viz={viz} />;
    case "line": return <LineFull viz={viz} />;
    case "pie": return <PieFull viz={viz} />;
    case "table": return <TableFull viz={viz} />;
    case "grouped-bar": return <GroupedBarFull viz={viz} />;
    case "dashboard": return <DashboardFull viz={viz} />;
    case "comparison": return <ComparisonFull viz={viz} />;
    default: return null;
  }
}

/* ─── Wrapper ─── */
function ArtifactWrapper({ viz, children }: { viz: VizChartData; children: React.ReactNode }) {
  return (
    <div className="p-4">
      {(viz.title || viz.subtitle) && (
        <div className="mb-4">
          {viz.title && <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>{viz.title}</h2>}
          {viz.subtitle && <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>{viz.subtitle}</p>}
        </div>
      )}
      {children}
      {viz.insight && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 mt-4" style={{ backgroundColor: "#FAEEDA", border: "0.5px solid #EF9F27", color: "#633806", fontSize: "13px" }}>
          <span className="flex-shrink-0">💡</span>
          <span>{viz.insight}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Stat ─── */
function StatFull({ viz }: { viz: VizChartData }) {
  const isUp = viz.trendDirection === "up";
  const isDown = viz.trendDirection === "down";
  return (
    <ArtifactWrapper viz={viz}>
      <div className="flex flex-col items-center py-10 rounded-xl" style={{ backgroundColor: "#E1F5EE" }}>
        <span style={{ fontSize: "48px", fontWeight: 700, color: "#0F6E56" }}>{viz.value}</span>
        {viz.unit && <span style={{ fontSize: "16px", marginTop: "8px", color: "#666" }}>{viz.unit}</span>}
        {viz.label && <span style={{ fontSize: "14px", marginTop: "12px", fontWeight: 500, color: "#1a1a1a" }}>{viz.label}</span>}
        {viz.trend && (
          <span className="mt-3 px-3 py-1 rounded-full" style={{
            fontSize: "13px", fontWeight: 500,
            backgroundColor: isUp ? "#E1F5EE" : isDown ? "#FCEBEB" : "#F1EFE8",
            color: isUp ? "#0F6E56" : isDown ? "#A32D2D" : "#444",
            border: `0.5px solid ${isUp ? "#5DCAA5" : isDown ? "#F09595" : "#B4B2A9"}`,
          }}>
            {viz.trend}
          </span>
        )}
      </div>
    </ArtifactWrapper>
  );
}

/* ─── Bar ─── */
function BarFull({ viz }: { viz: VizChartData }) {
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
    plugins: {
      legend: { display: (viz.datasets?.length || 0) > 1, labels: { color: "#888" } },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            const unit = viz.datasets?.[ctx.datasetIndex ?? 0]?.unit || "";
            const val = isHorizontal ? ctx.parsed.x : ctx.parsed.y;
            return `${ctx.dataset.label}: ${(val ?? 0).toLocaleString("fr-FR")} ${unit}`;
          },
        },
      },
    },
    scales: { x: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), [viz, isHorizontal]);
  const h = isHorizontal ? Math.max(450, (viz.labels?.length || 0) * 45) : 500;
  return (
    <ArtifactWrapper viz={viz}>
      <div style={{ height: h }}><Bar data={data} options={options} /></div>
    </ArtifactWrapper>
  );
}

/* ─── Line ─── */
function LineFull({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const main = (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      borderColor: ds.color || DATASET_COLORS[i % DATASET_COLORS.length],
      backgroundColor: withAlpha(ds.color || DATASET_COLORS[i % DATASET_COLORS.length], 0.08),
      fill: true, tension: 0.3, pointRadius: 5, pointHoverRadius: 8,
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
    plugins: { legend: { display: true, position: "top" as const, labels: { color: "#888" } } },
    scales: { x: { ticks: AXIS_TICKS, grid: { display: false } }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), []);
  return (
    <ArtifactWrapper viz={viz}>
      <div style={{ height: 500 }}><Line data={data} options={options} /></div>
    </ArtifactWrapper>
  );
}

/* ─── Pie ─── */
function PieFull({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: [{ data: viz.datasets?.[0]?.data || [], backgroundColor: (viz.labels || []).map((_, i) => REGION_COLORS[i % REGION_COLORS.length]), borderWidth: 1, borderColor: "#fff" }],
  }), [viz]);
  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false, cutout: "55%",
    plugins: { legend: { position: "right" as const, labels: { boxWidth: 14, padding: 16, font: { size: 13 }, color: "#888" } } },
  }), []);
  return (
    <ArtifactWrapper viz={viz}>
      <div style={{ height: 500 }}><Pie data={data} options={options} /></div>
    </ArtifactWrapper>
  );
}

/* ─── Table ─── */
function TableFull({ viz }: { viz: VizChartData }) {
  const highlightIdx = viz.columns?.indexOf(viz.highlight || "");
  return (
    <ArtifactWrapper viz={viz}>
      <div className="overflow-x-auto" style={{ borderRadius: "8px", border: "0.5px solid #E8E8E8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr>
              {viz.columns?.map((col, i) => (
                <th key={i} style={{
                  backgroundColor: "#0F6E56", color: "#fff",
                  padding: "10px 14px", textAlign: "left", fontWeight: i === highlightIdx ? 700 : 500, whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viz.rows?.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? "#fff" : "#F8FFFE" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "9px 14px", borderBottom: "0.5px solid #eee",
                    color: typeof cell === "number" ? "#0F6E56" : "#333",
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
    </ArtifactWrapper>
  );
}

/* ─── Grouped bar ─── */
function GroupedBarFull({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => ({
    labels: viz.labels || [],
    datasets: (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      backgroundColor: DATASET_COLORS[i % DATASET_COLORS.length], borderRadius: 4, maxBarThickness: 50,
    })),
  }), [viz]);
  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" as const, labels: { color: "#888" } } },
    scales: { x: { grid: { display: false }, ticks: AXIS_TICKS }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), []);
  return (
    <ArtifactWrapper viz={viz}>
      <div style={{ height: 500 }}><Bar data={data} options={options} /></div>
    </ArtifactWrapper>
  );
}

/* ─── Dashboard ─── */
function DashboardFull({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;
    const main = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label, data: ds.data,
        borderColor: color, backgroundColor: withAlpha(color, 0.08),
        borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 8, fill: true, tension: 0.3,
      };
    });
    const refs = (viz.chart.referenceLines || []).map((ref) => ({
      label: ref.label, data: new Array((viz.chart!.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A", backgroundColor: "transparent",
      borderWidth: 1.5, borderDash: [6, 4] as number[], pointRadius: 0, pointHoverRadius: 0, fill: false, tension: 0,
    }));
    return { labels: viz.chart.labels || [], datasets: [...main, ...refs] };
  }, [viz.chart]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false }, ticks: AXIS_TICKS }, y: { beginAtZero: true, grid: GRID_OPTS, ticks: AXIS_TICKS } },
  }), []);

  return (
    <ArtifactWrapper viz={viz}>
      <div className="space-y-4">
        {viz.statCards && viz.statCards.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(viz.statCards.length, 4)}, 1fr)` }}>
            {viz.statCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              return (
                <div key={i} className="rounded-xl p-4 text-center" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: s.text }}>{card.value}</p>
                  <p style={{ fontSize: "13px", marginTop: "4px", color: s.text, opacity: 0.85 }}>{card.unit}</p>
                  <p style={{ fontSize: "12px", marginTop: "6px", color: s.text, opacity: 0.7 }}>{card.label}</p>
                  {card.context && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full" style={{ fontSize: "11px", backgroundColor: "rgba(255,255,255,0.5)", color: s.text }}>
                      {card.context}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {chartData && viz.chart && (
          <>
            <div className="flex flex-wrap gap-3">
              {viz.chart.datasets.map((ds, i) => (
                <span key={i} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: "#888" }}>
                  <span className="inline-block rounded-sm" style={{ width: 16, height: 3, backgroundColor: ds.color || CHART_COLORS[i % CHART_COLORS.length] }} />
                  {ds.label}
                </span>
              ))}
              {viz.chart.referenceLines?.map((ref, i) => (
                <span key={`ref-${i}`} className="flex items-center gap-1.5" style={{ fontSize: "12px", color: "#888" }}>
                  <span className="inline-block" style={{ width: 16, height: 0, borderTop: `2px dashed ${ref.color || "#E24B4A"}` }} />
                  {ref.label}
                </span>
              ))}
            </div>
            <div style={{ height: 400 }}>
              {viz.chart.type === "bar" ? <Bar data={chartData} options={chartOptions} /> : <Line data={chartData} options={chartOptions} />}
            </div>
          </>
        )}

        {viz.analysisCards && viz.analysisCards.length > 0 && (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {viz.analysisCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              const icon = STATUS_ICONS[card.status] || "\u2139";
              return (
                <div key={i} className="rounded-lg px-4 py-3" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px", color: s.text }}>{icon} {card.title}</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: s.text, opacity: 0.9 }}>{card.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ArtifactWrapper>
  );
}

/* ─── Comparison ─── */
function ComparisonFull({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;
    const datasets = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label, data: ds.data,
        borderColor: color, backgroundColor: withAlpha(color, 0.08),
        borderWidth: 2.5, pointRadius: 5, fill: true, tension: 0.3,
      };
    });
    return { labels: viz.chart.labels || [], datasets };
  }, [viz.chart]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: (viz.chart?.datasets?.length || 0) > 1, position: "top" as const, labels: { color: "#888" } } },
    scales: { x: { ticks: AXIS_TICKS, grid: { display: false } }, y: { beginAtZero: true, ticks: AXIS_TICKS, grid: GRID_OPTS } },
  }), [viz.chart]);

  return (
    <ArtifactWrapper viz={viz}>
      {viz.items && viz.items.length > 0 && (
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${Math.min(viz.items.length, 4)}, 1fr)` }}>
          {viz.items.map((item, i) => {
            const s = STATUS_STYLES[item.color] || STATUS_STYLES.neutral;
            return (
              <div key={i} className="rounded-xl p-4 text-center" style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}>
                <p style={{ fontSize: "22px", fontWeight: 700, color: s.text }}>{item.value}</p>
                {item.unit && <p style={{ fontSize: "13px", color: s.text, opacity: 0.85 }}>{item.unit}</p>}
                <p style={{ fontSize: "12px", marginTop: "6px", color: s.text, opacity: 0.7 }}>{item.label}</p>
              </div>
            );
          })}
        </div>
      )}
      {chartData && (
        <div style={{ height: 400 }}>
          {viz.chart?.type === "bar" ? <Bar data={chartData} options={chartOptions} /> : <Line data={chartData} options={chartOptions} />}
        </div>
      )}
    </ArtifactWrapper>
  );
}
