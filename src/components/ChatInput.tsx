"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
}

export default function ChatInput({ onSend, disabled, isLoading, onStop }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
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
      className="flex items-end gap-2"
      style={{
        backgroundColor: "var(--input-bg)",
        border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "12px 16px",
        transition: "border-color 0.15s",
      }}
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Posez votre question sur les données officielles du Sénégal..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent outline-none"
        style={{ color: "var(--foreground)", maxHeight: "200px", fontSize: "15px", lineHeight: "1.5", minHeight: "24px" }}
      />
      {isLoading ? (
        <button
          onClick={onStop}
          className="flex items-center justify-center cursor-pointer hover:opacity-80 flex-shrink-0"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
          title="Arrêter"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--muted)">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            backgroundColor: message.trim() ? "var(--accent)" : "var(--surface)",
            border: "none",
            transition: "background 0.15s",
          }}
          title="Envoyer (Enter)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={message.trim() ? "#ffffff" : "var(--muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      )}
    </div>
  );
}
