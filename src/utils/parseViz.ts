export type VizType = "bar" | "line" | "pie" | "stat" | "table" | "grouped-bar" | "dashboard" | "comparison";

export interface VizDataset {
  label: string;
  data: number[];
  unit?: string;
  color?: string;
}

export interface VizReferenceLine {
  value: number;
  label: string;
  color?: string;
}

export interface DashboardStatCard {
  value: string;
  unit: string;
  label: string;
  context?: string;
  status: "danger" | "warning" | "success" | "neutral";
}

export interface DashboardAnalysisCard {
  status: "danger" | "warning" | "success" | "neutral";
  title: string;
  text: string;
}

export interface DashboardChart {
  type: "line" | "bar";
  labels: string[];
  datasets: VizDataset[];
  referenceLines?: VizReferenceLine[];
}

export interface ComparisonItem {
  label: string;
  value: number | string;
  unit: string;
  color: "danger" | "warning" | "success" | "neutral";
}

export interface VizChartData {
  type: VizType;
  title?: string;
  subtitle?: string;
  labels?: string[];
  datasets?: VizDataset[];
  insight?: string;
  multiColor?: boolean;
  referenceLines?: VizReferenceLine[];
  // stat-specific
  value?: string;
  unit?: string;
  label?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "stable";
  // table-specific
  columns?: string[];
  rows?: (string | number)[][];
  highlight?: string;
  // dashboard-specific
  statCards?: DashboardStatCard[];
  chart?: DashboardChart;
  analysisCards?: DashboardAnalysisCard[];
  // comparison-specific
  items?: ComparisonItem[];
}

export interface ParsedMessage {
  text: string;
  vizBlocks: VizChartData[];
}

/**
 * Parse a message to separate text content from <viz> blocks.
 */
export function parseMessageWithViz(content: string): ParsedMessage {
  const vizRegex = /<viz\s+type="([^"]+)">\s*([\s\S]*?)\s*<\/viz>/g;
  const vizBlocks: VizChartData[] = [];

  let text = content;
  let match: RegExpExecArray | null;

  while ((match = vizRegex.exec(content)) !== null) {
    const type = match[1] as VizType;
    const jsonStr = match[2];
    try {
      const data = JSON.parse(jsonStr);
      vizBlocks.push({ ...data, type });
    } catch {
      // Malformed JSON — skip this block
    }
  }

  // Remove viz blocks from text
  text = content.replace(/<viz\s+type="[^"]+">[\s\S]*?<\/viz>/g, "");

  // Strip any remaining MCP XML artifacts
  text = text
    .replace(/<ansd_mcp>[\s\S]*?<\/ansd_mcp>/g, "")
    .replace(/<ansd_\w+>[\s\S]*?<\/ansd_\w+>/g, "")
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/g, "")
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "")
    .replace(/<tool_result>[\s\S]*?<\/tool_result>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, vizBlocks };
}
