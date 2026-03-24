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
  const showExport = ["bar", "line", "grouped-bar", "table"].includes(viz.type);

  const handleCopy = async () => {
    const text = copyVizData(viz);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg my-3 overflow-hidden"
      style={{ border: "0.5px solid #E5E5E5" }}
    >
      {/* Header */}
      {(viz.title || viz.subtitle) && (
        <div className="px-4 pt-4 pb-1">
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
      </div>
    </div>
  );
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
  const data = useMemo(
    () => ({
      labels: viz.labels || [],
      datasets: (viz.datasets || []).map((ds, i) => {
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
      }),
    }),
    [viz]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: (viz.datasets?.length || 0) > 1,
          position: "top" as const,
        },
      },
      scales: {
        y: { beginAtZero: true },
      },
    }),
    [viz]
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
    default:
      return null;
  }
}
