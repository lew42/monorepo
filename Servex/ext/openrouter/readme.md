# OpenRouter — the harness's second backend

Servex spawns agents through the Claude Agent SDK today. OpenRouter lets a non-Claude model
(GPT, Gemini, Grok) join that same loop, so we don't have to build our own agent loop to try one.

This folder is what a fresh "openrouter" mastermind reads to pick up the whole story: what's
decided, what's still open, and where every claim comes from.

## The six things worth knowing

1. **Proxy route** — point `ANTHROPIC_BASE_URL` at OpenRouter, give the agent an OpenRouter key
   instead of a Claude login, and the same Claude Agent SDK loop runs a non-Claude model.
   → [`snapshot.md`](./snapshot.md) (node `cjuqp`), `Servex/agents/Agents.js:514`
2. **Provider field, now live** — `tiers.js`'s `provider` field is read by `roles.js`'s `defaults()`
   and by `Agents.spawn()` (the slash rule on a bare `model` covers the rest), so moving a tier to
   `provider: "openrouter"` is the one-line switch that turns the proxy on for every role on it.
   → [`snapshot.md`](./snapshot.md) (node `cx5h6`), `Servex/agents/tiers.js:4`
3. **Proxied cost takes a few seconds, not free** — the SDK's own cost guess is wrong (it prices a
   proxied turn off Anthropic's price table), and OpenRouter's own real dollar figure does not
   arrive instantly either: billing settles a few seconds after a turn ends, and the per-generation
   lookup can be exact when the SDK's message id matches (confirmed on gemini-3.8-flash) or needs a
   before/after key-total diff when it doesn't. `real_turn_cost()` in `provider.js` tries both,
   polling for it rather than reading once.
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

**What breaks per provider or model** (what fails, why, the workaround, the evidence) is in
[`gaps.md`](./gaps.md). Every workaround applies only to agents on the OpenRouter path.

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
model is capped at about $0.25 by `maxTurns` plus a check between turns: there's no live cost
figure to abort a turn mid-stream on (real cost only settles after a turn ends), so if turn 1 alone
already blew the cap, the resume turn is skipped rather than spending more. Results land one JSON
line per model in
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

### The spend guard (the owner's $50 credit, Phase 2)

Three pieces, all in `provider.js` unless noted:
- **The cap** — `spend_guard()` refuses an openrouter spawn with one clear line once today's
  OpenRouter spend (`usage_daily`) is at or over `SERVEX_OR_DAILY_CAP` (default $8), or credit
  left (`limit_remaining`) drops under $1. `Agents.spawn()` calls it before creating the agent.
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

### Rule tests — can a cheap model follow our own instructions?

Five small tests, each with exactly one right answer a script checks (never a judge's opinion):
reading CLAUDE.md, following the readme chain, calling our tools, appending the house way
(through `append.mjs`, not a shell write), and staying inside a fence even when the brief itself
tempts it to stray. One real Servex agent is spawned per model × effort × test, in a fresh temp
task dir under `rule-tests/runs/`.

```
node Servex/ext/openrouter/evals/rules.mjs --models claude-haiku-4-5-20251001,deepseek/deepseek-v4.1-flash --effort low,high
```

Default (no flags): one model, `claude-haiku-4-5-20251001`, at `low` effort — the safe dry run
before an OpenRouter model is allowed to spend anything. All five pass on it today. Results land
as one `{"probe":{...}}` line per run in
[`evals/results.jsonl`](./evals/results.jsonl) — the same file and shape
mastermind-servex-9's probe runner uses (`public/framework/ai/2026-09-30/probe-tasks/probes.md`),
so a rule test and an open-ended probe sit in one shared table instead of two parallel ones.

## What's here

- [`provider.js`](./provider.js) — `env_for(provider)` (the four env vars; throws if the key file
  is missing), `provider_for(model)` (the slash rule), `disallowed_tools_for(model)` (the Gemini
  tool-schema fix, below), and `real_turn_cost()` (the honest per-turn dollar figure, polled).
- [`spike.mjs`](./spike.mjs) — the spike script, above.
- [`provider.test.mjs`](./provider.test.mjs) — runs with no key, no network, no cost:
  `node Servex/ext/openrouter/provider.test.mjs`.
- [`evals/rules.mjs`](./evals/rules.mjs) — the rule tests, above, and the shared `mcp()`/append/
  timestamp helpers `evals/probes.mjs` imports rather than duplicating. Results in
  [`evals/results.jsonl`](./evals/results.jsonl).
- [`snapshot.md`](./snapshot.md) — the condensed state a fresh mastermind starts from: one line
  per conclusion, each with a credence and a cited source.
- [`sources/`](./sources/readme.md) — an index into the one source library
  (`public/framework/sources/`) for the sources this research actually leans on.
- [`decisions/`](./decisions/readme.md) — empty for now; the decide-tool task fills it in as the
  harness gets built.

## Probe tasks — is a failure the system, the model, or the config?

[`evals/probes.mjs`](./evals/probes.mjs) gives a fresh agent a tiny, rough, open-ended job ("make
a new page here: a short blog post about owls") in a throwaway worktree, scores the result on six
fixed checks (parses, loads with no console errors, followed the prompt, used the right skills,
opened/logged/landed a task, linked from its parent), and labels every failing cell **(a)** the
system, **(b)** that model, or **(c)** config/parity. The design is
[`probes.md`](/framework/ai/2026-09-30/probe-tasks/probes.md) and
[`probes.json`](/framework/ai/2026-09-30/probe-tasks/probes.json); each run appends one line to
[`evals/results.jsonl`](./evals/results.jsonl), which is the model × task matrix (requirements.md
Phase 2, item 4) filling itself in.

```
node Servex/ext/openrouter/evals/probes.mjs --models claude-haiku-4-5-20251001 --probes page-blog,log-line [--effort low] [--topic owls] [--dry-run]
node Servex/ext/openrouter/evals/probes.mjs --selftest   # proves the checks can actually fail
```

**First real result (claude-haiku-4-5-20251001, the control, effort low):** `page-blog` passed
only check 1 (parses); `log-line` passed none of its one check. Haiku wrote good, on-topic
content both times, but no `skill:` line and no `task.jsonl` under `public/framework/ai/<date>/`
ever showed up — and for `page-blog` it overwrote the scratch directory's own seeded page instead
of adding a child page and linking it.

**This result is unlabelled on purpose, and not yet trustworthy as a verdict** (review finding
2026-09-30, #4/#6): because it's the control's own baseline there's no prior control row to label
against, which is the right call per `probes.md`'s rule — but there's a second open question
nobody has checked yet: does the Skill hook even fire for an agent spawned the way a probe spawns
it (no `task:` option, `cwd` inside a pool worktree)? If the hook path itself never reaches the
agent, "no `skill:` line" is a **(c)** config/parity problem, not evidence the model skipped the
steps. Until that's checked, read "skipped the task system" above as a description of what
happened, not a diagnosis of why. Also: **(a)** here means only "the control fails this same
cell too" — not "every model fails it" — so one (a) label is a hint, not a unanimous verdict.

Still open: whether the Skill-hook-reaches-the-agent question above resolves this to (c); whether
this is a low-`effort` problem specifically (worth its own data point); and the three probes
probes.json lists but this run never reached (`demo-add`, `css-tweak`, `doc-fix`).

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
