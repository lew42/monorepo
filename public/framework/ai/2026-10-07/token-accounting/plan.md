# Token accounting — plan

Prioritized by mistakes-per-line-of-effort: the biggest, cheapest wins first. Details and
proof for every claim below are in `findings.md`.

## Already done, this task

1. **Fixed:** `find_transcript()`'s case-sensitive folder match — the real cause of most
   of the undercounting. One line, `Server/session-cost.mjs`, committed.
2. **Found, written up, not fixed:** the OpenRouter stale-cost race in `Agents.js`'s
   `result()` (item 3 below owns the real fix).

## 1. Fix the OpenRouter stale-cost race — Sonnet, ~1 hour, worktree + smoke test

`Agents.js`'s `result()` logs `this.cost` immediately after kicking off
`refresh_or_cost()` (async, unawaited) — so an OpenRouter agent's own last-priced turn
never lands in its permanent log (findings.md, finding 2). Fix: either (a) `await
this.refresh_or_cost()` before the `this.emit({ type: "result", ... })` call — needs
checking that nothing downstream assumes `result()` returns synchronously — or (b), lower
risk, leave `result()` untouched and have `refresh_or_cost()` itself append a small
correction line (`{"type":"cost-correction","cost":...}`) once the real price lands,
which `task-cost.mjs`/`spend-tree.mjs` learn to prefer over the stale `result` line's
`cost` for that same turn. Option (b) touches nothing synchronous and is the safer first
try. Needs its own real-agent proof (spawn a cheap OpenRouter agent, 2 turns, check the
correction line lands and the total matches `openrouter.jsonl`).

**Owner decision (2026-10-08): Claude and OpenRouter are separate accounting systems —
this item stays entirely inside the OpenRouter path.** The correction line in (b) is an
`openrouter`-only line shape, keyed to OpenRouter's own `/generation` truth; it never
touches `cost_of_transcript()`'s Claude-side `usd_breakdown`, and `task-cost.mjs`/
`spend-tree.mjs` must keep reading the two as separate fields (`own_claude_usd` /
`own_or_usd`, already the case today) rather than folding this fix into one shared
"turn cost" value. No change needed to the fix itself — this just rules out ever
merging its output into the Claude total.

## 2. Re-run `spend-tree.mjs`/`week-cost.mjs` and refresh the live snapshots — Sonnet, 15 min

Both are "run by hand, refresh when needed" scripts (documented, not a gap). Now that
`find_transcript()` actually finds 488 more real transcripts, every number they produce
is bigger and more honest — but nobody has re-run them since the fix. Cheap, immediate,
real value: `node Server/spend-tree.mjs` then `node Server/week-cost.mjs`, read the new
totals, and if the new weekly figure materially changes "how much is left", say so on
this task's card plainly (CLAUDE.md law 5 — don't let a number only a script knows sit
unread).

## 3. Investigate finding 1's reversed gap (this task's own session) — Sonnet, 30 min

