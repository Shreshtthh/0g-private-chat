import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/constants";

const provider = createOpenAI({
  baseURL: process.env.ZG_ROUTER_BASE_URL || "https://api.groq.com/openai/v1",
  apiKey: process.env.ZG_ROUTER_API_KEY || process.env.GROQ_API_KEY || "",
  compatibility: "compatible",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body.messages || []).map((m: any) => ({
      role: m.role,
      content: m.content || m.prompt || "",
    }));

    const result = streamText({
      model: provider.chat(body.model || "llama-3.3-70b-versatile"),
      messages,
      system: SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 4096,
    });

    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error("[API] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
