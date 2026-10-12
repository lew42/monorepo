# Manifest vs log

**Verdict, up front.** Two fields should stop being hand-typed: `tokens` (top
level and per-agent) — the readme already says this, and this task ships the
functions that do it (`ext/AISession/stats.js`: `usage_of`, `tail_activity`,
`timeline_of`, verified against the real transcript that built `ext/AISession`,
session `7554e7f0…`). Everything else earns its keep as a self-reported field
because the transcript genuinely can't know it (a VS Code tab title), can't be
trusted to know it (a human's synthesized "ask" vs. their first raw message),
or needs judgment the log can't supply (`outcome`). The biggest **rendering**
win isn't a new field at all — it's wiring `tail_activity()` into the
dashboard's `now` fallback, and stripping `isMeta` skill-injections out of the
replay rail (verified live: one currently renders as a full 49,480-char fake
user turn — see below).

## Field-by-field

| field | verdict | why |
|---|---|---|
| `session_id` | **authoritative** | the join key — nothing to derive it *from* |
| `request` | **authoritative**, derivable default | a human's synthesized ask reads better than their raw first message; `timeline_of(lines)[0].text` is a good backfill when `request` is missing, not a replacement when it's present |
| `requested_at` | **authoritative**, derivable default | same shape as `request` — a task can be proposed before its coding session starts, so self-report wins when present; `timeline_of(lines)[0].at` backfills |
| `landed_at` | **authoritative** | a state *decision* ("this is done"), not a log fact — readme already calls it approximate by nature. The transcript's last timestamp is a good staleness companion, not a replacement |
| `model` | **derivable, should replace self-report** | assistant lines carry `message.model` per call; a session's actual model history is the dedupe of that set. Measured proof it drifts: *this transcript* has two `/model` commands (`sonnet` at 15:16, `claude-fable-5[1m]` at 17:13) — a hand-typed `"model"` string is one guess at a two-switch story |
| `tokens` | **derivable, firm** | exact per-call `message.usage` is in every assistant line; `usage_of()` dedupes by `message.id`. Today `AISession.js` (`report()`) and `dashboard.js` (`stats()`) both print `m.tokens` verbatim with zero cross-check — the exact gap the readme's Bites section names |
| `tab` | **authoritative** | a VS Code window title; the transcript has no visibility into it at all |
| `now` | **authoritative primary, derivable fallback** | self-report says more than the log can ("adding schema-v2 proposal" vs. "running Edit") — but it goes stale exactly as predicted: this task's own `session.json` sat on `"briefed — Sonnet agent dispatched"` for the whole build, until this line updated it. `dashboard.js`'s `current()` already falls back to "the last agent missing an `outcome`" — it has no transcript-backed floor under *that* |
| `window` | **derivable, but fragile — not proposed now** | `rate_limit_event` *is* in this transcript (15 hits), but only nested inside `tool_result` strings from Bash-captured `stream-json` probes, never as a native line type. Deriving it robustly means scanning tool-result blobs for embedded JSON, and only works for sessions that happened to capture a fork's raw stdout that way |
| `outcome` | **authoritative** | narrative synthesis — judgment, not extraction |
| `agents[].kind/task/model/used` | **authoritative** | the orchestrator's own account of what it dispatched and whether it mattered; nothing to check it against |
| `agents[].tokens/duration_ms/cost_usd` | **split by kind** | `cli` agents carry a `session_id` → derivable the same way as top-level `tokens`. `agent`-kind (Task-tool) spawns have no served transcript (confirmed in `ext/AISession/readme.md`) → stays self-reported, no other source exists |
| agent-roster completeness | **derivable, not built** | a `Task` `tool_use` block in the transcript is a spawn the manifest may have forgotten to record — a diff against `agents[]` would catch it. Out of this task's three-function scope; noted for whoever builds the dashboard-facing version |

## schema-v2 proposal

Weighted per verdict-firmness — firm items are safe to just do; loose ones are
named, not committed.

**Firm — do this:**
1. Stop hand-typing `tokens` (top-level and per-`cli`-agent). The viewer computes it
   via `usage_of()` against the fetched transcript and falls back to the
   stored number only when the transcript is gone (30-day local retention,
   static hosting has none of it). This doesn't need a schema change — `tokens`
   stays the field name, it just stops being authored by hand.

**Medium — worth doing, softer:**
2. Wire `tail_activity()` in as `now`'s live floor (`dashboard.js`'s `current()`),
   so a task that goes quiet mid-session still shows something true instead of
   a frozen sentence.
3. Cross-check `model`: compute the set of `message.model` values actually seen
   and flag disagreement with the self-reported string, rather than replacing
   it — self-reported stays "the operator's stated story," derived becomes
   "the log's receipt."
4. Backfill `request`/`requested_at` from `timeline_of(lines)[0]` at manifest
   creation (a `new-task`-skill nicety) when the human didn't type them explicitly.

**Loose — named, not proposed:**
5. `window` from embedded `rate_limit_event` blobs — real but shape-fragile (see
   table above).
6. Agent-roster reconciliation via `Task` `tool_use` scan.

