"use client";

import { useMemo, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SenegalFlag from "./SenegalFlag";
import VizRenderer from "./VizRenderer";
import { parseMessageWithViz } from "@/utils/parseViz";

/* ─── Custom markdown components ─── */
const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-lg font-bold mt-4 mb-2 pb-1 border-b" style={{ color: "var(--foreground)", borderColor: "var(--border)" }} {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-base font-bold mt-3 mb-1.5" style={{ color: "var(--foreground)" }} {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-sm font-bold mt-2 mb-1" style={{ color: "var(--foreground)" }} {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-3 pl-3 my-2 text-sm italic"
      style={{ borderColor: "var(--accent)", color: "var(--muted)", backgroundColor: "var(--surface)", borderRadius: "0 6px 6px 0", padding: "8px 12px 8px 12px" }}
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-2 rounded-lg" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-xs border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead style={{ backgroundColor: "var(--accent)", color: "#ffffff" }} {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3 py-2 text-left font-semibold text-xs whitespace-nowrap" style={{ borderBottom: "1px solid var(--border)" }} {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="px-3 py-1.5 text-xs" style={{ borderBottom: "1px solid var(--border)" }} {...props} />
  ),
  tr: ({ ...props }: ComponentPropsWithoutRef<"tr">) => (
    <tr className="even:bg-[var(--surface)]" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="underline font-medium" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" style={{ color: "var(--foreground)" }} {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc ml-5 mb-2 space-y-0.5" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal ml-5 mb-2 space-y-0.5" {...props} />
  ),
  code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code"> & { className?: string }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className || ""} text-xs`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{ backgroundColor: "var(--chip-bg)", color: "var(--accent)" }}
        {...props}
      >
        {children}
      </code>
    );
  },
};

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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {parsed.text}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Copy button for assistant messages ─── */
function CopyMessageButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const textOnly = useMemo(() => {
    const parsed = parseMessageWithViz(content);
    return parsed.text;
  }, [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded cursor-pointer"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      title="Copier le message"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
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
    <div className="px-4 py-6">
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
            <div key={msg.id} className="group flex justify-start gap-2.5 items-end">
              <div className="flex-shrink-0">
                <SenegalFlag size={28} />
              </div>
              <div className="min-w-0" style={{ maxWidth: "85%" }}>
                {/* Text bubble */}
                <div className="relative">
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
                  {/* Copy button appears on hover */}
                  <div className="absolute -bottom-2 right-2">
                    <CopyMessageButton content={msg.content} />
                  </div>
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
