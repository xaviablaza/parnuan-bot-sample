import "dotenv/config";
import express from "express";
import { Client, middleware, WebhookEvent, TextMessage } from "@line/bot-sdk";
import { categorizeExpense } from "./categorizer.js";

const port = Number(process.env.PORT ?? 3000);

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
  channelSecret: process.env.LINE_CHANNEL_SECRET ?? "",
};

const client = new Client(lineConfig);
const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/webhook", middleware(lineConfig), async (req, res) => {
  const events: WebhookEvent[] = req.body.events ?? [];
  await Promise.all(events.map(handleEvent));
  res.status(200).end();
});

async function handleEvent(event: WebhookEvent): Promise<void> {
  if (event.type !== "message" || event.message.type !== "text") return;

  const userText = event.message.text;
  const startedAt = Date.now();
  const result = await categorizeExpense(userText);
  const elapsed = Date.now() - startedAt;

  const reply: TextMessage = {
    type: "text",
    text: `Category: ${result.category}
First token: ${result.firstTokenMs ?? "n/a"}ms
Total: ${result.totalMs}ms
Webhook elapsed: ${elapsed}ms`,
  };

  await client.replyMessage(event.replyToken, reply);
}

app.listen(port, () => {
  console.log(`parnuan-bot-sample listening on http://127.0.0.1:${port}`);
  console.log(`OpenRouter base URL: ${process.env.OPENROUTER_BASE_URL ?? "http://127.0.0.1:8000/v1"}`);
});
