# Provider gaps: what breaks when a model runs through OpenRouter

Each gap below says what fails, why it fails, how we work around it, and where the evidence is.
Every workaround applies to OpenRouter agents only (`provider === "openrouter"`). Claude agents,
meaning the masterminds, the assistants and Claude minions, see exactly the tools and settings
they always had.

| # | Gap | Models | Workaround | Status |
|---|---|---|---|---|
| 1 | Gemini refuses one built-in tool's schema | `google/*` | that tool is turned off for Gemini only | worked around |
| 2 | The SDK's own cost figure is wrong | all | read `usage.cost` off the response itself | worked around (fixed 2026-10-04) |
| 3 | `/generation` and the key-total diff can both go unresolved indefinitely | all | no longer needed for the live price — `usage.cost` is instant; they stay only as a rare fallback, and now log instead of going silent | fixed 2026-10-04 |
| 4 | Gemini 3.8 Flash stalled on the append test | — | it was our test's bug, now fixed | not a gap |
| 5 | Long sessions: compaction through the proxy | all | none | untested |
| 6 | Does `effort` reach a non-Claude model? | all | none | untested |
| 7 | Web search on an OpenRouter model | tested: deepseek, gpt-6-luna | none needed | works; exact cost being checked |
| 8 | A real agent's `usage.cost` is still blind on tiny calls | tested: gpt-6-luna | none yet; `/generation` and the key-diff fallback are both too slow for cent-fractions | open — see below |

## 8. The 2026-10-04 cost fix doesn't reach a real agent's `usage.cost`, and `/generation`/key-diff are too slow for a tiny call

- **What fails:** `dictate-without-claude` (2026-10-04) spawned real `session-fast`/`session-smart`
  agents on `openai/gpt-6-luna` through `Agents.js` and never saw a nonzero `spent_usd()` — every
  call landed in `Agent.metered` as a `0` placeholder, meaning `message_cost(usage)` found no
  `usage.cost` on the message the Claude Agent SDK actually handed `assistant()`.
- **Why, as far as checked:** a raw `fetch` straight to OpenRouter's own `/v1/messages` (the exact
  endpoint `env_for("openrouter")` points the SDK at) DOES return `usage.cost` (confirmed live,
  $0.0000038-$0.0000107 a call) — so the field is on the wire. The SDK's own typed message object
  apparently drops it before `assistant()` ever sees it (the Anthropic API has no such field, so
  the SDK's own `Usage` type likely doesn't carry an unknown one through). Not fully traced inside
  the SDK's bundled `sdk.mjs`/`extractFromBunfs` — that's the next step, not done here.
