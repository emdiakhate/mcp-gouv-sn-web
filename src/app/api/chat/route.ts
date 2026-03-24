import { NextRequest } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/config/systemPrompt";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://mcp-gouv-sn-production.up.railway.app";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";

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

interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

let cachedTools: OpenAITool[] | null = null;
let toolsCacheTime = 0;
const TOOLS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getMCPTools(): Promise<OpenAITool[]> {
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
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: {
        type: "object" as const,
        properties: tool.inputSchema?.properties || {},
        required: tool.inputSchema?.required || [],
      },
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey,
    });

    const tools = await getMCPTools();

    // Build OpenAI-format messages
    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Stream response with tool use loop
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = [...openaiMessages];
          let iterationCount = 0;
          const MAX_ITERATIONS = 10;

          while (iterationCount < MAX_ITERATIONS) {
            iterationCount++;

            const response = await client.chat.completions.create({
              model: OPENROUTER_MODEL,
              max_tokens: 4096,
              tools,
              messages: currentMessages,
            });

            const choice = response.choices[0];
            if (!choice) break;

            const message = choice.message;
            const toolCalls = message.tool_calls;

            if (toolCalls && toolCalls.length > 0) {
              // Add assistant message with tool calls to history
              currentMessages.push(message);

              // Execute each tool call
              for (const toolCall of toolCalls) {
                if (toolCall.type !== "function") continue;
                const toolName = toolCall.function.name;

                // Send status update
                const statusEvent = `data: ${JSON.stringify({
                  type: "tool_use",
                  tool: toolName,
                })}\n\n`;
                controller.enqueue(encoder.encode(statusEvent));

                // Parse arguments and call MCP tool
                let args: Record<string, unknown> = {};
                try {
                  args = JSON.parse(toolCall.function.arguments);
                } catch {
                  // empty args if parsing fails
                }

                const toolResult = await callMCPTool(toolName, args);

                // Add tool result to messages
                currentMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: toolResult,
                });
              }

              // Continue loop so the model can process tool results
              continue;
            }

            // No tool calls - send final text
            if (message.content) {
              const textEvent = `data: ${JSON.stringify({
                type: "text",
                content: message.content,
              })}\n\n`;
              controller.enqueue(encoder.encode(textEvent));
            }

            break;
          }

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
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Chat API error:", errMsg);

    // Provide a more specific error message
    let userMessage =
      "Erreur lors de la connexion au serveur. Veuillez réessayer.";
    if (
      errMsg.includes("ECONNREFUSED") ||
      errMsg.includes("fetch failed")
    ) {
      userMessage = `Impossible de contacter le serveur MCP (${MCP_SERVER_URL}). Vérifiez que le serveur est en ligne ou supprimez MCP_SERVER_URL de .env.local pour utiliser le serveur de production.`;
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
