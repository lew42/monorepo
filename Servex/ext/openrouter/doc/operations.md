# openrouter — operations (moved from the readme)

<!-- moved verbatim from readme.md lines 48-140, 2026-10-12 readme audit -->
### Run the spike

One real `query()` turn (Read, Bash, Edit) and one resume turn, on 2–3 non-Claude models, measuring
whether it actually works and what it really costs:

```
node Servex/ext/openrouter/spike.mjs
```

Needs an OpenRouter key at `%LOCALAPPDATA%\lew42\servex\openrouter.key` (never in the repo) — with
no key it prints `no key at <path>` and exits 2, so it's safe to run before the key exists. Each
model is capped at about $0.25 by `maxTurns` plus a check between turns: there's no live cost
figure to abort a turn mid-stream on (real cost only settles after a turn ends), so if turn 1 alone
already blew the cap, the resume turn is skipped rather than spending more. Results land one JSON
line per model in
[`spike.jsonl`](/framework/ai/sessions/2026/10/01/openrouter-harness/openrouter-harness/spike.jsonl), with a short pass/fail
table on stdout. Pass your own model ids as arguments to try others than the three defaults.

### Spawn on OpenRouter

Any `spawn_agent` call whose `model` has a `/` in it (an OpenRouter slug) runs through OpenRouter
automatically — nothing else to say:

```js
spawn_agent({ role: "minion", name: "cheap-scan", prompt: "...",
  model: "deepseek/deepseek-v4.1-flash" })
```

(Same as passing `provider: "openrouter"` explicitly, which also works and is what you'd do if a
future OpenRouter model id ever stops having a `/` in it.) `Agents.spawn()` refuses the one
combination that would quietly bill the Claude subscription per token instead — `provider:
"openrouter"` with a `claude-*` model — with one clear line. The agent's real cost — OpenRouter's
own figure, not the SDK's wrong guess — lands on its `cost` field the same way a Claude agent's
does, a few seconds after each turn ends (never blocking the turn itself — see below). Missing key:
the spawn fails at start with `no OpenRouter key at <path>`, one line, nothing cryptic.

### Gemini needed one built-in tool turned off

Both `google/gemini-3.1-pro-preview` and `google/gemini-3.8-flash` 400'd before calling any
tool at all: Gemini's own function-calling validator demands every nested array carry its own
`items` schema, and the built-in `ArtifactData` tool's `query.where` (an array of
`[field, operator, value]` tuples) only declares `prefixItems` on the inner array, not `items`.
`ArtifactData` ships with the SDK itself, outside this folder's fence, so `provider.js` exports
`disallowed_tools_for(model)` — `["ArtifactData"]` for any `google/*` model, `[]` otherwise — and
both `spike.mjs` and `Agents.js` pass it as `disallowedTools`. Confirmed fixed by rerunning the
spike on both Gemini models.

### The spawn pause, and why a spawn can be "paused" with no owner action

`Agents.spawn()` refuses every OpenRouter spawn unless `SERVEX_OPENROUTER_PAUSED` is set to the
literal string `"0"` — unset (the default on every fresh boot) means paused. This exists because
of exactly the incident `openrouter-cost-blind` fixed (2026-10-04): a model ran 14 minutes with
Servex seeing $0 cost while OpenRouter's own bill rose $4.74. The pause is the fail-closed answer
to "can we trust what we'd charge this agent" — Echo.js's `model_for()` already kept echo replies
on Claude while paused; `Agents.spawn()` now refuses a real spawn too, with one clear line. Lifted
by setting `SERVEX_OPENROUTER_PAUSED=0` in the environment Servex boots with, once the pricing fix
below is proven (`Servex/agents/openrouter-cost-blind-proof.mjs`).

### The spend guard (the owner's $50 credit, Phase 2)

Three pieces, all in `provider.js` unless noted:
- **The pace** — the budget is weekly: `SERVEX_OR_MONTHLY_USD` (default $50) ÷ 4 = $12.50 a
  week, resetting Monday 00:00 UTC. `spend_guard()` refuses an openrouter spawn with one clear
  line once this week's spend (`usage_weekly`) is more than one day ahead of the clock (allowed =
  week × (elapsed + 1/7)), once today's spend reaches `SERVEX_OR_DAILY_CAP` (default half a week,
  $6.25), or once credit left (`limit_remaining`) drops under $1. `Agents.spawn()` calls it before creating the agent.
  It answers from a 30s cache — never a live network call on a spawn — and **fails closed**: no
  reading yet, or the last `/key` read failed, refuses too. `evaluate_guard(status, cap)` is the
  pure decision underneath it, tested directly in `provider.test.mjs` (no network needed).
- **The ledger** — once a turn's real cost settles, `Agents.js`'s `refresh_or_cost()` appends one
  line (`{at, agent, model, effort, turn, cost_usd, source}`) to the `openrouter` log, through the
  host's own `Log` — the same single-writer object every other agent event already goes through,
  so two agents settling a turn at once can never tear a line.
- **The dashboard** — the spend guard also writes `openrouter-usage.json` (next to `usage.json`),
  and `ext/AITask/dashboard.js`'s `rail()` merges its one `limit` into the SAME `usage_rail()`
  meter the Claude session/weekly windows already draw — one more bar, not a second widget.
  Credit left rides along as the meter's label.
- **Warm at boot, not on import** — the guard's cache starts empty, and an empty cache fails
  every openrouter spawn closed, so `Servex.js` calls `warm_guard()` once right after it builds
  `this.agents` — before anything could possibly spawn — so the very first spawn after a restart
  isn't refused for no real reason. `Agents.spawn()` itself stays synchronous (it has a dozen-plus
  non-`await`ed callers across the codebase; making it async is the kind of surgery CLAUDE.md says
  to ask about, not a one-line fix), so a spawn that still finds an empty cache — the key file
  missing, or the boot-time read itself failed — fails closed with a reason that says "retry in a
  few seconds", rather than waiting on a live read itself.

### Cost is per key, not per agent

`key_usage()` is OpenRouter's running total for the whole key. Two OpenRouter agents spending on
the same key at once can't be told apart by a before/after diff — `Agents.js`'s
`refresh_or_cost()` will attribute one agent's spend to the other. Fine while only one OpenRouter
agent runs at a time; a real fix needs a key per agent, or OpenRouter adding a per-request cost
figure.
