import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://mcp-gouv-sn-production.up.railway.app";

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans les données publiques du Sénégal. Tu aides les utilisateurs à explorer et comprendre les données de l'ANSD (Agence Nationale de la Statistique et de la Démographie).

Tu as accès à des outils MCP qui te permettent d'interroger les datasets de l'ANSD. Utilise-les pour répondre aux questions des utilisateurs.

Règles :
- Réponds toujours en français
- Utilise les outils disponibles pour trouver les données pertinentes avant de répondre
- Commence par lister les thèmes ou chercher les datasets pertinents si tu n'es pas sûr
- Présente les données de manière claire avec des tableaux markdown quand c'est approprié
- Si l'utilisateur pose une question générale, utilise list_themes pour montrer ce qui est disponible
- Si l'utilisateur cherche des données spécifiques, utilise search_datasets puis get_dataset_info et query_dataset_data
- Ne fabrique jamais de données. Si tu ne trouves pas l'information, dis-le clairement
- Quand tu affiches des données tabulaires, utilise des tableaux markdown`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MCPContent {
  type: string;
  text: string;
}

interface MCPToolInputSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: MCPToolInputSchema;
}

let cachedTools: Anthropic.Tool[] | null = null;
let toolsCacheTime = 0;
const TOOLS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getMCPTools(): Promise<Anthropic.Tool[]> {
  if (cachedTools && Date.now() - toolsCacheTime < TOOLS_CACHE_TTL) {
    return cachedTools;
  }

  const res = await fetch(`${MCP_SERVER_URL}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/list",
      params: {},
    }),
  });

  const data = await res.json();
  const mcpTools: MCPTool[] = data.result?.tools || [];

  cachedTools = mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description || "",
    input_schema: {
      type: "object" as const,
      properties: tool.inputSchema?.properties || {},
      required: tool.inputSchema?.required || [],
    },
  }));

  toolsCacheTime = Date.now();
  return cachedTools;
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

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });
    const tools = await getMCPTools();

    // Convert chat messages to Anthropic format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Stream response with tool use loop
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...anthropicMessages];
          let iterationCount = 0;
          const MAX_ITERATIONS = 10;

          while (iterationCount < MAX_ITERATIONS) {
            iterationCount++;

            const response = await client.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              system: SYSTEM_PROMPT,
              tools,
              messages: currentMessages,
            });

            // Process response blocks
            let hasToolUse = false;
            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            let textContent = "";

            for (const block of response.content) {
              if (block.type === "text") {
                textContent += block.text;
              } else if (block.type === "tool_use") {
                hasToolUse = true;

                // Send a status update for tool use
                const statusEvent = `data: ${JSON.stringify({
                  type: "tool_use",
                  tool: block.name,
                })}\n\n`;
                controller.enqueue(encoder.encode(statusEvent));

                // Call the MCP tool
                const toolResult = await callMCPTool(
                  block.name,
                  block.input as Record<string, unknown>
                );

                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: toolResult,
                });
              }
            }

            if (hasToolUse) {
              // Add assistant response and tool results to messages
              currentMessages = [
                ...currentMessages,
                { role: "assistant", content: response.content },
                { role: "user", content: toolResults },
              ];
              // Continue the loop so Claude can process tool results
              continue;
            }

            // No tool use - send the final text
            if (textContent) {
              const textEvent = `data: ${JSON.stringify({
                type: "text",
                content: textContent,
              })}\n\n`;
              controller.enqueue(encoder.encode(textEvent));
            }

            break;
          }

          // Send done event
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorEvent = `data: ${JSON.stringify({
            type: "error",
            content: "Erreur lors du traitement de votre demande. Veuillez réessayer.",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Erreur lors de la connexion au serveur. Veuillez réessayer.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
