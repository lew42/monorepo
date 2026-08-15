# AITask — how it got here

Session-by-session record of the waves that built this module. The readme beside
it describes the current state; this is the history, kept because the reasoning
in it is still load-bearing.

## 1. Task previews — a card the task drew itself

`dashboard.js`'s row card now shows more of the manifest: agents rendered as
`done/total` while a task is mid-run (a plain count once every dispatched
agent has landed), the window's `after` percentage, alongside the existing
tokens/model/tab. All from fields the manifest already had.

**The bridge, one ternary in `card(t)`:** a declared child whose own
`preview()` isn't the inherited `Page.prototype.preview` draws its own row;
everyone else gets the manifest card unchanged.

```js
const card = t => t.child?.preview && t.child.preview !== Page.prototype.preview
	? t.child.preview(t.nav)
	: manifest_card(t);
```

The same idea, one tier up: `dashboard.js` exports `glance(page)` — a day's
task counts (running/landed/idea), inert, sized for `Page.preview_card()`'s
`thumb` slot. A day's `page.js` opts in with
`preview(nav){ return this.preview_card(nav, () => glance(this)); }`, and its
tile on `/framework/ai/` stops being a bare title. Neither change touches
`core/Page` — the `thumb` argument `preview_card()` already had was built for
exactly this.

Demoed live end-to-end in
[`ai/2026-08-13/task-previews/page.js`](/framework/ai/2026-08-13/task-previews/):
its own `preview()` override (a checklist, not a status line) is what the day
dashboard shows for that task, and the page calls `glance()` on the real day
Page to render the same tile that `/framework/ai/` shows for 2026-08-13. A
declared task is also a child of the day page in the ORDINARY sense, so the
same override reaches a day's pre-existing `this.previews()` topic wall too —
one override, every caller that asks a child to draw itself. That's why the
demo card uses `preview_card()` + a thumb rather than a bespoke row shape: the
same markup has to read in a linear list AND a card grid, and `preview_card()`
already adapts to both. Tiers and the "what does the card need vs. what should
page UI own" schema audit are in that task's `notes.md`.

**Revised 2026-08-13 (improve-daily-task-dashboard):** the checklist override
is retired — an unexplained checklist among uniform manifest rows read as
noise, not status (Mike, twice). The bridge stays, reserved for tasks whose
output is genuinely *viewable* (a live thumb); anything *linkable* goes in the
manifest's `links` instead. The day page also stopped calling `previews()`
below the dashboard — the same tasks rendered twice. Open: a date with no
`page.js` still gets the ai index's bland default (`previews()` never calls
`route()` for an already-declared name); `tasks()`/`dashboard()` assume
exactly two levels below `ai/` and would need a generalized walk to support a
sub-tier dashboard.

## 2. feed() — the task log as a live feed

`feed.js` (`feed(session_id)`) is a second, independent renderer over the same
transcript: turns **newest-first, expanded, no fold-bars** — a feed, not an
archive. It's now the default log view in `AITask.report()`, with
`replay(m.session_id, "this session — as threads")` kept directly beneath it
(closed by default, unchanged otherwise) for anyone who wants the old
rail/detail browsing. Nested agent replays are untouched. Verified against the
real transcript at `/ai-logs/7554e7f0-1d8e-4235-9424-3188c76048e4` (372 lines,
the session that built this ext) — 10 turns, both color schemes, a
global-playwright pass with zero script errors.

It imports `parse/command/harness/trivial` from `prompt.js`, `message` from
`message.js`, `ref/clock/dur/elapsed` from `stats.js` — reused, not
duplicated. `replay.js`'s `load()` and its `turns()`/`is_prompt()` grouping are
**not exported**, so feed.js carries its own ~15-line copies of that shape
(fetch + SPA-html sniff; a turn is a prompt plus the flow up to the next real
prompt). Open: hoist that grouping into a shared module both files import,
once a third caller wants it too.

