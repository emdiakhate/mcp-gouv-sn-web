"use client";

import SenegalFlag from "./SenegalFlag";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
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
              <div
                className="message-content text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--foreground)" }}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              <SenegalFlag size={24} />
            </div>
            <div className="flex-1">
              <div className="typing-cursor text-sm" style={{ color: "var(--muted)" }}>
                Recherche en cours
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
