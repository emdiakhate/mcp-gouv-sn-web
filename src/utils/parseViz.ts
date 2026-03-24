export type VizType = "bar" | "line" | "pie" | "stat" | "table" | "grouped-bar";

export interface VizDataset {
  label: string;
  data: number[];
  unit?: string;
}

export interface VizChartData {
  type: VizType;
  title?: string;
  subtitle?: string;
  labels?: string[];
  datasets?: VizDataset[];
  insight?: string;
  multiColor?: boolean;
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
  text = content.replace(/<viz\s+type="[^"]+">[\s\S]*?<\/viz>/g, "").trim();

  return { text, vizBlocks };
}
