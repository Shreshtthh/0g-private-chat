import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/constants";

/* Strip x_0g_trace from 0G responses so the AI SDK doesn't choke on it */
const cleanFetch: typeof globalThis.fetch = async (input, init) => {
  const res = await globalThis.fetch(input, init);
  if (!res.body) return res;

  const reader = res.body.getReader();
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) { controller.close(); return; }

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");
      const cleaned = lines
        .map((line) => {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const json = JSON.parse(line.slice(6));
              delete json.x_0g_trace;
              if (!json.choices) return null;
              return "data: " + JSON.stringify(json);
            } catch { return line; }
          }
          return line;
        })
        .filter((line) => line !== null)
        .join("\n");

      controller.enqueue(new TextEncoder().encode(cleaned));
    },
  });

  return new Response(stream, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};

const provider = createOpenAI({
  baseURL: process.env.ZG_ROUTER_BASE_URL,
  apiKey: process.env.ZG_ROUTER_API_KEY || "",
  fetch: cleanFetch,
});

const DEFAULT_MODEL = "qwen/qwen-2.5-7b-instruct";

export async function POST(req: Request) {
  const body = await req.json();
  const messages = (body.messages || []).map((m: any) => ({
    role: m.role,
    content: m.content || m.prompt || "",
  }));

  const result = streamText({
    model: provider.chat(DEFAULT_MODEL),
    messages,
    system: SYSTEM_PROMPT,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
