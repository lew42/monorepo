# Sessions — a data grid of every Claude session, newest activity first

The owner's own words: "the start time, the source tag, the agent or tab name, the model, the
state and the cost." This tab is that grid, covering all three kinds of session on this machine:
a **VS Code** tab (you, typing), a **Servex** agent (a mastermind or minion, spawned), or a
standalone **CLI** run. Click a row to see that session's own prompts, in order, at its own url —
prompts live inside their session, never a separate log page, and on a wide screen the detail
opens as a side peek beside the grid instead of replacing it.

## Use

Visit [`/framework/ai/sessions/`](/framework/ai/sessions/). Ten columns, newest activity first:
Start, Stop, Duration, Source (a coloured tag), Role, Name, Model, State, RAM, Cost. Drag a column
header's own right edge to resize just that column — each one is a single `--col-<name>` CSS
custom property, with its own minimum width so a column never collapses to nothing. It's a CSS
grid, not a `<table>`: `doc/decisions.md` says why, and what that bought (one token per column)
that a table couldn't.

**Start / Stop / Duration (2026-10-03):** Start and Stop are both real timestamps where known;
Stop reads "ongoing" while a session is still active rather than guessing when it ended — a plain
transcript file has no formal "stopped" event. Duration is Stop minus Start (or "now" minus Start
while ongoing).

**What's new (session-costs minion-build, 2026-10-02) — real per-session dollars, not just the one
older `cost` figure:**
- **Click the Cost header to sort** by it (missing/null always sorts last); click again to reverse,
  a third click returns to the default (newest activity first).
- **The State column is an icon now**, not a word: a blinking green ▶ for a working/active row, a
  quiet dot for everything else. A ✓ for "done" only ever shows on a session's own detail page.