**The socket seam is `ingest(state, $list, line)`** — takes ONE already-parsed
transcript line and either prepends a new turn (`open_turn`) or folds into the
still-open one (appends to its flow, re-renders its meta row), no full
re-render. A live turn is drawn optimistically on its first line and pruned
(`finalize`) only if the next real prompt proves it picked up no flow and had
no prose/command of its own — matching `replay.js`'s trivial-turn filter, but
decided one line at a time instead of over the whole batch. Nothing calls this
from a real socket yet (out of scope, `framework/dev/Socket` untouched) — today
a refresh button and, localhost-only + page-visible, a 5s poll both just call
`sync()`, which re-fetches the whole transcript and feeds `ingest()` only the
lines past what's already been seen. Confirmed idempotent across a poll cycle
(same turn count, no duplication).

**Design calls, recorded:**
- Keeping `replay()` beneath `feed()` (not removing it) — a feed reads best
  live, but the rail's click-through is still the better tool for scanning a
  long finished session at once. Revisit if nobody ever opens it.
- A live turn's meta line (`clock`/`dur`) reflects only what's been synced so
  far — it doesn't retroactively show a longer duration until the next
  refresh/poll picks up more flow. Acceptable for a feed; would need to be
  addressed if `Socket` starts pushing sub-second updates.
- `log-feed/page.js` deliberately doesn't exist — the day's `route()` fallback
  already serves an `AITask` for undeclared task dirs (see "The day
  dashboard" above), and a probe task dir doesn't need a curated page. This
  does 404 once on `/framework/ai/2026-08-13/` (a declared child with no
  `page.js`, eagerly imported for the nav) — pre-existing framework behavior,
  confirmed unrelated to this change and to the identical 404 for `task-previews`/
  `manifest-vs-log` seen mid-session before their own `page.js` files landed.

## 3. stats.js derivation functions — usage_of, tail_activity, timeline_of

Three pure functions added to `stats.js`, verified against the real transcript
that built this ext (`/ai-logs/7554e7f0-1d8e-4235-9424-3188c76048e4`, 372
lines) — no DOM, adoptable by the dashboard.

- **`usage_of(lines, exclude?)`** — dedupes by `message.id` (confirmed: 166 raw
  assistant lines → 58 unique, byte-identical `usage` per duplicate) and sums
  `{ input, cache_write, cache_read, output, calls, total }`. `exclude` is a
  Set of ids to subtract — the fork-copied-history half of the Bites note
  above; implemented but **not** re-verified against a live fork pair (this
  session has no copied-history boundary to test against).
- **`tail_activity(lines)`** — the latest meaningful action as one line: the
  last text block (`"replied: …"`), a bare tool call (`"running Edit
  <path>"`), or a tool result with no assistant turn after it yet
  (`"awaiting reply — last ran <tool>"`, found by matching `tool_use_id`
  backward through the transcript, not a nearest-line guess).
- **`timeline_of(lines)`** — real prompt boundaries with timestamps, harness
  tags stripped (a local copy of `prompt.js`'s `TAG` regex — importing
  `prompt.js`/`message.js` back into `stats.js` would recreate the
  mutual-import trap, since both already import `count` from here). **Found
  doing this: a Skill tool's injected body arrives as a `"user"`-role text
  block with no wrapping tag but `isMeta: true`** — `replay.js`'s
  `is_prompt()`/`trivial()` don't check it, so a skill load renders as a
  genuine 49,480-char thread in the real rail today (confirmed live on
  `/framework/ai/2026-08-13/sessions/`, thread #6). `timeline_of()` filters
  `isMeta`. **Fixed 2026-08-13 (improve-daily-task-dashboard):** both viewers
  now drop `isMeta` lines from the talk stream (`is_talk()` in feed.js, the
  `talk` filter in replay.js), so a skill load renders nowhere, like caveats.

Full field-by-field authoritative-vs-derivable verdicts, the schema-v2
proposal, and prioritized log-rendering improvements are in
[`manifest-vs-log/analysis.md`](/framework/ai/2026-08-13/manifest-vs-log/)
(verdict up front: `tokens` should stop being hand-typed, everywhere the
transcript is still reachable).
