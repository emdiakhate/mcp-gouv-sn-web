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
import { DATASET_COLORS, REGION_COLORS, VIZ_COLORS, withAlpha } from "@/constants/colors";
import { exportVizToExcel, copyVizData } from "@/utils/exportExcel";
import FullscreenModal from "./FullscreenModal";

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

/* ─── Shared wrapper ─── */
function VizCard({
  children,
  viz,
}: {
  children: React.ReactNode;
  viz: VizChartData;
}) {
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const showExport = ["bar", "line", "grouped-bar", "table"].includes(viz.type);
  const showExpand = ["bar", "line", "pie", "grouped-bar", "table"].includes(viz.type);

  const handleCopy = async () => {
    const text = copyVizData(viz);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className="rounded-lg my-3 overflow-hidden"
        style={{ border: "0.5px solid #E5E5E5" }}
      >
        {/* Header */}
        {(viz.title || viz.subtitle) && (
          <div className="px-4 pt-4 pb-1 flex items-start justify-between">
            <div>
              {viz.title && (
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {viz.title}
                </h3>
              )}
              {viz.subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {viz.subtitle}
                </p>
              )}
            </div>
            {showExpand && (
              <button
                onClick={() => setFullscreen(true)}
                className="p-1.5 rounded-lg cursor-pointer hover:opacity-80 flex-shrink-0"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                title="Agrandir"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Chart / content */}
        <div className="px-4 py-3">{children}</div>

        {/* Insight */}
        {viz.insight && (
          <div
            className="mx-4 mb-3 flex items-start gap-2 rounded-md px-3 py-2 text-xs"
            style={{ backgroundColor: VIZ_COLORS.statBg, color: "#0f5132" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{viz.insight}</span>
          </div>
        )}

        {/* Action buttons */}
        <div
          className="flex items-center gap-2 px-4 py-2 border-t"
          style={{ borderColor: "#E5E5E5" }}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80"
            style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
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
              className="flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Télécharger Excel
            </button>
          )}
          {showExpand && (
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 ml-auto"
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
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

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenModal onClose={() => setFullscreen(false)} title={viz.title}>
          <VizRendererFullscreen viz={viz} />
        </FullscreenModal>
      )}
    </>
  );
}

/* ─── Fullscreen viz renderer (larger heights) ─── */
function VizRendererFullscreen({ viz }: { viz: VizChartData }) {
  switch (viz.type) {
    case "bar":
      return <BarVizFS viz={viz} />;
    case "line":
      return <LineVizFS viz={viz} />;
    case "pie":
      return <PieVizFS viz={viz} />;
    case "grouped-bar":
      return <GroupedBarVizFS viz={viz} />;
    case "table":
      return <TableViz viz={viz} />;
    default:
      return null;
  }
}

/* Fullscreen-sized chart wrappers that reuse the same data logic but with larger height */
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
    scales: { x: { beginAtZero: true }, y: { beginAtZero: true } },
  }), [viz, isHorizontal]);
  const h = isHorizontal ? Math.max(400, (viz.labels?.length || 0) * 45) : 500;
  return <div style={{ height: h }}><Bar data={data} options={options} /></div>;
}

function LineVizFS({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const main = (viz.datasets || []).map((ds, i) => ({
      label: ds.label, data: ds.data,
      borderColor: DATASET_COLORS[i % DATASET_COLORS.length],
      backgroundColor: withAlpha(DATASET_COLORS[i % DATASET_COLORS.length], 0.1),
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
    plugins: { legend: { display: true, position: "top" as const } },
    scales: { y: { beginAtZero: true } },
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
    plugins: { legend: { position: "right" as const, labels: { boxWidth: 14, padding: 16, font: { size: 13 } } } },
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
    plugins: { legend: { display: true, position: "top" as const } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
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
        className="flex flex-col items-center py-4 rounded-xl"
        style={{ backgroundColor: VIZ_COLORS.statBg }}
      >
        <span
          className="text-4xl font-bold"
          style={{ color: VIZ_COLORS.primary }}
        >
          {viz.value}
        </span>
        {viz.unit && (
          <span className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {viz.unit}
          </span>
        )}
        {viz.label && (
          <span
            className="text-xs mt-2 font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {viz.label}
          </span>
        )}
        {viz.trend && (
          <span
            className="text-xs mt-2 px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: isUp
                ? "#dcfce7"
                : isDown
                ? "#fee2e2"
                : "#f3f4f6",
              color: isUp
                ? "#166534"
                : isDown
                ? "#991b1b"
                : "#374151",
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

  const data = useMemo(
    () => ({
      labels: viz.labels || [],
      datasets: (viz.datasets || []).map((ds, i) => {
        const useMulti = viz.multiColor && (viz.datasets?.length || 0) <= 1;
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor: useMulti
            ? (viz.labels || []).map((_, li) => REGION_COLORS[li % REGION_COLORS.length])
            : DATASET_COLORS[i % DATASET_COLORS.length],
          borderRadius: 4,
          maxBarThickness: 40,
        };
      }),
    }),
    [viz]
  );

  const options = useMemo(
    () => ({
      indexAxis: (isHorizontal ? "y" : "x") as "x" | "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: (viz.datasets?.length || 0) > 1,
          position: "top" as const,
        },
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
        x: { beginAtZero: true, grid: { display: !isHorizontal } },
        y: { beginAtZero: true, grid: { display: isHorizontal } },
      },
    }),
    [viz, isHorizontal]
  );

  const height = isHorizontal
    ? Math.max(200, (viz.labels?.length || 0) * 35)
    : 280;

  return (
    <VizCard viz={viz}>
      <div style={{ height }}>
        <Bar data={data} options={options} />
      </div>
    </VizCard>
  );
}

/* ─── Line chart ─── */
function LineViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const mainDatasets = (viz.datasets || []).map((ds, i) => {
      const color = DATASET_COLORS[i % DATASET_COLORS.length];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.1),
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    // Add reference lines (e.g. ODD targets) as dashed horizontal datasets
    const refDatasets = (viz.referenceLines || []).map((ref) => ({
      label: ref.label,
      data: new Array((viz.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
    }));

    return {
      labels: viz.labels || [],
      datasets: [...mainDatasets, ...refDatasets],
    };
  }, [viz]);

  const hasRefLines = (viz.referenceLines?.length || 0) > 0;

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: (viz.datasets?.length || 0) > 1 || hasRefLines,
          position: "top" as const,
        },
      },
      scales: {
        y: { beginAtZero: true },
      },
    }),
    [viz, hasRefLines]
  );

  return (
    <VizCard viz={viz}>
      <div style={{ height: 280 }}>
        <Line data={data} options={options} />
      </div>
    </VizCard>
  );
}