## Prioritized log-rendering improvements

For a proposal + logging + tracking UI, in order of what moves the needle:

1. **`now` fallback from the tail.** The single highest-value fix for
   "tracking" — every quiet task currently either shows a stale sentence or
   nothing. `tail_activity()` is a drop-in default for `dashboard.js`'s
   `current()`.
2. **Show the cache write/read split, not just a total.** `usage_of()` returns
   `{ input, cache_write, cache_read, output }` on purpose — collapsing to one
   number hides the exact signal `sessions/session.json`'s own outcome had to
   discover by hand ("each fork re-WROTE ~124k of library context, cache_read
   only 19k" — a fan-out paying premium write rates instead of reading a
   cache). A spend table that shows the split turns that from forensic
   archaeology into something visible at a glance. It also means a raw summed
   `tokens` total isn't cost-comparable across sessions on its own — a
   cache-heavy long single-flow session (this one: 6.28M cache-read tokens vs.
   314K cache-write) and a repeatedly-re-writing fan-out can post similar
   totals for very different spend.
3. **A `timeline_of()` strip above the thread rail.** The rail is a flat
   scrolling list today — no at-a-glance density or pacing view. A compact
   dot-strip (the existing `ui.timeline()` primitive) using real prompt
   boundaries lets a reviewer see "was this session efficient" before opening
   any one thread.
4. **Filter `isMeta` out of prompt detection — verified live bug.** A Skill
   tool's injected body arrives as a `"user"`-role text block with no wrapping
   tag (unlike caveats/commands/task-notifications, which `prompt.js`'s `TAG`
   regex already strips) but *with* `isMeta: true`. `replay.js`'s `is_prompt()`
   and `trivial()` don't check `isMeta`, so it renders as a genuine thread.
   Confirmed against the live site: `/framework/ai/2026-08-13/sessions/`,
   opened replay, thread #6 is titled "Base directory for this skill:
   c:\Code\lew42\monorepo\.claude\skills\code-architecture…", 49,480 chars -
   a skill load, not anything the human typed. `timeline_of()` in this file
   filters `isMeta` for exactly this reason; `is_prompt()` should too.
   (`replay.js`/`prompt.js` aren't mine to edit — filed here as a finding.)

## Verification results

Run live against `7554e7f0-1d8e-4235-9424-3188c76048e4` (the transcript that
built `ext/AISession`, 372 raw JSONL lines) — see this task's `page.js` for the same
numbers rendered from the browser, fetched at request time, not pasted here:

- **`usage_of`** — 166 raw `assistant` lines dedupe to 58 unique `message.id`s
  (confirmed: every duplicate id carries byte-identical `usage`, i.e. it really
  is the same response split across streamed lines, not new data). Totals:
  686 input / 314,491 cache-write / 6,277,626 cache-read / 124,569 output.
- **`tail_activity`** — correctly reads the transcript's last real content
  (`"replied: Done — refresh to see it. Each of your asks, as built:"`) and,
  tested by truncating the transcript at different points, correctly produces
  `"running Edit <path>"` when the tail is a bare tool call and `"awaiting
  reply — last ran Edit"` when the tail is a tool result with no assistant
  turn after it yet (looked up by matching `tool_use_id` backward through the
  transcript, not a nearest-line guess).
- **`timeline_of`** — 14 raw "text-bearing" user lines reduce to 6 real prompt
  boundaries once harness tags *and* `isMeta` are filtered — matching the
  session's actual turn count by hand-count. Without the `isMeta` filter this
  was 7 (the skill-injection false positive described above), which is what
  led to that finding.
- **Fork-subtraction (`usage_of(lines, exclude)`)** — the dedupe-by-`message.id`
  half is verified above; the `exclude` parameter (for subtracting a parent
  library's ids from a fork's copied history) is implemented per the readme's
  description but **not** re-verified against a live fork pair — this
  session has a single `sessionId` throughout with no copied-history
  boundary to test against. Open: find or manufacture a real fork transcript
  and confirm `usage_of(fork_lines, new Set(parent_lines.map(l =>
  l.message?.id)))` actually removes the parent's line count.
- **`node --check`** — passed on scratchpad copies of `stats.js` and `page.js`.
- **Browser pass** — this task's page (`/framework/ai/2026-08-13/manifest-vs-log/`)
  loads with zero script errors from its own code; the three functions'
  outputs render live from the fetched transcript, matching the numbers
  above exactly. (One unrelated console 404 was observed —
  `ai/2026-08-13/log-feed/page.js` — that's a sibling task's file, not touched
  here.)

## Open questions

- Whether `window` derivation is worth building at all given how narrow its
  current source shape is (see schema-v2 item 5) — leaning no until a session
  emits `rate_limit_event` some more general way.
- Whether `usage_of`'s `total` (sum of all four components) should even be
  the headline number a dashboard shows, given cache-read tokens are
  materially cheaper than fresh input/cache-write — a single sum can make a
  cheap, cache-heavy session look as expensive as a costly one. Leaving the
  four components separate and letting the renderer decide is the safer
  default; flagged rather than decided since it's a rendering call, not a
  derivation one.