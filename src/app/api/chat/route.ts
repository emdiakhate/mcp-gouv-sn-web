import { NextRequest, NextResponse } from "next/server";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://mcp-gouv-sn.up.railway.app";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MCPContent {
  type: string;
  text: string;
}

async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  const res = await fetch(`${MCP_SERVER_URL}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });

  const data = await res.json();
  if (data.result?.content) {
    return data.result.content
      .map((c: MCPContent) => c.text)
      .join("\n");
  }
  return JSON.stringify(data.result || data.error || data);
}

function detectIntent(message: string): {
  tool: string;
  args: Record<string, unknown>;
} {
  const lower = message.toLowerCase();

  if (
    lower.includes("theme") ||
    lower.includes("thème") ||
    lower.includes("quelles donnees") ||
    lower.includes("quelles données") ||
    lower.includes("disponible") ||
    lower.includes("liste") ||
    lower.includes("secteur")
  ) {
    return { tool: "list_themes", args: {} };
  }

  if (lower.includes("cherch") || lower.includes("recherch")) {
    const keyword = message.replace(/.*(?:cherch|recherch)\w*\s*/i, "").trim();
    return { tool: "search_datasets", args: { keyword: keyword || message } };
  }

  const topicKeywords: Record<string, string[]> = {
    "sante": ["sante", "santé", "hopital", "hôpital", "medic", "médic", "vaccin", "mortalite", "mortalité", "nutrition", "maternelle", "contraception"],
    "economie": ["economi", "économi", "pib", "commerce", "financ", "emploi", "chomage", "chômage"],
    "agriculture": ["agricul", "elevage", "élevage", "peche", "pêche", "recolte", "récolte"],
    "education": ["educa", "éduca", "scolar", "alphabet", "ecole", "école", "universite", "université"],
    "demographie": ["demograph", "démograph", "population", "menage", "ménage", "migration", "recensement"],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((k) => lower.includes(k))) {
      return { tool: "search_datasets", args: { keyword: topic } };
    }
  }

  return { tool: "search_datasets", args: { keyword: message.substring(0, 100) } };
}

function formatResponse(tool: string, rawResult: string): string {
  try {
    const data = JSON.parse(rawResult);

    if (tool === "list_themes" && Array.isArray(data)) {
      let response = "Donnees disponibles sur le portail ANSD :\n\n";
      for (const theme of data) {
        response += `### ${theme.theme}\n`;
        if (theme.subcategories) {
          for (const sub of theme.subcategories) {
            response += `\n**${sub.name}**\n`;
            if (sub.datasets) {
              for (const ds of sub.datasets) {
                response += `- ${ds.name}: ${ds.description || ""}\n`;
              }
            }
          }
        }
        response += "\n";
      }
      return response;
    }

    if (tool === "search_datasets" && Array.isArray(data)) {
      if (data.length === 0) {
        return "Aucun dataset trouve pour cette recherche. Essayez avec d'autres mots-cles, ou tapez 'themes' pour voir toutes les donnees disponibles.";
      }
      let response = `${data.length} dataset(s) trouve(s) :\n\n`;
      for (const ds of data) {
        response += `- **${ds.name}** (${ds.id || ""})\n  ${ds.description || ""}\n`;
      }
      return response;
    }

    return rawResult;
  } catch {
    return rawResult;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const intent = detectIntent(lastUserMsg.content);
    const mcpResult = await callMCPTool(intent.tool, intent.args);
    const response = formatResponse(intent.tool, mcpResult);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { response: "Erreur lors de la connexion au serveur MCP. Le serveur est peut-etre temporairement indisponible." },
      { status: 500 }
    );
  }
}
