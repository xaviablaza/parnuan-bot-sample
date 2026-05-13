import { OpenRouter } from "@openrouter/sdk";
import { MODEL, SYSTEM_PROMPT } from "./prompt.js";

export type CategorizeResult = {
  category: string;
  firstTokenMs: number | null;
  totalMs: number;
  raw: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costUsd: number | null;
};

// OpenRouter pricing for meta-llama/llama-3.2-3b-instruct
const INPUT_PRICE_PER_1M = 0.051;
const OUTPUT_PRICE_PER_1M = 0.34;

export function createOpenRouterClient(): OpenRouter {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "local-dev-key";
  const serverURL = process.env.OPENROUTER_BASE_URL ?? "http://127.0.0.1:8000/v1";

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
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;
  let totalTokens: number | null = null;

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
    // Detect usage in final chunk
    if (chunk.usage) {
      promptTokens = chunk.usage.promptTokens ?? chunk.usage.prompt_tokens ?? null;
      completionTokens = chunk.usage.completionTokens ?? chunk.usage.completion_tokens ?? null;
      totalTokens = chunk.usage.totalTokens ?? chunk.usage.total_tokens ?? null;
      continue;
    }
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      if (firstTokenAt === null) firstTokenAt = performance.now();
      raw += content;
      process.stdout.write(content);
    }
  }

  const end = performance.now();
  const category = raw.trim();

  let costUsd: number | null = null;
  if (promptTokens !== null && completionTokens !== null) {
    costUsd = (promptTokens * INPUT_PRICE_PER_1M + completionTokens * OUTPUT_PRICE_PER_1M) / 1_000_000;
  }

  return {
    category,
    firstTokenMs: firstTokenAt === null ? null : Math.round(firstTokenAt - start),
    totalMs: Math.round(end - start),
    raw,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
  };
}
