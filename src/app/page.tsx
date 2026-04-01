"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import SenegalFlag from "@/components/SenegalFlag";
import ServiceCarousel from "@/components/ServiceCarousel";
import ChatInput from "@/components/ChatInput";
import ChatMessages, { type Message, type MCPCall } from "@/components/ChatMessages";
import ArtifactPanel from "@/components/ArtifactPanel";
import { ArtifactProvider, useArtifact } from "@/contexts/ArtifactContext";

const TOOL_LABELS: Record<string, string> = {
  list_themes: "List themes",
  search_datasets: "Search datasets",
  get_dataset_info: "Get dataset info",
  list_dataset_dimensions: "List dimensions",
  query_dataset_data: "Query data",
};

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

/* ─── Persist split ratio in localStorage ─── */
const STORAGE_KEY = "mcp-split-ratio";
function loadSplitRatio(): number {
  if (typeof window === "undefined") return 50;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const n = parseFloat(saved);
    if (n >= 25 && n <= 75) return n;
  }
  return 50;
}
/** Strip all non-standard XML/HTML tags from LLM output */
function cleanLLMText(text: string): string {
  return text
    .replace(/<ansd_mcp>[\s\S]*?<\/ansd_mcp>/g, "")
    .replace(/<ansd_\w+>[\s\S]*?<\/ansd_\w+>/g, "")
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/g, "")
    .replace(/<invoke[\s\S]*?<\/antml:invoke>/g, "")
    .replace(/<parameter[\s\S]*?<\/antml:parameter>/g, "")
    .replace(/<invoke[\s\S]*?<\/invoke>/g, "")
    .replace(/<parameter[\s\S]*?<\/parameter>/g, "")
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "")
    .replace(/<tool_result>[\s\S]*?<\/tool_result>/g, "")
    .replace(/<mcp[\s\S]*?>[\s\S]*?<\/mcp>/g, "")
    .replace(/<mcp\s*\/>/g, "")
    .replace(/<\/?mcp>/g, "")
    .replace(/<[a-zA-Z_][\w-]*>[\s\S]*?<\/[a-zA-Z_][\w-]*>/g, (match) => {
      const tag = match.match(/^<(\w+)/)?.[1] || "";
      const safeTags = ["p", "br", "em", "strong", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "a", "code", "pre", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "div", "span", "img", "viz"];
      if (safeTags.includes(tag.toLowerCase())) return match;
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function saveSplitRatio(ratio: number) {
  localStorage.setItem(STORAGE_KEY, String(ratio));
}

function HomeInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mcpCalls, setMcpCalls] = useState<MCPCall[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const { isOpen: artifactOpen } = useArtifact();

  // Resizable split state
  const [splitRatio, setSplitRatio] = useState(50);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved ratio on mount
  useEffect(() => {
    setSplitRatio(loadSplitRatio());
  }, []);

  // Drag handlers for resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      const clamped = Math.min(75, Math.max(25, pct));
      setSplitRatio(clamped);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // Save on release
        setSplitRatio((current) => {
          saveSplitRatio(current);
          return current;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K: new conversation
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track if user is near bottom of chat
  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 150;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const scrollToBottom = useCallback((instant?: boolean) => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
  }, []);

  // Auto-scroll only when user is near bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(isLoading);
    }
  }, [messages, isLoading, scrollToBottom]);

  const createConversation = (firstMessage: string): string => {
    const id = Date.now().toString();
    const title =
      firstMessage.length > 35
        ? firstMessage.substring(0, 35) + "..."
        : firstMessage;
    const newConv: Conversation = { id, title, messages: [], createdAt: Date.now() };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
    return id;
  };

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleSend = async (text: string) => {
    let convId = activeConvId;
    if (!convId) {
      convId = createConversation(text);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
      )
    );

    setIsLoading(true);
    setMcpCalls([]);
    setStreamingText("");

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let fullText = "";

    try {
      const currentConv = conversations.find((c) => c.id === convId);
      const history = currentConv
        ? [...currentConv.messages, userMsg]
        : [userMsg];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error || `Erreur serveur (HTTP ${res.status})`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          // Skip SSE comments and empty lines
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            // Skip status events (heartbeat/thinking)
            if (event.type === "status") continue;
            if (event.type === "tool_use") {
              const label = TOOL_LABELS[event.tool] || event.tool;
              setMcpCalls((prev) => {
                const updated = prev.map((t) =>
                  t.status === "running" ? { ...t, status: "done" as const } : t
                );
                return [...updated, { tool: event.tool, label, status: "running" as const, input: event.args }];
              });
            } else if (event.type === "tool_result") {
              setMcpCalls((prev) =>
                prev.map((t) =>
                  t.tool === event.tool && t.status === "running"
                    ? { ...t, status: "done" as const, output: event.result }
                    : t
                )
              );
            } else if (event.type === "text") {
              fullText += event.content;
              setStreamingText(cleanLLMText(fullText));
            } else if (event.type === "error") {
              fullText = event.content;
              setStreamingText(fullText);
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      // Strip XML tool call artifacts
      const cleanText = cleanLLMText(fullText);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          cleanText ||
          "Désolé, je n'ai pas pu obtenir de réponse. Veuillez réessayer.",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // User stopped — save partial text
        const partialText = fullText || "";
        if (partialText) {
          const partialMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: partialText + "\n\n*[Réponse interrompue]*",
          };
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? { ...c, messages: [...c.messages, partialMsg] }
                : c
            )
          );
        }
      } else {
        const detail =
          error instanceof Error ? error.message : "";
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            detail ||
            "Erreur de connexion au serveur. Vérifiez que le serveur est en ligne et que la clé API est configurée.",
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, errorMsg] }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingText("");
      setMcpCalls([]);
      abortControllerRef.current = null;
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    if (serviceId === "ansd") {
      // Create conversation and inject a service-info message
      let convId = activeConvId;
      if (!convId) {
        convId = createConversation("ANSD — Données disponibles");
      }
      const serviceMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "",
        type: "service-info",
        serviceId: "ansd",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, serviceMsg] } : c
        )
      );
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const isWelcomeScreen = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar
        conversations={conversations}
        activeConversation={activeConvId}
        onNewChat={handleNewChat}
        onSelectConversation={setActiveConvId}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area — resizable split when artifact panel is open */}
      <div ref={containerRef} className="flex-1 flex min-w-0">
        {/* Chat column */}
        <main
          className="flex flex-col min-w-0 h-full relative"
          style={{ width: artifactOpen ? `${splitRatio}%` : "100%", flexShrink: 0 }}
        >
          {/* Top bar */}
          <header
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div style={{ width: 60 }} />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <SenegalFlag size={20} />
                <span className="text-sm font-medium">Portail des données publiques du Sénégal</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                Interrogez les données officielles du Sénégal en langage naturel
              </span>
            </div>
            <span
              style={{
                background: "#FAEEDA",
                color: "#854F0B",
                fontSize: "10px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "20px",
                border: "0.5px solid #EF9F27",
                letterSpacing: "0.06em",
              }}
            >
              BÊTA
            </span>
          </header>

          {/* Welcome screen or chat */}
          {isWelcomeScreen ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10" style={{ gap: "20px" }}>
              {/* Logo + Title */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <SenegalFlag size={44} />
                </div>
                <h1
                  className="text-2xl font-semibold mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Portail des données publiques du Sénégal
                </h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Explorez les données ouvertes du Sénégal — 10 services gouvernementaux connectés
                </p>
              </div>

              {/* Chat input */}
              <div className="w-full max-w-2xl">
                <ChatInput onSend={handleSend} disabled={isLoading} isLoading={isLoading} onStop={handleStop} />
              </div>

              {/* Service grid */}
              <ServiceCarousel onSelectService={handleServiceSelect} />
            </div>
          ) : (
            <>
              <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto pb-10">
                <ChatMessages messages={messages} isLoading={isLoading} mcpCalls={mcpCalls} streamingText={streamingText} onSelectPrompt={handleSend} />
                <div ref={messagesEndRef} />
              </div>
              <div className="px-4 pb-10 pt-2">
                <div className="max-w-3xl mx-auto">
                  <ChatInput onSend={handleSend} disabled={isLoading} isLoading={isLoading} onStop={handleStop} />
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <footer
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "6px 16px",
              background: "var(--background)",
              borderTop: "0.5px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "11px",
              color: "var(--muted)",
              zIndex: 50,
            }}
          >
            <span>🔒 Sources officielles</span>
            <span className="footer-detail" style={{ opacity: 0.4 }}>·</span>
            <span className="footer-detail">Données ANSD · CC BY 4.0</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span><strong style={{ color: "var(--foreground)" }}>YNNOVIA</strong></span>
          </footer>
        </main>

        {/* Resize handle + Artifact panel */}
        {artifactOpen && (
          <>
            {/* Drag handle */}
            <div
              className="resize-handle"
              onMouseDown={handleMouseDown}
            />
            {/* Artifact panel fills remaining space */}
            <div className="flex-1 min-w-0 h-full">
              <ArtifactPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ArtifactProvider>
      <HomeInner />
    </ArtifactProvider>
  );
}
