# local — a model running on this machine's own GPU, as a third provider

Servex already has two providers for the Claude Agent SDK: `anthropic` (the
owner's subscription) and `openrouter` (`../openrouter/`, a paid cloud
gateway to other companies' models). This is the third: `local`, a model
running on this machine's own GPU through `llama.cpp`, free and offline.
Same trick as OpenRouter — point the SDK's `ANTHROPIC_BASE_URL` at
something that speaks the Anthropic Messages API, and the exact same
`query()` loop runs a different model — verified live, 2026-10-01:
`llama-server.exe` really does answer a normal `POST /v1/messages` with a
normal Anthropic-shaped reply.

## Use

A `local/<slug>` model id picks this provider, the same way a `/` in an
OpenRouter slug does (`Servex/agents/Agents.js`'s `provider_of()` checks for
`local/` first, since it would otherwise match OpenRouter's own rule too):

```js
spawn_agent({ role: "minion", model: "local/qwen2.5-coder", prompt: "..." })
```

This needs `llama-server.exe` itself installed (a built llama.cpp release,
not just model files) at `LLAMA_HOME` (default `C:\llama`) — `provider.js`
only searches for model *files*; the exe has to already be there.

`slug` is one of `MODELS`' keys in [`provider.js`](./provider.js) — today
`qwen2.5-coder`, `gemma-3-4b`, `gemma-4-e4b` (whichever ones actually have a
file on disk; `available_models()` is the live list). Only one loads at a
time — this machine's GPU (an RTX 4070 Super, 12 GB VRAM) can't hold two —
so picking a different model stops the one running and starts the new one,
a few seconds' wait.

The chat page at [`/framework/ai/local/`](/framework/ai/local/) is the
easiest way to try this without writing any code.

## What's here

- [`provider.js`](./provider.js) — where the model files are (`MODELS`,
  found by searching the LM Studio install and the Hugging Face cache, not
  hardcoded paths that go stale), the idle-unload knob
  (`LLAMA_IDLE_MINUTES`), and `env_for("local")` — the env that points a
  spawned agent at Servex's own local proxy instead of Anthropic.
- [`llama.js`](./llama.js) — `Process.Llama` (starts, stops and swaps
  `llama-server.exe`, same supervision `Process.Whisper` in
  `Servex/Process.js` already uses, plus a `/health` poll before calling a
  model "ready" — see "Watch out" below) and `LocalProxy` (the one HTTP
  server every local-model request passes through: it reads which model the
  request wants from the request body, makes sure that one is loaded, then
  forwards).
- [`chat.js`](./chat.js) — `local_chat()`, a one-shot no-tools call (same
  shape as `Servex/agents/tidy.js`'s `tidy()`) that the chat page's
  `/api/local-chat` route runs.

## Watch out

- **The port answers long before the model is loaded.** A plain TCP connect
  succeeds in under a second; the model itself takes tens of seconds to
  actually load onto the GPU, and a request in that window gets a plain 503
  `{"error":{"message":"Loading model"}}`. `Process.Llama.wait_ready()`
  polls llama-server's own `GET /health` instead of just the port — see its
  comment for the measurement that found this.
- **`allowedTools` does not restrict what a model is OFFERED** — it only
  auto-approves. The SDK's `tools` option is the real restriction (see
  `h1-eval.mjs`, `public/framework/ai/2026-10-01/local-ai/build/`, for the
  measurement: a small model's whole context window can be blown by the
  grammar for tools it was never going to call — a 50-tool repo `.mcp.json`
  first, then the calling session's own ~30 built-in tools, both before the
  real task ever reached the model).
- **No spend guard here, on purpose** — unlike OpenRouter, there is nothing
  to meter: a local model is free and this machine's own GPU is the only
  limit, which `LLAMA_IDLE_MINUTES` (not a dollar cap) already manages.
- **The live, shared Servex only gets this once the branch is merged and
  restarted** — same as any other Servex change. Until then, a page that
  calls `/api/local-chat` gets a clean 404 (CORS-blocked in the browser's
  console, not a crash) — see `public/framework/ai/local/readme.md`.

## What it CAN do, not just what it can't

The h1-page test ladder (two models, both "no tool call at all") only shows the hard
end. Asked plainly, with no tools, `qwen2.5-coder` does fine on small no-tool jobs:
a one-sentence summary and a short plain list both came back correct, on-topic and
fast (2.7–6.7s). So the realistic lane for these models today is a no-tool task
(summarize, list, brainstorm) handed to them directly — not multi-step tool use.

## More

- Task that built this: `public/framework/ai/2026-10-01/local-ai/build/`
- The OpenRouter provider this one's shape is copied from: [`../openrouter/`](../openrouter/)
- Every model Servex has tried, local and cloud, side by side:
  [`/framework/ai/system/models/`](/framework/ai/system/models/)