/* ─── Pie / Donut chart ─── */
function PieViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(() => {
    const ds = viz.datasets?.[0];
    return {
      labels: viz.labels || [],
      datasets: [
        {
          data: ds?.data || [],
          backgroundColor: (viz.labels || []).map(
            (_, i) => REGION_COLORS[i % REGION_COLORS.length]
          ),
          borderWidth: 1,
          borderColor: "#fff",
        },
      ],
    };
  }, [viz]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: {
          position: "right" as const,
          labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
        },
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
    }),
    [viz]
  );

  return (
    <VizCard viz={viz}>
      <div style={{ height: 260 }}>
        <Pie data={data} options={options} />
      </div>
    </VizCard>
  );
}

/* ─── Table ─── */
function TableViz({ viz }: { viz: VizChartData }) {
  const highlightIdx = viz.columns?.indexOf(viz.highlight || "");

  return (
    <VizCard viz={viz}>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {viz.columns?.map((col, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderBottom: "1px solid var(--border)",
                    fontWeight: i === highlightIdx ? 700 : 600,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viz.rows?.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  backgroundColor:
                    ri % 2 === 0 ? "transparent" : "var(--surface)",
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 whitespace-nowrap"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      fontWeight: ci === highlightIdx ? 600 : 400,
                    }}
                  >
                    {typeof cell === "number"
                      ? cell.toLocaleString("fr-FR")
                      : cell}
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

/* ─── Grouped bar chart (reuses BarViz logic with forced vertical multi-dataset) ─── */
function GroupedBarViz({ viz }: { viz: VizChartData }) {
  const data = useMemo(
    () => ({
      labels: viz.labels || [],
      datasets: (viz.datasets || []).map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: DATASET_COLORS[i % DATASET_COLORS.length],
        borderRadius: 4,
        maxBarThickness: 32,
      })),
    }),
    [viz]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" as const },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true },
      },
    }),
    []
  );

  return (
    <VizCard viz={viz}>
      <div style={{ height: 300 }}>
        <Bar data={data} options={options} />
      </div>
    </VizCard>
  );
}

/* ─── Status color map for dashboard/comparison ─── */
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  danger:  { bg: "#FCEBEB", border: "#F09595", text: "#A32D2D" },
  warning: { bg: "#FAEEDA", border: "#EF9F27", text: "#854F0B" },
  success: { bg: "#E1F5EE", border: "#5DCAA5", text: "#0F6E56" },
  neutral: { bg: "#F1EFE8", border: "#B4B2A9", text: "#444441" },
};

const STATUS_ICONS: Record<string, string> = {
  danger: "✗",
  warning: "⚠",
  success: "✓",
  neutral: "ℹ",
};

const CHART_COLORS = [
  "#1D9E75", "#378ADD", "#7F77DD", "#D85A30",
  "#BA7517", "#D4537E", "#639922", "#E24B4A",
];

