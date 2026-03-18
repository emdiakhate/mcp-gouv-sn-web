"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import SenegalFlag from "@/components/SenegalFlag";
import SectorChips from "@/components/SectorChips";
import ChatInput from "@/components/ChatInput";
import ChatMessages, { type Message } from "@/components/ChatMessages";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      firstMessage.length > 40
        ? firstMessage.substring(0, 40) + "..."
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

    try {
      const currentConv = conversations.find((c) => c.id === convId);
      const history = currentConv
        ? [...currentConv.messages, userMsg]
        : [userMsg];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          "Desole, une erreur est survenue. Veuillez reessayer.",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Erreur de connexion au serveur MCP. Verifiez que le serveur est en ligne.",
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
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const isWelcomeScreen = messages.length === 0 && !isLoading;

  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--background)" }}>
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeConversation={activeConvId}
          onNewChat={handleNewChat}
          onSelectConversation={setActiveConvId}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg cursor-pointer"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <SenegalFlag size={20} />
            <span className="text-sm font-medium">Portail MCP Senegal</span>
          </div>
          <div className="w-8" />
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
                Explorez les donnees ouvertes du Senegal - ANSD
              </p>
            </div>

            <div className="w-full max-w-2xl mb-6">
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>

            <SectorChips onSelect={handleSend} />
          </div>
        ) : (
          <>
            <ChatMessages messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
            <div className="px-4 pb-4 pt-2">
              <div className="max-w-3xl mx-auto">
                <ChatInput onSend={handleSend} disabled={isLoading} />
                <p
                  className="text-xs text-center mt-2"
                  style={{ color: "var(--muted)" }}
                >
                  Donnees fournies par l&apos;ANSD via le protocole MCP
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
