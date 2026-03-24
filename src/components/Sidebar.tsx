"use client";

import { useTheme } from "./ThemeProvider";

interface SidebarProps {
  conversations: { id: string; title: string }[];
  activeConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  activeConversation,
  onNewChat,
  onSelectConversation,
  collapsed,
  onToggle,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="h-screen flex flex-col border-r overflow-hidden flex-shrink-0"
      style={{
        width: collapsed ? 56 : 260,
        minWidth: collapsed ? 56 : 260,
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--border)",
        transition: "width 200ms ease, min-width 200ms ease",
      }}
    >
      {/* Top: hamburger + new chat */}
      <div className="p-2 space-y-1">
        {/* Hamburger toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg cursor-pointer hover:opacity-80"
          style={{ backgroundColor: "var(--surface)" }}
          title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* New chat button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-90"
          style={{
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            padding: collapsed ? "8px 0" : "8px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          title="Nouvelle conversation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {!collapsed && <span className="truncate">Nouvelle conversation</span>}
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="w-full text-left rounded-lg text-sm mb-0.5 cursor-pointer truncate"
            style={{
              backgroundColor:
                activeConversation === conv.id
                  ? "var(--surface-hover)"
                  : "transparent",
              color: "var(--foreground)",
              padding: collapsed ? "8px 0" : "8px 12px",
              textAlign: collapsed ? "center" : "left",
            }}
            title={conv.title}
          >
            {collapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              conv.title
            )}
          </button>
        ))}
      </div>

      {/* Bottom: theme toggle */}
      <div
        className="p-2 border-t flex items-center"
        style={{
          borderColor: "var(--border)",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <span className="text-xs truncate" style={{ color: "var(--muted)" }}>
            mcp-gouv-sn
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg cursor-pointer flex-shrink-0"
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
