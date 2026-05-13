# parnuan-bot-sample

TypeScript LINE bot sample that calls an OpenRouter-compatible local FastAPI/vLLM endpoint for expense categorization.

The sample uses `@openrouter/sdk`, streams responses, injects the categorization system prompt, and prints timing metrics, token counts, and cost estimates.

## Local CLI smoke test

### 1. Start `fastapi-vllm`

```bash
cd ../fastapi-vllm
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Run the bot sample in CLI mode

```bash
cd parnuan-bot-sample
npm install
OPENROUTER_API_KEY=local-dev-key \
OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 \
npm run classify -- "electricity 200"
```

### Expected output

```text
input=electricity 200
e|Others
--- result ---
category=e|Others
prompt_tokens=285
completion_tokens=2
total_tokens=287
cost_usd=0.00001524

--- timings ---
first_token_ms=55
total_ms=58
```

### Example test cases

```bash
OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "taxi 80"
# -> e|Transport

OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "salary 5000"
# -> i|Salary

OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "Fortune Telling Business 300"
# -> i|Business

OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "Book"
# -> e|Shopping

OPENROUTER_API_KEY=local-dev-key OPENROUTER_BASE_URL=http://127.0.0.1:8000/v1 npm run classify -- "Fortune Telling"
# -> e|Others
```

### Pricing

The CLI shows estimated cost per query using OpenRouter pricing for `meta-llama/llama-3.2-3b-instruct`:

- **Input**: $0.051 per 1M tokens
- **Output**: $0.34 per 1M tokens

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
