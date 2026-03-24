"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import SenegalFlag from "@/components/SenegalFlag";
import SectorChips from "@/components/SectorChips";
import ChatInput from "@/components/ChatInput";
import ChatMessages, { type Message, type ToolCall } from "@/components/ChatMessages";

const TOOL_LABELS: Record<string, string> = {
  list_themes: "Exploration des thèmes disponibles",
  search_datasets: "Recherche de datasets",
  get_dataset_info: "Récupération des informations du dataset",
  list_dataset_dimensions: "Chargement des dimensions",
  query_dataset_data: "Interrogation des données",
};

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [toolHistory, setToolHistory] = useState<ToolCall[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const messages = activeConv?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const createConversation = (firstMessage: string): string => {
    const id = Date.now().toString();
    const title =
      firstMessage.length > 35
        ? firstMessage.substring(0, 35) + "..."
        : firstMessage;
    const newConv: Conversation = { id, title, messages: [] };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
    return id;
  };

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
    setToolStatus(null);
    setToolHistory([]);

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
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (event.type === "tool_use") {
              const label = TOOL_LABELS[event.tool] || event.tool;
              // Mark previous active tool as done, add new one
              setToolHistory((prev) => {
                const updated = prev.map((t) =>
                  t.done ? t : { ...t, done: true }
                );
                return [...updated, { name: label, args: event.args, done: false }];
              });
              setToolStatus(label);
            } else if (event.type === "text") {
              fullText += event.content;
            } else if (event.type === "error") {
              fullText = event.content;
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      // Strip XML tool call artifacts that some models inject into text
      const cleanText = fullText
        .replace(/<ansd_mcp>[\s\S]*?<\/ansd_mcp>/g, "")
        .replace(/<ansd_\w+>[\s\S]*?<\/ansd_\w+>/g, "")
        .replace(/<function_calls>[\s\S]*?<\/function_calls>/g, "")
        .replace(/<invoke[\s\S]*?<\/antml:invoke>/g, "")
        .replace(/<parameter[\s\S]*?<\/antml:parameter>/g, "")
        .replace(/<invoke[\s\S]*?<\/invoke>/g, "")
        .replace(/<parameter[\s\S]*?<\/parameter>/g, "")
        .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, "")
        .replace(/<tool_result>[\s\S]*?<\/tool_result>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

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
    } finally {
      setIsLoading(false);
      setToolStatus(null);
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

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-center px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <SenegalFlag size={20} />
            <span className="text-sm font-medium">Portail MCP Sénégal</span>
          </div>
        </header>

        {/* Welcome screen or chat */}
        {isWelcomeScreen ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <SenegalFlag size={56} />
              </div>
              <h1
                className="text-3xl font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Bienvenue sur le portail mcp-gouv-sn
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Explorez les données ouvertes du Sénégal - ANSD
              </p>
            </div>

            <div className="w-full max-w-2xl mb-6">
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>

            <SectorChips onSelect={handleSend} />
          </div>
        ) : (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} toolStatus={toolStatus} toolHistory={toolHistory} />
            <div ref={messagesEndRef} />
            <div className="px-4 pb-4 pt-2">
              <div className="max-w-3xl mx-auto">
                <ChatInput onSend={handleSend} disabled={isLoading} />
                <p
                  className="text-xs text-center mt-2"
                  style={{ color: "var(--muted)" }}
                >
                  Données fournies par l&apos;ANSD via le protocole MCP - Propulsé par Claude
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
