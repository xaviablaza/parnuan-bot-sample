import { OpenRouter } from "@openrouter/sdk";
import { MODEL, SYSTEM_PROMPT } from "./prompt.js";

export type CategorizeResult = {
  category: string;
  firstTokenMs: number | null;
  totalMs: number;
  raw: string;
};

export function createOpenRouterClient(): OpenRouter {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "local-dev-key";
  const serverURL = process.env.OPENROUTER_BASE_URL ?? "http://127.0.0.1:8000/v1";

  // The SDK supports OpenRouter's API shape. We pass baseURL so it can target
  // fastapi-vllm's OpenAI/OpenRouter-compatible endpoint during local testing.
  return new OpenRouter({
    apiKey,
    serverURL,
  });
}

export async function categorizeExpense(userMessage: string): Promise<CategorizeResult> {
  const openrouter = createOpenRouterClient();
  const start = performance.now();
  let firstTokenAt: number | null = null;
  let raw = "";

  const stream = await openrouter.chat.send({
    chatRequest: {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      stream: true,
      temperature: 0.1,
      maxTokens: 8,
    },
  } as any);

  for await (const chunk of stream as any) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      if (firstTokenAt === null) firstTokenAt = performance.now();
      raw += content;
      process.stdout.write(content);
    }
  }

  const end = performance.now();
  const category = raw.trim();

  return {
    category,
    firstTokenMs: firstTokenAt === null ? null : Math.round(firstTokenAt - start),
    totalMs: Math.round(end - start),
    raw,
  };
}
