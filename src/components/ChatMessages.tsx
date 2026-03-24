"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SenegalFlag from "./SenegalFlag";
import VizRenderer from "./VizRenderer";
import { parseMessageWithViz } from "@/utils/parseViz";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ToolCall {
  name: string;
  args?: string;
  done: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  toolStatus?: string | null;
  toolHistory?: ToolCall[];
}

/* ─── Tool icons ─── */
function ToolIcon({ name }: { name: string }) {
  if (name.includes("Recherche") || name.includes("search")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  if (name.includes("Interrogation") || name.includes("données") || name.includes("query")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  if (name.includes("Récupération") || name.includes("info") || name.includes("dimensions")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  if (name.includes("Exploration") || name.includes("Chargement") || name.includes("list")) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/* ─── Collapsible tool calls section ─── */
function ToolCallsDetails({ tools }: { tools: ToolCall[] }) {
  const [open, setOpen] = useState(false);
  if (tools.length === 0) return null;

  return (
    <div className="mt-2 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80"
        style={{ color: "var(--muted)" }}
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>Appels MCP ({tools.length})</span>
      </button>
      {open && (
        <div className="mt-1.5 space-y-1 pl-4 border-l-2" style={{ borderColor: "var(--border)" }}>
          {tools.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
              <span style={{ color: t.done ? "var(--accent)" : "var(--warning, #BA7517)" }}>
                {t.done ? "✓" : "⟳"}
              </span>
              <span className="font-medium">{t.name}</span>
              {t.args && <span className="opacity-60 truncate max-w-[200px]">({t.args})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Active tool indicator ─── */
function ActiveToolCard({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <span style={{ color: "var(--accent)" }}>
        <ToolIcon name={name} />
      </span>
      <span className="font-medium" style={{ color: "var(--foreground)" }}>{name}</span>
      <svg className="ml-auto animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}

function CompletedToolCard({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <span style={{ color: "var(--accent)" }}>
        <ToolIcon name={name} />
      </span>
      <span className="font-medium" style={{ color: "var(--foreground)" }}>{name}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

/* ─── Assistant message text part (inside bubble) ─── */
function AssistantMessageText({ content }: { content: string }) {
  const parsed = useMemo(() => parseMessageWithViz(content), [content]);

  if (!parsed.text) return null;

  return (
    <div
      className="message-content text-sm leading-relaxed prose prose-sm max-w-none"
      style={{ color: "var(--foreground)" }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {parsed.text}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Assistant message viz blocks (outside bubble for full width) ─── */
function AssistantMessageViz({ content }: { content: string }) {
  const parsed = useMemo(() => parseMessageWithViz(content), [content]);

  if (parsed.vizBlocks.length === 0) return null;

  return (
    <div className="mt-2">
      {parsed.vizBlocks.map((viz, i) => (
        <VizRenderer key={i} viz={viz} />
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export default function ChatMessages({ messages, isLoading, toolStatus, toolHistory = [] }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg) =>
          msg.role === "user" ? (
            /* ── User bubble: right-aligned ── */
            <div key={msg.id} className="flex justify-end gap-2.5">
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap px-4 py-2.5"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                  borderRadius: "18px 18px 4px 18px",
                  maxWidth: "70%",
                }}
              >
                {msg.content}
              </div>
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-auto"
                style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
              >
                U
              </div>
            </div>
          ) : (
            /* ── Assistant bubble: left-aligned ── */
            <div key={msg.id} className="flex justify-start gap-2.5 items-end">
              <div className="flex-shrink-0">
                <SenegalFlag size={28} />
              </div>
              <div className="min-w-0" style={{ maxWidth: "85%" }}>
                {/* Text bubble */}
                <div
                  className="px-4 py-3"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "18px 18px 18px 4px",
                    border: "0.5px solid var(--border)",
                  }}
                >
                  <AssistantMessageText content={msg.content} />
                </div>
                {/* Viz blocks rendered outside the text bubble for full width */}
                <AssistantMessageViz content={msg.content} />
              </div>
            </div>
          )
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="flex justify-start gap-2.5 items-end">
            <div className="flex-shrink-0">
              <SenegalFlag size={28} />
            </div>
            <div
              className="px-4 py-3 space-y-2 min-w-0"
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "18px 18px 18px 4px",
                border: "0.5px solid var(--border)",
              }}
            >
              {/* Completed tools */}
              {toolHistory.filter(t => t.done).map((tool, i) => (
                <CompletedToolCard key={i} name={tool.name} />
              ))}
              {/* Active tool or thinking */}
              {toolStatus ? (
                <ActiveToolCard name={toolStatus} />
              ) : (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Réflexion en cours...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
