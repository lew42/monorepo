# OpenRouter — the harness's second backend

Servex spawns agents through the Claude Agent SDK today. OpenRouter lets a non-Claude model
(GPT, Gemini, Grok) join that same loop, so we don't have to build our own agent loop to try one.

This folder is what a fresh "openrouter" mastermind reads to pick up the whole story: what's
decided, what's still open, and where every claim comes from.

## The six things worth knowing

1. **Proxy route** — point `ANTHROPIC_BASE_URL` at OpenRouter, give the agent an OpenRouter key
   instead of a Claude login, and the same Claude Agent SDK loop runs a non-Claude model.
   → [`snapshot.md`](./snapshot.md) (node `cjuqp`), `Servex/agents/Agents.js:514`
2. **Provider field** — `tiers.js` already has a `provider` field nothing reads yet; wiring it up
   is the one-line switch that turns the proxy on per tier.
   → [`snapshot.md`](./snapshot.md) (node `cx5h6`), `Servex/agents/tiers.js:4`
3. **Proxied cost arrives free** — OpenRouter puts the real dollar cost on every reply; the SDK's
   own guess is wrong, because it prices a proxied turn off Anthropic's price table.
   → [`snapshot.md`](./snapshot.md)
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

## It's wired up now

`provider.js`, `spike.mjs` and the `provider` field on every spawn are built — this is no longer
just research. The two things you'll actually do with it:

### Run the spike

One real `query()` turn (Read, Bash, Edit) and one resume turn, on 2–3 non-Claude models, measuring
whether it actually works and what it really costs:

```
node Servex/ext/openrouter/spike.mjs
```

Needs an OpenRouter key at `%LOCALAPPDATA%\lew42\servex\openrouter.key` (never in the repo) — with
no key it prints `no key at <path>` and exits 2, so it's safe to run before the key exists. Each
model is capped at about $0.25. Results land one JSON line per model in
[`spike.jsonl`](/framework/ai/2026-09-30/openrouter-harness/spike.jsonl), with a short pass/fail
table on stdout. Pass your own model ids as arguments to try others than the three defaults.

### Spawn on OpenRouter

Any `spawn_agent` call whose `model` has a `/` in it (an OpenRouter slug) runs through OpenRouter
automatically — nothing else to say:

```js
spawn_agent({ role: "minion", name: "cheap-scan", prompt: "...",
  model: "deepseek/deepseek-v4.1-flash" })
```

(Same as passing `provider: "openrouter"` explicitly, which also works and is what you'd do if a
future OpenRouter model id ever stops having a `/` in it.) The agent's real cost — OpenRouter's own
running total for the key, not the SDK's wrong guess — lands on its `cost` field the same way a
Claude agent's does. Missing key: the spawn fails at start with `no OpenRouter key at <path>`, one
line, nothing cryptic.

## What's here

- [`provider.js`](./provider.js) — `env_for(provider)` (the four env vars; throws if the key file
  is missing), `provider_for(model)` (the slash rule), and the real-cost lookups.
- [`spike.mjs`](./spike.mjs) — the spike script, above.
- [`provider.test.mjs`](./provider.test.mjs) — runs with no key, no network, no cost:
  `node Servex/ext/openrouter/provider.test.mjs`.
- [`snapshot.md`](./snapshot.md) — the condensed state a fresh mastermind starts from: one line
  per conclusion, each with a credence and a cited source.
- [`sources/`](./sources/readme.md) — an index into the one source library
  (`public/framework/sources/`) for the sources this research actually leans on.
- [`decisions/`](./decisions/readme.md) — empty for now; the decide-tool task fills it in as the
  harness gets built.

## Open questions, ranked

1. Is there an OpenRouter-side equivalent to automatic compaction plus CLAUDE.md re-injection, or
   do we have to build a summarizer ourselves? (`q1yg2`)
2. Does the OpenRouter agent package give a long-lived session with resume, fork and per-turn
   cost — the four things `query()` gives free today — or does all of that need rebuilding?
   (`q19wc`)
3. Does a non-Claude model actually finish a real brief through the proxy at a quality we'd
   merge? One measured run per model answers this — `spike.mjs`'s own output is the first data
   point; `spike.jsonl` has the detail.
4. Does mixed-family review catch more real defects than a fresh same-model review, on our own
   tasks — not just published benchmarks? (`qaoza`)
5. Is a real path allowlist (a PreToolUse hook) worth building, or does worktree isolation
   already cover the actual risk seen so far? (`q5m7h`)
