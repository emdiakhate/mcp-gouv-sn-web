"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex items-end gap-2 rounded-2xl border px-4 py-3 shadow-sm"
      style={{
        backgroundColor: "var(--input-bg)",
        borderColor: "var(--border)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Comment puis-je vous aider ?"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent outline-none text-sm leading-6"
        style={{ color: "var(--foreground)", maxHeight: "200px" }}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="p-2 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          backgroundColor: message.trim() ? "var(--accent)" : "var(--surface)",
          color: message.trim() ? "#ffffff" : "var(--muted)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
