"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SenegalFlag from "./SenegalFlag";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  toolStatus?: string | null;
  toolHistory?: string[];
}

/** Icon for each tool type */
function ToolIcon({ name }: { name: string }) {
  // Search-related tools
  if (name.includes("Recherche") || name.includes("search")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  // Data/query tools
  if (name.includes("Interrogation") || name.includes("données") || name.includes("query")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  // Info/metadata tools
  if (name.includes("Récupération") || name.includes("info") || name.includes("dimensions")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  // List/explore tools
  if (name.includes("Exploration") || name.includes("Chargement") || name.includes("list")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  // Default tool icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** Completed tool call card */
function ToolCallCard({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
      style={{ backgroundColor: "var(--surface)", color: "var(--muted)" }}
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

/** Active tool spinner */
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

export default function ChatMessages({ messages, isLoading, toolStatus, toolHistory = [] }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            {msg.role === "assistant" ? (
              <div className="flex-shrink-0 mt-1">
                <SenegalFlag size={24} />
              </div>
            ) : (
              <div
                className="flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
              >
                U
              </div>
            )}
            <div className="flex-1 min-w-0">
              {msg.role === "assistant" ? (
                <div className="message-content text-sm leading-relaxed prose prose-sm max-w-none"
                  style={{ color: "var(--foreground)" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div
                  className="message-content text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--foreground)" }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <SenegalFlag size={24} />
            </div>
            <div className="flex-1 space-y-2">
              {/* Completed tool calls */}
              {toolHistory.slice(0, -1).map((tool, i) => (
                <ToolCallCard key={i} name={tool} />
              ))}
              {/* Currently active tool */}
              {toolStatus ? (
                <ActiveToolCard name={toolStatus} />
              ) : (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--muted)" }}
                >
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