/* ─── Dashboard: stat cards + chart + analysis cards + insight ─── */
function DashboardViz({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;

    const mainDatasets = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.08),
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      };
    });

    const refDatasets = (viz.chart.referenceLines || []).map((ref) => ({
      label: ref.label,
      data: new Array((viz.chart!.labels || []).length).fill(ref.value),
      borderColor: ref.color || "#E24B4A",
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderDash: [6, 4] as number[],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
    }));

    return {
      labels: viz.chart.labels || [],
      datasets: [...mainDatasets, ...refDatasets],
    };
  }, [viz.chart]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.06)" } },
      },
    }),
    []
  );

  return (
    <div
      className="rounded-lg my-3 overflow-hidden"
      style={{ border: "0.5px solid #E5E5E5" }}
    >
      {/* Title */}
      {(viz.title || viz.subtitle) && (
        <div className="px-4 pt-4 pb-1">
          {viz.title && (
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {viz.title}
            </h3>
          )}
          {viz.subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {viz.subtitle}
            </p>
          )}
        </div>
      )}

      <div className="px-4 py-3 space-y-3">
        {/* Stat cards grid */}
        {viz.statCards && viz.statCards.length > 0 && (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(viz.statCards.length, 4)}, 1fr)`,
            }}
          >
            {viz.statCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              return (
                <div
                  key={i}
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}
                >
                  <p className="text-xl font-bold" style={{ color: s.text }}>
                    {card.value}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: s.text, opacity: 0.9 }}>
                    {card.unit}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: s.text, opacity: 0.7 }}>
                    {card.label}
                  </p>
                  {card.context && (
                    <span
                      className="inline-block text-[10px] mt-1 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.5)", color: s.text }}
                    >
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
                <span key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
                  <span
                    className="inline-block rounded-sm"
                    style={{
                      width: 16,
                      height: 3,
                      backgroundColor: ds.color || CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  {ds.label}
                </span>
              ))}
              {viz.chart.referenceLines?.map((ref, i) => (
                <span key={`ref-${i}`} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
                  <span
                    className="inline-block"
                    style={{
                      width: 16,
                      height: 0,
                      borderTop: `2px dashed ${ref.color || "#E24B4A"}`,
                    }}
                  />
                  {ref.label}
                </span>
              ))}
            </div>
            <div style={{ height: 260 }}>
              {viz.chart.type === "bar" ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </>
        )}

        {/* Analysis cards */}
        {viz.analysisCards && viz.analysisCards.length > 0 && (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
          >
            {viz.analysisCards.map((card, i) => {
              const s = STATUS_STYLES[card.status] || STATUS_STYLES.neutral;
              const icon = STATUS_ICONS[card.status] || "ℹ";
              return (
                <div
                  key={i}
                  className="rounded-lg px-3 py-2.5"
                  style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: s.text }}>
                    {icon} {card.title}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: s.text, opacity: 0.9 }}>
                    {card.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insight */}
      {viz.insight && (
        <div
          className="mx-4 mb-3 flex items-start gap-2 rounded-md px-3 py-2 text-xs"
          style={{ backgroundColor: "#FAEEDA", border: "0.5px solid #EF9F27", color: "#633806" }}
        >
          <span className="flex-shrink-0">💡</span>
          <span>{viz.insight}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: "#E5E5E5" }}>
        <button
          onClick={() => exportVizToExcel(viz)}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger Excel
        </button>
      </div>
    </div>
  );
}

/* ─── Comparison: items grid + optional chart ─── */
function ComparisonViz({ viz }: { viz: VizChartData }) {
  const chartData = useMemo(() => {
    if (!viz.chart) return null;
    const datasets = (viz.chart.datasets || []).map((ds, i) => {
      const color = ds.color || CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.1),
        borderWidth: 2.5,
        pointRadius: 4,
        fill: true,
        tension: 0.3,
      };
    });
    return { labels: viz.chart.labels || [], datasets };
  }, [viz.chart]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: (viz.chart?.datasets?.length || 0) > 1, position: "top" as const } },
      scales: { y: { beginAtZero: true } },
    }),
    [viz.chart]
  );

  return (
    <VizCard viz={viz}>
      {/* Comparison items */}
      {viz.items && viz.items.length > 0 && (
        <div
          className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(viz.items.length, 4)}, 1fr)` }}
        >
          {viz.items.map((item, i) => {
            const s = STATUS_STYLES[item.color] || STATUS_STYLES.neutral;
            return (
              <div
                key={i}
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: s.bg, border: `0.5px solid ${s.border}` }}
              >
                <p className="text-lg font-bold" style={{ color: s.text }}>
                  {item.value}
                </p>
                {item.unit && (
                  <p className="text-[11px]" style={{ color: s.text, opacity: 0.8 }}>
                    {item.unit}
                  </p>
                )}
                <p className="text-[10px] mt-1" style={{ color: s.text, opacity: 0.7 }}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional chart */}
      {chartData && (
        <div style={{ height: 220 }}>
          {viz.chart?.type === "bar" ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      )}
    </VizCard>
  );
}

/* ─── Main renderer ─── */
export default function VizRenderer({ viz }: { viz: VizChartData }) {
  switch (viz.type) {
    case "stat":
      return <StatViz viz={viz} />;
    case "bar":
      return <BarViz viz={viz} />;
    case "line":
      return <LineViz viz={viz} />;
    case "pie":
      return <PieViz viz={viz} />;
    case "table":
      return <TableViz viz={viz} />;
    case "grouped-bar":
      return <GroupedBarViz viz={viz} />;
    case "dashboard":
      return <DashboardViz viz={viz} />;
    case "comparison":
      return <ComparisonViz viz={viz} />;
    default:
      return null;
  }
}
