"use client";

import { useMemo, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SenegalFlag from "./SenegalFlag";
import VizRenderer from "./VizRenderer";
import { parseMessageWithViz } from "@/utils/parseViz";
import { useTypewriter } from "@/hooks/useTypewriter";

/* ─── Custom markdown components (Claude.ai text sizes) ─── */
const markdownComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="font-bold mt-4 mb-2 pb-1 border-b" style={{ fontSize: "20px", color: "var(--foreground)", borderColor: "var(--border)" }} {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="font-bold mt-3 mb-1.5" style={{ fontSize: "17px", color: "var(--foreground)" }} {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="font-bold mt-2 mb-1" style={{ fontSize: "15px", color: "var(--foreground)" }} {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-2.5" style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--foreground)" }} {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="mb-1" style={{ fontSize: "15px", lineHeight: 1.7 }} {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-3 pl-3 my-2 italic"
      style={{ fontSize: "15px", borderColor: "var(--accent)", color: "var(--muted)", backgroundColor: "var(--surface)", borderRadius: "0 6px 6px 0", padding: "8px 12px 8px 12px" }}
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-2 rounded-lg" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full border-collapse" style={{ fontSize: "13px" }} {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead style={{ backgroundColor: "var(--accent)", color: "#ffffff" }} {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ fontSize: "13px", borderBottom: "1px solid var(--border)" }} {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="px-3 py-1.5" style={{ fontSize: "13px", borderBottom: "1px solid var(--border)" }} {...props} />
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
        <code className={`${className || ""}`} style={{ fontSize: "13px" }} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded font-mono"
        style={{ fontSize: "13px", backgroundColor: "var(--chip-bg)", color: "var(--accent)" }}
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

export interface MCPCall {
  tool: string;
  label: string;
  status: "running" | "done";
  input?: string;
  output?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  mcpCalls?: MCPCall[];
  streamingText?: string;
}

/* ─── MCP Thinking Panel (Claude.ai style) ─── */
const TOOL_ICONS: Record<string, string> = {
  search_datasets: "\uD83D\uDD0D",
  query_dataset_data: "\uD83D\uDCCA",
  get_dataset_info: "\u2139\uFE0F",
  list_themes: "\uD83D\uDCCB",
  list_dataset_dimensions: "\uD83D\uDCD0",
  default: "\u2699\uFE0F",
};

function MCPCallItem({ call }: { call: MCPCall }) {
  const [expanded, setExpanded] = useState(false);
  const icon = TOOL_ICONS[call.tool] || TOOL_ICONS.default;
  const prefix = call.status === "done" ? "A" : icon;

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
      {/* Icon + vertical line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: call.status === "done" ? "12px" : "14px",
            color: "#888",
            fontWeight: 600,
          }}
        >
          {prefix}
        </span>
        <div style={{ width: "1px", flex: 1, background: "#E0DED8", margin: "2px 0", minHeight: "8px" }} />
      </div>
      <div style={{ flex: 1 }}>
        {/* Tool name */}
        <div style={{ color: "#333", marginBottom: "4px", fontWeight: 500, fontSize: "13px" }}>
          {call.label}
        </div>
        {/* Expand/collapse badge */}
        {(call.input || call.output) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer"
            style={{
              background: "#F0EDE6",
              border: "none",
              borderRadius: "6px",
              padding: "3px 10px",
              fontSize: "12px",
              color: "#666",
            }}
          >
            {expanded ? "\u25B2" : "\u25BC"} {call.output ? "Résultat" : "Requête"}
          </button>
        )}
        {/* Expanded content */}
        {expanded && (
          <pre
            style={{
              marginTop: "6px",
              padding: "8px",
              background: "#F8F6F0",
              borderRadius: "6px",
              fontSize: "11px",
              color: "#555",
              overflow: "auto",
              maxHeight: "120px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {call.output || call.input}
          </pre>
        )}
      </div>
    </div>
  );
}

function MCPThinkingPanel({ calls }: { calls: MCPCall[] }) {
  const hasRunning = calls.some((c) => c.status === "running");

  return (
    <div
      style={{
        background: "#FAF9F6",
        border: "0.5px solid #E8E6E0",
        borderRadius: "12px",
        padding: "12px 16px",
        margin: "4px 0",
        fontSize: "13px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      {hasRunning && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span className="mcp-spin" style={{ color: "#E8572A", fontSize: "16px" }}>
            ✳
          </span>
          <span style={{ color: "#666", fontWeight: 500 }}>En cours</span>
        </div>
      )}
      {/* Call list */}
      {calls.map((call, i) => (
        <MCPCallItem key={i} call={call} />
      ))}
    </div>
  );
}

/* ─── Assistant message text part (inside bubble) ─── */
function AssistantMessageText({ content }: { content: string }) {
  const parsed = useMemo(() => parseMessageWithViz(content), [content]);

  if (!parsed.text) return null;

  return (
    <div className="message-content prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {parsed.text}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Typewriter assistant message: text appears progressively, viz after completion ─── */
function TypewriterAssistantMessage({ content }: { content: string }) {
  const parsed = useMemo(() => parseMessageWithViz(content), [content]);
  const { displayed, isDone } = useTypewriter(parsed.text, true, 6);

  return (
    <>
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
          {displayed && (
            <div className="message-content prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {displayed}
              </ReactMarkdown>
              {/* Blinking cursor during typewriter */}
              {!isDone && (
                <span
                  className="typewriter-cursor"
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1em",
                    background: "var(--accent)",
                    marginLeft: "2px",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </div>
          )}
        </div>
        {/* Copy button appears on hover, only after typewriter done */}
        {isDone && (
          <div className="absolute -bottom-2 right-2">
            <CopyMessageButton content={content} />
          </div>
        )}
      </div>
      {/* Viz blocks: only show after typewriter is done */}
      {isDone && parsed.vizBlocks.length > 0 && (
        <div className="mt-2">
          {parsed.vizBlocks.map((viz, i) => (
            <VizRenderer key={i} viz={viz} />
          ))}
        </div>
      )}
    </>
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
export default function ChatMessages({ messages, isLoading, mcpCalls = [], streamingText }: ChatMessagesProps) {
  // Find the last assistant message to apply typewriter effect
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  })();

  // Track which message IDs have already been fully displayed (no typewriter needed)
  const [seenIds] = useState<Set<string>>(() => new Set());

  return (
    <div className="px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((msg, idx) =>
          msg.role === "user" ? (
            /* ── User bubble: right-aligned ── */
            <div key={msg.id} className="flex justify-end gap-2.5">
              <div
                className="leading-relaxed whitespace-pre-wrap px-4 py-2.5"
                style={{
                  fontSize: "15px",
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                  borderRadius: "18px 18px 4px 18px",
                  maxWidth: "70%",
                }}
              >
                {msg.content}
              </div>
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-semibold mt-auto"
                style={{ fontSize: "12px", backgroundColor: "var(--accent)", color: "#ffffff" }}
              >
                U
              </div>
            </div>
          ) : idx === lastAssistantIdx && !seenIds.has(msg.id) ? (
            /* ── Last assistant message: typewriter effect ── */
            <TypewriterAssistantBubble
              key={msg.id}
              msg={msg}
              onComplete={() => seenIds.add(msg.id)}
            />
          ) : (
            /* ── Older assistant messages: render immediately ── */
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

        {/* ── Loading state with MCP panel + streaming text ── */}
        {isLoading && (
          <div className="flex justify-start gap-2.5 items-end">
            <div className="flex-shrink-0">
              <SenegalFlag size={28} />
            </div>
            <div className="min-w-0" style={{ maxWidth: "85%" }}>
              {/* MCP Thinking Panel */}
              {mcpCalls.length > 0 && (
                <MCPThinkingPanel calls={mcpCalls} />
              )}

              {/* Streaming text */}
              {streamingText ? (
                <div
                  className="px-4 py-3 mt-1"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "18px 18px 18px 4px",
                    border: "0.5px solid var(--border)",
                  }}
                >
                  <div className="message-content prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {streamingText}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : mcpCalls.length === 0 ? (
                /* No MCP calls yet and no text — show thinking indicator */
                <div
                  className="px-4 py-3"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "18px 18px 18px 4px",
                    border: "0.5px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2" style={{ fontSize: "13px", color: "var(--muted)" }}>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Réflexion en cours...</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Typewriter wrapper with flag avatar ─── */
function TypewriterAssistantBubble({ msg, onComplete }: { msg: Message; onComplete: () => void }) {
  const parsed = useMemo(() => parseMessageWithViz(msg.content), [msg.content]);
  const { displayed, isDone } = useTypewriter(parsed.text, true, 6);

  // Mark as seen when typewriter completes
  if (isDone) {
    onComplete();
  }

  return (
    <div className="group flex justify-start gap-2.5 items-end">
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
            {displayed && (
              <div className="message-content prose prose-sm max-w-none" style={{ color: "var(--foreground)" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {displayed}
                </ReactMarkdown>
                {/* Blinking cursor during typewriter */}
                {!isDone && (
                  <span
                    className="typewriter-cursor"
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "1em",
                      background: "var(--accent)",
                      marginLeft: "2px",
                      verticalAlign: "text-bottom",
                    }}
                  />
                )}
              </div>
            )}
            {!displayed && !isDone && (
              <div className="flex items-center gap-2" style={{ fontSize: "13px", color: "var(--muted)" }}>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            )}
          </div>
          {/* Copy button appears on hover, only after typewriter done */}
          {isDone && (
            <div className="absolute -bottom-2 right-2">
              <CopyMessageButton content={msg.content} />
            </div>
          )}
        </div>
        {/* Viz blocks: only show after typewriter is done */}
        {isDone && parsed.vizBlocks.length > 0 && (
          <div className="mt-2">
            {parsed.vizBlocks.map((viz, i) => (
              <VizRenderer key={i} viz={viz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
