"use client";

import { useTheme } from "./ThemeProvider";

interface SidebarProps {
  conversations: { id: string; title: string }[];
  activeConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export default function Sidebar({
  conversations,
  activeConversation,
  onNewChat,
  onSelectConversation,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="w-[260px] h-screen flex flex-col border-r"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--border)",
      }}
    >
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{ backgroundColor: "var(--accent)", color: "#ffffff" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle conversation
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 truncate cursor-pointer"
            style={{
              backgroundColor:
                activeConversation === conv.id
                  ? "var(--surface-hover)"
                  : "transparent",
              color: "var(--foreground)",
            }}
          >
            {conv.title}
          </button>
        ))}
      </div>

      {/* Bottom: theme toggle */}
      <div
        className="p-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          mcp-gouv-sn
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg cursor-pointer"
          style={{ backgroundColor: "var(--surface)" }}
          title={theme === "light" ? "Mode sombre" : "Mode clair"}
        >
          {theme === "light" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
}
