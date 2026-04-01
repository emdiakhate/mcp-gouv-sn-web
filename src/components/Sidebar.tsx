"use client";

import { useMemo } from "react";
import { useTheme } from "./ThemeProvider";

interface ConversationItem {
  id: string;
  title: string;
  createdAt?: number;
}

const now = Date.now();
const MOCK_CONVERSATIONS: ConversationItem[] = [
  { id: "mock-1", title: "Population par région 2023", createdAt: now - 3600000 },
  { id: "mock-2", title: "Évolution du PIB sur 10 ans", createdAt: now - 3600000 * 3 },
  { id: "mock-3", title: "Taux de scolarisation des filles", createdAt: now - 86400000 * 2 },
  { id: "mock-4", title: "Mortalité infantile par région", createdAt: now - 86400000 * 5 },
  { id: "mock-5", title: "Commerce extérieur Sénégal", createdAt: now - 86400000 * 10 },
  { id: "mock-6", title: "Données agriculture et élevage", createdAt: now - 86400000 * 15 },
];

interface SidebarProps {
  conversations: ConversationItem[];
  activeConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function groupConversationsByDate(conversations: ConversationItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  const groups: { title: string; items: ConversationItem[] }[] = [
    { title: "Aujourd'hui", items: [] },
    { title: "Cette semaine", items: [] },
    { title: "Plus tôt", items: [] },
  ];

  for (const conv of conversations) {
    const ts = conv.createdAt || parseInt(conv.id) || 0;
    if (ts >= today) {
      groups[0].items.push(conv);
    } else if (ts >= weekAgo) {
      groups[1].items.push(conv);
    } else {
      groups[2].items.push(conv);
    }
  }

  return groups.filter((g) => g.items.length > 0);
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
  const allConversations = useMemo(
    () => [...conversations, ...MOCK_CONVERSATIONS.filter((m) => !conversations.some((c) => c.id === m.id))],
    [conversations]
  );
  const groups = useMemo(() => groupConversationsByDate(allConversations), [allConversations]);

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

      {/* Conversation list — grouped by date */}
      <div className="flex-1 overflow-y-auto px-2">
        {collapsed ? (
          allConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="w-full rounded-lg mb-0.5 cursor-pointer"
              style={{
                backgroundColor: activeConversation === conv.id ? "var(--surface-hover)" : "transparent",
                padding: "8px 0",
                textAlign: "center",
              }}
              title={conv.title}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          ))
        ) : (
          groups.map((group) => (
            <div key={group.title} style={{ marginBottom: "8px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--muted)",
                  padding: "4px 12px",
                  margin: "0 0 2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {group.title}
              </p>
              {group.items.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="w-full text-left rounded-lg text-sm mb-0.5 cursor-pointer truncate"
                  style={{
                    backgroundColor: activeConversation === conv.id ? "var(--surface-hover)" : "transparent",
                    color: "var(--foreground)",
                    padding: "8px 12px",
                  }}
                  title={conv.title}
                >
                  {conv.title}
                </button>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Bottom: theme toggle */}
      <div
        className="p-2 border-t flex items-center"
        style={{
          borderColor: "var(--border)",
          justifyContent: "center",
        }}
      >
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