`reconcile.mjs`'s session 1 showed the ledger reading HIGHER than the transcript, the
opposite direction from every other case checked. Re-run `reconcile.mjs` after this task
lands and its own session has a closed, final transcript (not still-growing); if the gap
persists, read `agent-task-mastermind-token-accounting.jsonl`'s own `result`/`compact`
lines by hand for a banking-logic mistake (`agentLogSteps()`'s "a cost that drops means a
restart, bank it" rule, misapplied across a compaction). Small, bounded, no production
risk — pure read.

## 4. The `sessions/` grid: accurate per-session $, Claude vs OpenRouter labels — Sonnet, half a day

The owner's ask: "Claude sessions read `Claude $total`; OpenRouter sessions just
`$total`." Today's grid (`ai/sessions/page.js`) already has the data plumbing
(`cost_of_transcript`'s `usd_breakdown`, `or_log_usd`-shaped reads) — this is mostly a
labeling + wiring pass, not new computation:
- Every row's cost badge becomes `Claude $<n>` or `$<n>` (OpenRouter), never a bare `$`.
- A session with sub-agents shows its OWN $ and its SUBTREE $ as two numbers, not one —
  `spend-tree.json` already computes both; the grid just isn't showing the subtree figure
  today.
- Needs: `spend-tree.json` regenerated (item 2) so the grid's numbers are current:
  wire the grid to read it fresh, not a stale snapshot, the same "run it, don't recall it"
  rule the rest of this system already follows.

**Owner decision (2026-10-08): two columns/sections, not one.** `Claude $<n>` and
`$<n>` (OpenRouter) are two separate cells on a row (a row with both shows both,
never one summed figure), and the SUBTREE figure above is really two subtree figures
— `subtree_claude_usd` and `subtree_or_usd`, shown side by side — because a subtree
can mix Claude and OpenRouter descendants. `spend-tree.json` already keeps these as
separate fields (no change needed there); the grid work is making sure the UI never
collapses them into one number. **Alternative considered and rejected:** a single
"Cost" column holding whichever of the two a row has, with a small tag (`[OR]`)
when it's OpenRouter — rejected because the owner explicitly ruled out a shared
column/schema for the two systems: a reader must never have to infer which pricing
model produced a number from a tag, and a PARENT row with children of both kinds
would have nowhere to put two numbers in one cell.

## 5. Per-session cost breakdown view (message/tool/model/cache) — Sonnet, half a day

`cost_of_transcript()` and `trace_of_transcript()` (`Server/session-cost.mjs`) already
compute everything the owner asked for: per-prompt $, per-tool-call trace, $-by-token-kind
split. The session detail page (`ai/sessions/<id>/`) already shows some of this
(`session-trace`, `token-accounting` 2026-10-04 entries). What's missing, per the owner's
exact words ("grouped by role, maybe even per prompt type"): a role/trigger grouping on
ONE session's own calls, not just the all-time `spend-tree.json` rollup. Small addition:
tag each `by_prompt` group with whichever tool names dominated it (already have
`trace_of_transcript`'s per-call data) and group by that tag client-side — no new
computation, a new view of data already gathered.

**Owner decision (2026-10-08): this breakdown view is Claude-only; OpenRouter gets its
own, separate breakdown, never merged into the same table.** A Claude session's
breakdown is `cost_of_transcript()`'s token-kind split (input/output/cache_read/
cache_write, each priced at the model's own per-token rate) — unchanged, above. An
OpenRouter session's breakdown is a DIFFERENT shape entirely: one row per `/generation`
call, each already priced by OpenRouter itself (`openrouter.jsonl`'s own `cost_usd`,
real billed money, not a token-rate computation) — there is no "cache_read tokens" or
per-model rate to show for it, because that isn't how OpenRouter prices a call.
**Alternative considered and rejected:** one shared breakdown table with a `cache_read`
column that reads `—`/null for every OpenRouter row — rejected as exactly the "mixed
schema" the owner ruled out; it would also mislead a reader into thinking OpenRouter
calls don't use caching (they might; OpenRouter just never reports it the same way).
Build two small, separately-labelled sections instead, one per source, each only ever
showing the fields that source actually has.

## 6. "Realtime, never stale" for the Sessions tab — Sonnet, investigate first, ~1 hour

The owner wants no stale data. Today every number here is "run a script by hand, refresh
the page." The real blocker (already named in `decisions.md`, "why a script not a live
route" and repeated 2026-10-03): no `GET /api/sessions`-shaped route exists, because
every past task building this page had a fence that excluded `Server/run.js`/`Server.js`.
This plan item is simply: the next agent that DOES have that fence open should build the
route (poll the registry + tail the newest few transcripts on demand) so the grid can
poll it the way `GET /api/agents` already works for live Servex rows. Not small — flagged
as the one piece of "bulletproof realtime" that needs its own task with the right fence,
not squeezed into this one.

## 7. Go realtime: `session.jsonl`, streamed, replacing the stale snapshots — Sonnet, staged (see below), do step 1 first and prove it before touching the browser

Full writeup, recommendation and tradeoff: [`ai/sessions/doc/realtime-plan.md`](/framework/ai/sessions/doc/realtime-plan.md).
One-line version: extend the site's EXISTING jsonl-over-websocket stream
(`JSONL.live()`/`dev/Socket`) — this page has never actually used it, so this is adoption,
not a second system. Staged:
1. **Servex rows first.** `Agents.js` already sees every SDK message live; add one
   `append_log`-shaped write per message/turn to a new `<session page dir>/session.jsonl`.
   Prove it on one real agent before anything else changes.
2. **VS Code/CLI rows:** point the existing Stop hook (`session-cost.mjs --append-stdin`)
   at the same `session.jsonl` shape, once per turn (its real ceiling — no sub-turn
   signal exists outside the live process for this kind).
3. **The grid subscribes live** to each open session's `session.jsonl` instead of
   polling `sessions.json`/`spend-tree.json` — those two stay as the all-history rollup
   (one request, not worth streaming), the per-open-session view goes live.
4. **Retire the polling once (3) is trusted** — side-by-side, not a flag day.
Not started; (1) is the small, provable first step, not a rewrite.

**Owner decision (2026-10-08): one file, two line TYPES, never one blended schema.**
`session.jsonl` stays a single stream (one file per session to subscribe to — the
owner's own "two files, two subscriptions" tradeoff from `realtime-plan.md` is
unaffected), but a Claude line and an OpenRouter line are different verbs with
different fields, the same way this repo's `JSONL` format already carries several
verbs in one file (`ext/JSONL/readme.md`'s own convention — `assign`/`log`/`chat`/
etc., each shaped for what it is). The grid's live subscriber reads both verbs but
renders them into the two separate columns/sections item 4/5 specify — it never
adds a Claude line's $ to an OpenRouter line's $ to produce one running total.
**Alternative considered and rejected:** one `cost` verb shared by both, with a
`source` field distinguishing them — rejected because a shared shape invites exactly
the blended-total bug the owner is ruling out here (a careless reducer that sums
every `cost` line regardless of `source`); two distinctly-named verbs make that
mistake visibly wrong in the code, not just a style preference.

## 8. Extend Layers.js's "fresh, not compacted" rule to masterminds — Sonnet, ~half a day, careful (it changes when a live agent restarts)

Full evidence and recommendation: [`ai/sessions/doc/context-cost.md`](/framework/ai/sessions/doc/context-cost.md)
/ findings.md's "session freshness" section. Measured: 79-93% of a long session's $ is
repeated context (cache read + cache write), and any idle gap past the 1-hour cache
TTL turns the next turn into a 15-50x-priced cache miss. `Layers.js` already has the
exact mechanism (`stale()`: resume only under 30k tokens AND within 60 minutes;
else `ask_checkpoint()` — one summary line, then a true fresh restart) for the
assistant/manager tier; masterminds and task-masterminds go through `Agents.js`'s
generic `awaken()` instead, which has no age check at all and only compacts
in-place at 200k tokens. **The work:** give `Agents.js`'s dormant-agent wake path the
same `stale()`-shaped check (reuse `Layers.js`'s function/thresholds rather than a
second copy — CLAUDE.md law 6), and the same checkpoint-then-restart action for a
mastermind that fails it. **Why careful, not "small":** this changes *when a real,
possibly mid-task mastermind gets torn down and respawned* — needs its own proof
(force an old dormant mastermind through it, confirm the checkpoint line actually
carries what the next fresh instance needs, confirm `readme_chain`-style batched
re-reads replace the stale context rather than the fresh agent flailing for context).
Not a one-line fix; scoped here for the next task with the right fence and time.

## 9. Sessions grid: context size + cache-$ + a "consider fresh session" signal — Sonnet, half a day, do after item 8 (or at least after its data model is settled)

Owner's ask: show per-session context size and cumulative cache-read cost on the
grid, and flag when a session has grown past the point a fresh one would be cheaper.
Data already exists for this (`cost_of_transcript`'s `usd_breakdown.cache_read`,
and `this.context` on a live Servex agent's own card) — this is mostly wiring + one
threshold, not new computation:
- Add a `context` and `cache_read_usd` cell per row (the live figure for a Servex
  row, the transcript-computed one for a VS Code/CLI row).
- A "consider a fresh session" badge once `context` crosses a threshold — reuse
  `Layers.js`'s own numbers (30k/150k) as the starting default rather than inventing
  new ones, and make it visibly the SAME number item 8 uses to actually act, so the
  grid never shows a warning the system itself doesn't also act on.
- The handoff shape (a short summary + batched readme reads) is exactly
  `ask_checkpoint()`'s own `card_summary` call, already built — this item is display
  only, not a new handoff mechanism.

## 10. Stop Opus/Fable minions without a stated reason — Sonnet, cheap, high leverage

Real, measured (`post-analysis.mjs`): **$499.07 across 82 minions** ran on Opus or
Fable with no reason recorded, against the standing house policy. Smallest real fix
on this whole list: have `spawn_agent` (`tools.js`) require a one-line `why` when
`role: "minion"` and `model` is Opus/Fable-family, logged onto the agent itself (not
just chat) so a later audit (this script) can tell "stated reason" from "just
happened." Does not need to BLOCK the spawn — a required, logged reason is enough
friction to end the silent default, per the owner's own "decide and say why" pattern
(CLAUDE.md law 4) rather than a hard gate nobody asked for.

## 11. A real "cheap-first-opinion" gate — Sonnet, half a day, extends an existing mechanism

Full evidence: findings.md's "cheap-first-opinion" section. Real data confirms the
owner's own caveat: a Sonnet minion doing 100-200 individual reads already costs
$25-70 (**$0.26/read-call average**), so "cheap model first" only saves money if
it's also SCOPED — a script-computed shortlist, not an open-ended look-around.
**Mechanism (reuses, doesn't duplicate):** `Agents.js`'s `tool_started()` already
warns at `SERVEX_READ_WARN` reads (default 40) for any gated role — promote that
from a warning to a real refusal for a new `cheap-first` role specifically: past the
ceiling with no grep/glob-shaped call among them, Servex refuses the next individual
`Read` and tells the agent to compute a shortlist instead (same `gate()`/spend-gate
pattern already governs $; this is the same idea for read COUNT). **Default:** keep
the existing 40-read number rather than inventing a new one. **Alternative
considered, rejected as the first choice:** gate on $ instead of read count — the
existing $ spend gate already exists project-wide; a read-count gate more directly
targets the actual complaint (reading file-by-file instead of computing a
shortlist).

## 12. Re-run `post-analysis.mjs` periodically, not just once — small, process not code

The script (`post-analysis.mjs`, this dir) is cheap (reads `spend-tree.json`, no
network, no model call) and already answers "where did it go, by day/model/role" and
three concrete waste signals (Opus-on-minions, long-windows, stopped-in-flight). The
only thing needed to keep it useful is habit, not more code: re-run it after
`spend-tree.mjs` refreshes (item 2, above), and read the top of each section before
deciding what the budget mastermind does next. Not duplicating `prompt-audit`
(Haiku, auditing unbuilt owner asks) — that script answers a different question
(what was asked but never built); this one answers what WAS built and what it cost.

## 13. `session.jsonl` — the formal shape, the proof script, and the fix already landed

Full evidence: findings.md's "formal `session.jsonl` spec" section.

**Already fixed, this task:** `spawn_agent` now defaults `parent: args.parent ??
ctx.caller ?? null` (`Servex/agents/tools.js`) — the single biggest lever on the
parent/child question, since it stops the ONGOING source of new orphans (not just
old data). Measured before the fix: 922 of 1958 agents (47%, $5,460.87 own $) had
no resolved parent.

**Owner decision (2026-10-08), superseding the single shared shape originally
drafted here: Claude and OpenRouter are separate accounting systems end to end —
separate line schema, separate proof script, separate rollup field.** Rationale:
they are not the same KIND of fact. A Claude line is derived — tokens, priced at a
published per-model rate we compute ourselves. An OpenRouter line is reported — the
`/generation` endpoint's own settled price, which can resolve LATE (the stale-cost
race in item 1 exists precisely because it's a separate async fact, not a same-
request number) and is already real billed money, not a rate we apply. Treating
them as one schema with optional fields was the alternative actually drafted in
this plan's first pass; it's rejected now because it would let a reader (or a
careless script) treat "tokens × rate" and "what OpenRouter actually charged" as
interchangeable, which they aren't — the whole point of reading the raw API per
item 1's investigation was that only one of the two is ever a derived estimate.

**To build, in order:**
1. **Two line verbs, one file per session** (same file `session.jsonl` streams
   from — just two shapes in it, see item 7's own alternative-rejected note):
   - `{claude_usage: {ts, session_id, parent_session_id, message_uuid, request_id,
     model, usage: {input, output, cache_read, cache_write_5m, cache_write_1h},
     usd, tools: [name, ...]}}` — `usd` computed by us, from the model's published
     rate (`session-cost.mjs`'s `PRICES` table).
   - `{openrouter_usage: {ts, session_id, parent_session_id, request_id, model,
     usd, source: "generation"|"key_diff", tools: [name, ...]}}` — `usd` is
     OpenRouter's own reported price, copied, never recomputed from a rate table;
     `source` records which of the two existing lookup paths
     (`message_cost()`/`generation_cost()`, `Agents.js`'s `price()`/`meter()`)
     actually produced it, since the owner's own words name this as something that
     "can resolve late" — a reader needs to know a given line might still be
     provisional.
   - `parent_session_id` is JOINED from Servex's registry `parent` field for BOTH
     verbs the same way (that lineage question doesn't depend on which pricing
     system priced the line) — it cannot be derived from either raw source
     (findings.md, item 1).
2. **Two completeness proof scripts, not one parameterized by a flag:**
   - `session-jsonl-audit-claude.mjs` — sum of a session's `claude_usage` lines ==
     `cost_of_transcript()`'s independent total, gap reported, target exactly 0.
     The underlying pricing math is ALREADY proven exact to the last decimal
     against the SDK's own billed cost (2026-10-04) — this script proves the NEW
     file's completeness, not the formula.
   - `session-jsonl-audit-openrouter.mjs` — sum of a session's `openrouter_usage`
     lines == the sum of that session's real entries in `openrouter.jsonl` (the
     actual ground truth for this system, per `Agents.js:1561`'s own comment) —
     a DIFFERENT ground truth than the Claude script checks against, because the
     two systems' truth lives in different places.
3. **The writer:** Servex (`Agents.js`, in-process) for Servex rows — it already
   has both facts live (`message.usage` for Claude, `price()`/`meter()` for
   OpenRouter) and should write each straight to its own verb the moment it's
   known, never through a shared "turn cost" variable first. The existing Stop
   hook (`session-cost.mjs --append-stdin`) only ever sees Claude data (a VS
   Code/CLI session has no OpenRouter agent concept) — it writes `claude_usage`
   lines only; nothing here needs an OpenRouter path for that kind of row.
4. **The 5m/1h cache split (Claude only — OpenRouter has no equivalent field):**
   read `usage.cache_creation.ephemeral_5m_input_tokens`/`ephemeral_1h_input_tokens`
   directly from the raw message instead of assuming 100% 1h (today's `PRICES`
   table assumption, empirically true on this machine so far but not structurally
   guaranteed — findings.md).
5. **Grid wiring:** once `session.jsonl` exists and streams (item 7), the Sessions
   grid's two separate cost cells/breakdown sections (item 4/5) each read their own
   verb directly, instead of re-scanning the whole transcript (Claude) or
   `openrouter.jsonl` (OpenRouter) on every page load. A row's rollup, when it has
   descendants of both kinds, shows `subtree_claude_usd` and `subtree_or_usd` side
   by side — already `spend-tree.json`'s own shape today, unchanged, carried
   through to the new per-session view rather than collapsed into one number.

## Optimization items the owner asked to be recorded (Phase 2, items 1-6)

Each gets what data it needs, so whoever builds it doesn't have to re-derive this:

1. **Pace-aware model stepping.** Data exists: `usage.json`/`usage.jsonl`
   (`Servex/Usage.js`, real Anthropic-reported %) plus `Usage.pick()` already has the
   logic stubbed (currently pinned to Sonnet-only, 2026-10-07, "until the owner lifts
   it" — see the comment in `Usage.js:49`). Building this for real means un-pinning that
   line and re-testing the existing elapsed-vs-used formula with real numbers, now that
   the ledger fix above makes "used" trustworthy. Do item 2/3 above FIRST — this item's
   whole premise (pace) depends on the week number actually being right.
2. **Right task to the right agent.** Needs a $-per-outcome figure per role — `spend-
   tree.json`'s `by_role` (already built, 2026-10-04) is the input; the missing piece is
   "and did it land" (`task.jsonl`'s own landed/not-landed), which isn't joined to cost
   anywhere yet. A genuinely new, small join script.
3. **Batch-read measurement.** Data exists in every transcript already: `Server/session-
   cost.mjs`'s `trace_of_transcript()` has every tool call with its timestamp and target
   — "10 Reads in one turn" is countable today (group `calls` by `turn_at`, count Read/
   Grep/Glob calls per group, histogram it). No new logging needed; a half-day script.
4. **100% accounting.** This task's own fix (item 1 above, the find_transcript bug) is
   most of this. The remaining known gap: minions with no registry `parent`
   (decisions.md, "left open") — `spend-tree.mjs`'s own reconstruction heuristic already
   covers most of it; grafting it into `task-cost.mjs` is the one piece still open, and
   is "major surgery" by CLAUDE.md's own definition (ask before doing it).
5. **Local/cheap models, 32k budget.** No data gathered yet on what a local model's
   context actually costs per component (system prompt, skills, tools, file reads) — this
   needs a NEW small measurement (log token counts for a probe conversation against the
   local model, broken into those four buckets) before any budget can be enforced. Not
   started; flagged as its own small task.
6. **Anything else found that matters:** the OpenRouter stale-cost race (item 1, above)
   is the other big one; nothing further surfaced in this pass worth a separate line.