- **A Role column** — real for a Servex row (straight from the agent registry), a best-effort guess
  for a VS Code/CLI row (`doc/decisions.md` says exactly how, and why it's a guess there).
- **A RAM column** — blank until Servex's own agent feed carries a real-time sample; never a stale
  number.
- **Claude $ next to OpenRouter $** when a row carries the split (an "OR" tag marks the real-money
  one) — falls back to the one older `cost` figure for a row that doesn't carry it yet.
- **A role filter and a 30-day date filter** above the grid, with a summary line (sessions shown,
  total Claude $, total OpenRouter $) and a "cost by role" list, largest first — all computed from
  the rows already on screen, no new fetch.
- **A "this week" line** (Claude $, OpenRouter $, the $200 plan's own % used) — from `week.json`,
  a snapshot `Server/week-cost.mjs` writes by hand (see below).
- **A session's own detail page** shows a compact row per logged cost line (time, tokens, $) above
  its prompts, when `Server/session-cost.mjs` has logged one.
- **Below that (session-trace, 2026-10-03): a cost-over-time chart and a "what was it doing"
  table**, when a `trace.json` exists for that session (a manual, run-by-hand file today — see
  below). The chart is cumulative $ over elapsed time, with a tick per tool call; the table groups
  every tool call by tool (Read/Edit/Bash/spawn…) with its count, $ and share, and flags waste it
  can actually compute — the same file read 3+ times, chunked reads, polling, and long runs of
  reads with no write. `doc/decisions.md` has the full case, the real test, and the thresholds
  used.

## Where the real dollars come from

Two SEPARATE scripts, neither live — both are run by hand and read by the page, same shape as
`sessions.mjs` above:
- [`Server/session-cost.mjs`](/code/) reads one Claude Code session's own transcript (the only
  place per-prompt token counts exist) and sums it into a total + a per-prompt breakdown, priced
  by model. A Stop hook (`.claude/settings.json`) runs it after every turn, appending one
  `{"cost":{...}}` line to that session's own `page.jsonl` — the file
  [`task-mastermind-prompt-refine`](/framework/ai/) owns creating, this task only ever appends to.
  `node Server/session-cost.mjs <session-id>` prints the JSON on its own, for testing.
  The same script's `trace_of_transcript()` answers a DIFFERENT question — not the $ total, but
  every individual tool call and its own timestamp, behind the chart + table above: `node
  Server/session-cost.mjs --trace-file <session-id> <out-path>` writes it as `<out-path>`, read by
  the detail page as `<session-dir>/trace.json`. Manual/on-demand only (doc/decisions.md).
- [`Server/week-cost.mjs`](/code/) is a run-by-hand snapshot of this week's Claude $ and
  OpenRouter $ against the $200 Max plan, written to `week.json` beside this readme. Re-run it to
  refresh the "this week" line: `node Server/week-cost.mjs`.

This is a DIFFERENT system from `Server/task-cost.mjs` (a Servex agent's own running total, no
per-prompt detail) — see that script's own doc, `Server/doc/task-cost.md`, for why the two don't
merge.

## Where the data comes from

- **Servex rows are live.** The page polls Servex's own `GET /api/agents` every 20 seconds
  (paused while the tab is hidden — the same shape [`ai2/needs.js`](/framework/ai2/)'s
  `watch_needs()` already uses), so a card and a mastermind's state here is always current.
- **VS Code and CLI rows come from a snapshot**, `sessions.json`, written by
  [`sessions.mjs`](/framework/ai/2026-10-02/panel2-sessions/sessions.mjs) — a plain node script,
  not a live route. Re-run it to refresh those rows:
  ```
  node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs
  ```
  Why a script instead of Servex answering live: this task asked `mastermind-servex-9` for a real
  `GET /api/sessions` route (Servex/agents inbox, 2026-10-02) and none had landed when this was
  built; this task's own fence is `public/framework/ai/` only, so it cannot add a route under
  `Server/` itself. The full reasoning, and what a real route would fix, is in
  [`doc/decisions.md`](./doc/decisions.md).
- **`sessions.json` is gitignored**, the same way `ai/usage.json` already is — machine state
  written by a script, a COMPUTED CACHE never the record itself (the owner's own words). Running
  `sessions.mjs` regenerates it locally; it is never committed.
- **No duplicate data (2026-10-03):** a session's own prompts are never copied anywhere — the old
  `transcripts/<id>.json` snapshot (110 files, 2.5 MB) is gone. The detail page reads a session's
  real prompts LIVE, through `/ai-logs/<id>` (`Server/plugins/AILogs.js`, dev-server only, the same
  route [`ext/AITask/replay.js`](/framework/ext/AITask/) already used) — the owner's own dictated
  text never sits in `public/`, the folder this site deploys statically, even transiently.

## Watch out

- **"Session" means two different things on this site.** This tab is a *Claude Code* session
  (a VS Code tab, a Servex agent, a CLI run). [`ext/Session`](/framework/ext/Session/) is a
  *voice* session (one ✦ press, a dictated conversation) — unrelated, already named first. Don't
  confuse the two; this tab never touches `ext/Session`'s own `GET /api/sessions` route.
- A VS Code tab writes no title of its own into its transcript file, so this tab shows the
  session's working folder name instead (`tab_title`) — the real tab title isn't available from
  the data this reads.
- A Servex-sourced session's own page has no transcript yet (`GET /api/agents` carries no prompt
  text) — its detail page says so, with a link to why.
- **A session's home is its date path, once one exists — and none do yet.**
  `task-mastermind-prompt-refine`'s hooks are meant to write a real
  `ai/<Y>/<M>/<D>/<slug>-<uuid8>/page.jsonl` per session (page-item-design.md); checked live,
  2026-10-03, and no such folder exists on this machine yet. `session_page_dir_index()` (`page.js`)
  walks for one on every grid load regardless — the moment a session has one, its row's own link
  points there instead of this tab's `/sessions/<id>/` view, with no further code change. Its own
  plan has changed three times already while this task was being built, so don't trust any more
  specifics than that here — check `task-mastermind-prompt-refine`'s current state instead.
  `load_transcript()` (`page.js`) is still the one function whose body changes once a real prompt
  source lands; today it reads a session's transcript live (see above), not a copy.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the full data-source decision, the `css-scopes.txt`
  reservation note, and the VS-Code-vs-CLI heuristic, checked against a real session
- [`ext/panel2`](/framework/ext/panel2/) — the header/main chrome this tab is built from
- Files: `page.js` (the tab and its detail route), `sessions.css` (the row), `settings.jsonl`
  (`{"tab":true}`, how this folder joined the strip)