- **The fallback also failed, for a reason this gap didn't have before:** `/generation` never
  resolved for any of 6 ids (same shape as gap #2-3), AND a before/after `key_usage()` diff, given
  a full 15-20s, also read exactly 0 for a call independently confirmed to cost $0.0000107 — the
  key's own `/key` total looks like it doesn't reflect a single cent-fraction call within the
  window this codebase has tried so far (maybe longer, maybe batched; not measured past 20s).
- **Impact:** real-time per-call pricing is unreliable for cheap small models specifically — the
  exact ones this task's `FALLBACK_MODEL` choice depends on. The spend GUARD still works (it reads
  the key's weekly/daily totals on its own 30s timer, which do catch up eventually), so nothing
  overspends; only the live per-agent `$` figure a dashboard would show is wrong (reads as $0).
- **Workaround used here:** `dictate-without-claude`'s own proof
  ([`ai/2026-10-04/dictate-without-claude/prove.mjs`](/framework/ai/2026-10-04/dictate-without-claude/))
  reports the already-measured real cost from the new-brain eval instead of a live reading.
- **Not fixed here:** scoped to `dictate-without-claude`'s own task (a dollar figure for its proof),
  not the live metering gap itself — that needs tracing the SDK's own message parsing, which is
  this gap's own future task.

## 1. Gemini refuses the ArtifactData tool's schema

- **What fails:** every Gemini turn ends before it starts, with a 400 error
  (`tools[..].items.items` missing).
- **Why:** the Claude CLI's built-in `ArtifactData` tool describes one array with `prefixItems`
  and no `items`. Gemini's API requires `items` on every array. Anthropic and OpenAI accept it.
- **Workaround:** `disallowed_tools_for()` in [`provider.js`](./provider.js) returns
  `["ArtifactData"]` for `google/*` models. `Agents.js` `options()` adds it only when
  `this.provider === "openrouter"`. Gemini agents lose ArtifactData, which our minions don't use.
- **Evidence:** the spike: 0 tools before the fix, 3 tools plus edit plus resume after
  ([`spike.jsonl`](../../../public/framework/ai/2026-09-30/openrouter-harness/spike.jsonl)).

## 2 and 3. The SDK's `total_cost_usd` is wrong, and the old fallback could go blind forever

- **What fails:** the SDK prices every token at Anthropic's rates, whatever model actually ran —
  so `message.total_cost_usd` is simply wrong for a proxied turn.
- **The OLD workaround, and how it actually failed (openrouter-cost-blind, 2026-10-04):**
  `Agents.js`'s `meter()` polled `GET /api/v1/generation?id=` up to 6 times, 2.5s apart, and every
  failed try was silently swallowed (`.catch(() => null)`) — a call that never resolved was priced
  at exactly $0, forever, with no trace. This is not hypothetical: a Gemini mastermind ran 14
  minutes this way, Servex logged $0 cost, and OpenRouter's own bill rose $4.74 in the same window.
  Live-tested the same day: a fresh call's `/generation` id 404'd outright, and the fallback
  (diffing the key's own running total before/after) still read $0 twenty-eight seconds later —
  both paths can go unresolved far longer than 15 seconds.
- **The fix:** OpenRouter's own response — the SAME message the SDK already receives — carries
  the real price on its own `usage.cost` field, confirmed live against `POST /v1/messages`, no
  extra request, no settling delay. `Agents.js`'s `price()` reads it the instant the message
  arrives. `/generation` and the key-total diff stay only as a fallback for a response with no
  `usage.cost` (not observed yet), and that fallback now logs an `unpriced` spend-gate line instead
  of going silent — 3 unpriced calls in one agent gates it, the same as going over budget.
- **Evidence:** `Servex/agents/openrouter-cost-blind-proof.mjs` (no network, proves the code);
  the live cross-check (3 real calls, `usage.cost` present and correct every time; one `/generation`
  404; one key-diff stuck at $0 after 28s) is logged in
  [`2026-10-04/openrouter-cost-blind/task.jsonl`](../../../public/framework/ai/2026-10-04/openrouter-cost-blind/task.jsonl).

## 4. Not a gap: the Gemini 3.8 Flash stall

- The `rule-append` test asked for a line with a key that task.jsonl's schema doesn't allow, so
  `append.mjs` refused it for every model. Gemini ran the right command, was refused, and spent
  its 3-minute turn working out why. After the test was fixed in `rules.mjs`, all 7
  model × effort combinations passed 5 of 5.

## 5 and 6. Untested

- **Compaction:** no proxied session has run long enough to compact, so we don't know whether the
  summary call works through OpenRouter.
- **Effort:** we pass `effort` and the low and high runs cost differently, but we haven't checked
  that OpenRouter maps it to each model's own reasoning setting.

## 7. Web search works on OpenRouter models; its exact cost is being checked

- **What was checked:** whether WebSearch and WebFetch on an OpenRouter model ever reach
  Anthropic. That includes WebFetch's summary step, which the Claude CLI normally hands to a
  small Claude model.
- **How:** [`evals/websearch.mjs`](./evals/websearch.mjs) ran one turn each on deepseek-v4.1-flash
  and gpt-6-luna with every Anthropic credential removed: the API key and login token blanked,
  and the CLI's config folder pointed at an empty one, so it had no stored login either.
- **Result:** both searched and fetched without error, so nothing reached Anthropic: there was no
  login that could have been billed.
- **Not settled yet: the cost.** The turn listed 2 generations, $0.0067 (deepseek) and $0.0024
  (gpt-6-luna). But the search and the summary are separate requests that a turn's message list
  may not include. The check compares the key's total spend before and after, against those
  listed generations.
- **Evidence:** [`web-search/websearch.jsonl`](../../../public/framework/ai/2026-09-30/openrouter-harness/web-search/websearch.jsonl).
