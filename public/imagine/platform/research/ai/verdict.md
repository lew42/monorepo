# AI (fal.ai) — verdict

## Recommendation for the MVP

Ship with **no AI at all** — every AI feature in the brief sits behind users/auth/community in the brief's own MVP sequence (§31), and a static human-written topic page plus a manual report queue proves the platform without a vendor key, a spend cap, or a moderation false-positive path to design. When AI does land: **fal.ai for image/video/3D/audio generation only**, **Cloudflare Workers AI for embeddings and text moderation** (same bill as the rest of the infra, free daily allowance), **the Anthropic API direct** for any topic/content text (Ask already talks to it — fal's `any-llm` is a needless OpenRouter hop). Never call fal from the browser, MCP included.

## §33 — Decision: where the fal.ai key lives

| | |
|---|---|
| **Problem** | fal.ai has no scoped/short-lived credential (MCP and REST both take the raw account key per request); a public generator with a client-held key is a free GPU for the internet. |
| **Options** | (a) key in browser JS; (b) key in a Worker secret behind `/api/generate`; (c) fal's own MCP wired into a browser client. |
| **Recommended** | (b) — Worker secret, session-authed same-origin endpoint, server-side per-user/day counter, response returns only the resulting CDN url. |
| **Why** | The key is unscoped and un-revocable-per-session — anyone holding it can spend the whole account. (a) and (c) both put that key in front of every viewer (view-source / devtools / MCP Authorization header). |
| **Advantages** | Standard Workers-proxy pattern, nothing novel to build; caps abuse spend before it happens, not after the invoice. |
| **Disadvantages** | Adds a stateful counter (Durable Object or KV) the static site didn't need before; one more thing to fail open/closed correctly. |
| **Security** | Key never leaves the Worker; browser never sees a fal-shaped credential, only site session auth. |
| **Cost** | Near-zero infra cost (KV/DO reads); the real cost risk is an uncapped counter, not the proxy itself. |
| **Scalability** | Fine at MVP scale; a DO-per-user counter is the same shape as the brief's DO-per-topic hypothesis, so it reuses architecture rather than adding a new one. |
| **Complexity** | Low — one Worker route, one counter, one fal call. |
| **Migration/reversibility** | Fully reversible — swapping fal for another vendor behind this same endpoint changes nothing on the browser side. |
| **Deliberately NOT doing yet** | Signed short-lived job tokens for multi-step client flows (submit-then-poll direct from browser) — start with the simplest proxy-and-wait shape; add token hand-off only if latency demands it. |

## Three numbers that matter

1. **fal.ai flagship image, 1024²**: FLUX.2 [pro] — $0.03/image. [fal.ai/models/fal-ai/flux-2-pro](https://fal.ai/models/fal-ai/flux-2-pro) — 2026-09-04
2. **fal.ai budget image, 1024²**: FLUX.1 [schnell] — $0.003/image, commercial rights included. [fal.ai/models/fal-ai/flux/schnell](https://fal.ai/models/fal-ai/flux/schnell) — 2026-09-04
3. **Perspective API is sunsetting**: free moderation API ends **2026-12-31**, quota requests stop being accepted Feb 2026. [perspectiveapi.com/faq](https://perspectiveapi.com/faq/) — 2026-09-04 — rules it out as a moderation dependency regardless of price.

Runners-up: Workers AI $0.011/1k neurons, 10k free/day ([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)); OpenAI moderation is **free**, text+image ([docs](https://developers.openai.com/api/docs/guides/moderation)).

## What to cut first if the MVP must shrink

1. **All of AI** (see recommendation above) — cut whole, not thinned.
2. If one piece survives: **topic dedupe embeddings** (Workers AI bge-small, ~$0.002/10k topics, inside the free tier) — cheapest, lowest-risk, no key-handling surface since it can run from a Worker with no user-facing spend cap needed.
3. Cut **AI-drafted wiki text** last of all if any AI ships — plagiarism/hallucination risk has no vendor mitigation, only a human-review gate (see log, `question` entries).

Full evidence: [`log.jsonl`](./log.jsonl) — 46 entries, established/contested/fringe/speculation.
