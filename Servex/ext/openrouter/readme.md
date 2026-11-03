# OpenRouter — the harness's second backend

Servex spawns agents through the Claude Agent SDK today. OpenRouter lets a non-Claude model
(GPT, Gemini, Grok) join that same loop, so we don't have to build our own agent loop to try one.

This folder is what a fresh "openrouter" mastermind reads to pick up the whole story: what's
decided, what's still open, and where every claim comes from.

- Moved verbatim to [doc/snapshot.md](./doc/snapshot.md): the model snapshot.
**What breaks per provider or model** (what fails, why, the workaround, the evidence) is in
[`gaps.md`](./gaps.md). Every workaround applies only to agents on the OpenRouter path.

## It's wired up now

`provider.js`, `spike.mjs` and the `provider` field on every spawn are built — this is no longer
just research. The two things you'll actually do with it:

- Moved verbatim to [doc/operations.md](./doc/operations.md): operations.

- Moved verbatim to [doc/tests.md](./doc/tests.md): rule tests and the test library.
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
- [`evals/library.mjs`](./evals/library.mjs) — the test library runner, above. The tests
  themselves live as pages at [`/framework/ai/tests/`](/framework/ai/tests/), not under `evals/`
  anymore (Amendment 5); routing table at [`evals/routing.json`](./evals/routing.json).
- [`evals/models.mjs`](./evals/models.mjs) and [`evals/catalog.mjs`](./evals/catalog.mjs) — both
  write [`/framework/ai/system/models/models.json`](/framework/ai/system/models/models.json), the
  Models tab's one data file (law 6: one file, two generators). `models.mjs` is "which model is
  best value, for which kind of task" (the `kinds`/`ladder` keys); `catalog.mjs` is "one row per
  model we use or tested" (the `catalog` key: provider, context, price incl. a cached read, our own
  test scores) — each only ever touches its own keys. Re-run either after its own source changes.
- [`evals/quick.mjs`](./evals/quick.mjs) — known-answer tests: 8 tiny tasks a script checks, per model x thinking level, with OpenRouter's own cost (about 3 cents a full run). Results in `quick-results.jsonl`; `--table` publishes them to the Models tab. `Server/openrouter-gap.mjs --publish` does the same for the account-vs-ledger numbers.
- [`evals/websearch.mjs`](./evals/websearch.mjs) — does WebSearch/WebFetch on a proxied minion
  ever reach Anthropic, and who pays for WebFetch's own summary call. [`gaps.md`](./gaps.md)
  has the answer.
- [`evals/ui-fouls.mjs`](./evals/ui-fouls.mjs) — the vision rung: three tiny fixture pages, each
  with one planted design foul, shown to a model via its own Read tool. Results in
  [`evals/ui-fouls/ui-fouls-results.jsonl`](./evals/ui-fouls/ui-fouls-results.jsonl).
- [`evals/keys.mjs`](./evals/keys.mjs) — Phase 17, "keys to success": a model reads one of the
  owner's own past prompts (`test-library/keys-prompts.jsonl`, 10 picked for mixed length with no
  personal details) and lists the primary statements, to-dos and decisions a good answer has to
  cover; several models do the same prompt, a judge merges keys that mean the same thing, and
  each model is scored for recall (found the heavy keys?) and precision (invented any nobody else
  saw?). Results live as pages at [`/framework/ai/tests/keys-to-success/`](/framework/ai/tests/keys-to-success/).
  `--models a,b [--effort medium] [--only id]` extracts; `--judge` merges and scores.
- [`snapshot.md`](./snapshot.md) — the condensed state a fresh mastermind starts from: one line
  per conclusion, each with a credence and a cited source.
- [`sources/`](./sources/readme.md) — an index into the one source library
  (`public/framework/sources/`) for the sources this research actually leans on.
- [`decisions/`](./decisions/readme.md) — empty for now; the decide-tool task fills it in as the
  harness gets built.

- Moved verbatim to [doc/probe-tasks.md](./doc/probe-tasks.md): probe tasks.
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

## The wall switch (Claude tokens vs OpenRouter)

- **Default:** every agent, the Echo and the voice pair run on Claude (fast = Haiku 5.5, smart = Sonnet 5.5); OpenRouter costs nothing because nothing uses it.
- **When to flip:** when the Claude week or 5 h window hits its wall (`public/framework/ai/usage.json`; both percentages sit at the top of [/framework/ai/models](/framework/ai/models)).
- **How:** `node Server/ModelsNow.mjs --backend openrouter` (writes `session-backend.txt`; no restart needed, the file is read on each use). Back: `--backend anthropic`.
- **What it moves (2026-10-25):** only the voice seats and Refine/clean calls (`Sessions.session_backend()`, `RefineCall.model()`) go to `openai/gpt-6-luna`. Other agents stay on Claude; the old switch that moved every tier (`OR_ONLY` in `tiers.js`) is gone. To put one agent on OpenRouter, spawn it with a `/` model or `provider: "openrouter"`; that request is the consent. Spend is metered per call into `logs/openrouter.jsonl` and capped by the spend guard (weekly cap in `openrouter-usage.json`). `SERVEX_OPENROUTER_PAUSED=1` blocks OpenRouter spawns (off by default).
- **Refresh the table:** `node Server/ModelsNow.mjs --write`.
