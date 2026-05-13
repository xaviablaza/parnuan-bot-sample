# parnuan-bot-sample

TypeScript LINE bot sample that calls an OpenRouter-compatible local FastAPI/vLLM endpoint for expense categorization.

The sample uses `@openrouter/sdk`, streams responses, injects the categorization system prompt, and prints timing metrics.

## Local CLI smoke test

Start `fastapi-vllm` first:

```bash
cd ../fastapi-vllm
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Then run the bot sample in CLI mode:

```bash
npm install
OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "electricity 200"
```

Expected output includes:

```text
category=Utilities
first_token_ms=...
total_ms=...
```

## LINE webhook mode

```bash
cp .env.example .env
npm run dev
```

Env vars:

- `OPENROUTER_API_KEY`: any value for local `fastapi-vllm`; real key if using OpenRouter
- `OPENROUTER_BASE_URL`: `http://127.0.0.1:8000/v1` for local fastapi-vllm
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Messaging API token
- `LINE_CHANNEL_SECRET`: LINE channel secret
- `PORT`: default `3000`

## Prompt used

See: `src/prompt.ts`
