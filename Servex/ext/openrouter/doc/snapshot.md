# openrouter — the model snapshot (moved from the readme)

<!-- moved verbatim from readme.md lines 9-39, 2026-10-12 readme audit -->
## The six things worth knowing

1. **Proxy route** — point `ANTHROPIC_BASE_URL` at OpenRouter, give the agent an OpenRouter key
   instead of a Claude login, and the same Claude Agent SDK loop runs a non-Claude model.
   → [`snapshot.md`](./snapshot.md) (node `cjuqp`), `Servex/agents/Agents.js:514`
2. **Provider field, now live** — `tiers.js`'s `provider` field is read by `roles.js`'s `defaults()`
   and by `Agents.spawn()` (the slash rule on a bare `model` covers the rest), so moving a tier to
   `provider: "openrouter"` is the one-line switch that turns the proxy on for every role on it.
   → [`snapshot.md`](./snapshot.md) (node `cx5h6`), `Servex/agents/tiers.js:4`
3. **The real cost is already on the response — no second request needed** (fixed 2026-10-04,
   openrouter-cost-blind). The SDK's own cost guess is wrong (it prices a proxied turn off
   Anthropic's price table), but OpenRouter's `usage.cost` field is RIGHT, and arrives on the SAME
   response as the message itself — confirmed live against `POST /v1/messages`, with and without
   `usage: {include: true}` (a no-op here; this endpoint always includes it). `Agents.js`'s
   `price()` reads it the instant a message arrives. The OLDER plan — poll `/generation` by id, or
   diff the key's running total — is what actually went blind: live-tested the same day, a fresh
   id 404'd on `/generation` and the key-total diff still read $0 after 28 seconds. Both stay as a
   fallback (`meter()`/`real_turn_cost()` in `provider.js`) for the rare response with no `usage.cost`,
   and now log an `unpriced` line instead of going silent.
   → [`gaps.md`](./gaps.md) gap 2, `Servex/agents/openrouter-cost-blind-proof.mjs`
4. **Subscription boundary** — Claude itself stays on the subscription; paying per token for
   Claude through any gateway could cost far more for the same work.
   → [`snapshot.md`](./snapshot.md) (node `ca7gw`)
5. **Fence gap** — "don't edit outside your fence" is enforced only by skill prose today; a
   PreToolUse hook in `Agents.js` is the real fix, because agents run in `bypassPermissions`,
   which skips `canUseTool`.
   → [`snapshot.md`](./snapshot.md), `Servex/agents/tools.js`
6. **Cross-family review** — a reviewer from a different model family catches blind spots a
   same-model review misses; `Server/review.mjs --model` is where that plugs in.
   → [`snapshot.md`](./snapshot.md) (node `ad16o`)

