# ext/AITask

The AI working log, rendered. Three tiers, named: a **session** (one Claude
transcript, a uuid) works a **task** (`ai/<date>/<slug>/`); a **day**
(`ai/<date>/`) is the dashboard over its tasks; `/framework/ai/` is the rail
over every task there has ever been.

| file | what it renders |
|---|---|
| `usage.js` | the usage windows as **pace** — the bar is spend, the ▼ is the clock |
| `card.js` | one task as a row: state, step segments, `now`, links, cost |
| `dashboard.js` | enumeration + grouping — `rail()` (index), `dashboard()` (a day), `glance()` (a thumb) |
| `AITask.js` | one task's detail page, and the template a task's own `page.js` extends |
| `feed.js` / `replay.js` | the transcript, as a live feed and as browsable threads |
| `chat()` (in `AITask.js`) | ext/Ask's panel — talk to this task's session, from the page |
| `stats.js` | pure derivations — `progress`, `spend`, `usage_of`, `tail_activity`, `timeline_of` |
| `prompt.js` / `message.js` | parsing one transcript line into something readable |

## The manifest

`task.jsonl` (`ext/JSONL`) is the current format; `session.json` still renders
read-only. Every field is optional and the viewer draws what's there — except
**`session_id`, whose absence costs the entire session log**, and which the
detail page now says out loud rather than rendering nothing.

```json
{"assign": {
  "session_id": "uuid — the transcript this task ran in",
  "request": "the ask, verbatim",  "tab": "which VS Code window",
  "requested_at": "…", "landed_at": "… — stamped LAST; its absence IS 'running'",
  "model": "…", "tokens": 738899, "cost_usd": 2.53,
  "group": "the EFFORT this belongs to — see below",
  "steps": ["the outline"], "step": 3,
  "now": "one line, updated as state changes",
  "window": { "before": 0.15, "after": 0.4 },
  "links": [{ "url": "…", "label": "…" }],
  "outcome": "markdown — first line is what the card shows"
}}
{"agent": {"kind": "agent|cli", "task": "one line", "tokens": …, "outcome": "…"}}
```

`window` numbers are **fractions** of the 5h window (0.12 = 12%), not percents.

## The effort is the top unit — `group`

A day is the filing system; an **effort** is how the work is actually thought
about — a thread that outlives any one day. `group` names it, and that is the
whole mechanism: no registry, no effort directory, no second file to keep in
step. If a task dir shares the slug it is the effort's lead; otherwise the
effort is just its prettified name. A task naming no group is **loose**, and
shown as such rather than hidden.

`effort.js` does the grouping and `framework/ai/`'s rail renders it. A **day**
dashboard still groups by state: one day is small enough that state is the
useful axis, and effort would split ten tasks into five headings of two.

> `group` used to mean *the session that spawned me* — so `browser-cli-bridge`
> sat under `layout-tool` because that session happened to spawn it, which is
> parentage, not subject. Redefined 2026-08-14; parentage is still recoverable
> from `agents[]` and the session ids, and nothing rendered the old meaning.

## Starting work from the board

`compose.js` is a box on `/framework/ai/`: an ask, an optional name, an effort,
a model. `Server/plugins/Start.js` answers `rpc:start` by scaffolding
`ai/<date>/<slug>/` — the brief and an opened `task.jsonl`, exactly what the
`new-task` skill writes by hand — and spawning `claude -p` to work it.

**It returns as soon as the process is away, not when the work is done.** A
task runs for an hour; the promise resolving on that would be a lie. The task's
own log is the progress channel and live-reload carries it to the board, which
is the whole reason the log exists. `--session-id` is generated up front and
written into the launch `assign`, so the transcript is joined from line one
instead of discovered afterwards.

`acceptEdits`, not `bypassPermissions`: a text box on a web page should be able
to write files, not to run anything at all. Raise it per call if a task
genuinely needs the shell.

> ⚠ The three scaffold writes are **muted** for the socket that asked
> (`LiveReload.mute`) — without it the board reloads out from under the compose
> box before it can show the link. Every other tab still sees the task appear.
> Deriving a slug from the raw ask is the fallback and a poor one — "Read
> public/framework/ext/AITask/readme.md and …" slugged to
> `read-public-framework-ext`. Path-ish tokens are dropped now; the name field
> is the real answer.

## `state()` — requested, not merely present

A task is **running** only once it carries `requested_at`. Before that a
manifest is metadata (a `group` and nothing else), which is what lets a
proposed task declare its effort without claiming to be in flight. `landed_at`
still wins over both. The old test — *any manifest without `landed_at`* — read
an outline-less manifest as "running since …" forever.

## Progress is two fields

`steps` is the outline, declared once at launch; `step` is the 1-based index
underway. So `1..step-1` are done, and the card's segmented bar, its `3/8`, and
the detail page's checklist all derive from the same pair — nothing can
disagree with anything. A landed task reads as all-done whatever `step` says. A
task that declares no outline simply shows no bar, and so does a dormant one:
**the bar means "in flight"**, which is why `Active` is its own group.

## Pace, not percentage

Each usage window is a fixed length, so `resets_at` gives how far into it we
are — a ▼ over the track. The fill is colored by **projected end-of-window
total** (`percent / elapsed`): `--ok` ≤100, `--warn` ≤125, `--hot` ≤175,
`--error` beyond. Bar behind marker = under pace, which is the whole reading.
⚠ The first tenth of a window is noise — 1% spent three minutes in projects to
100% — so it stays calm until there is signal. A 60s tick walks the clock
forward in place between snapshot refreshes; `usage.json` itself is written by
the `check-claude-usage` skill and gitignored.

## The template, and its override

`AITask` **is** the master template and `report()` is its outline — `head`,
`checklist`, `extra`, `figures`, `chat`, `log`, each a named method. A task dir's own
`page.js` overrides whichever it wants and inherits the rest; `extra()` is
empty by default and exists to be filled. No options, no flags — assign-based
OOP doing what it already does. Live example:
[`ai/2026-08-13/panel/page.js`](/framework/ai/2026-08-13/panel/), whose live
`ext/Panel` workspace is an `extra()` above the spend tables it now also gets.

A task dir with no `page.js` is served by its day's dynamic `route()`, so the
template is the default and a curated page is the exception.

## Bites

- **A routed task mounts beside its day, not inside it.** A plain `Page` sets
  no `$pages`, so `container()` walks past the day to the ai index's catalog
  region and both land there as siblings. `ai.css` stands the day aside while
  one of its tasks is showing — the `.tab-panel` contract, one tier down.
- **`previews()` is doing two jobs.** It is both "my children, on someone
  else's index" (`walls()`) and "my catalog rail". Overriding it for the rail
  therefore rendered the whole dashboard on `/framework/`; `leaf: true` on the
  ai page opts it out of both the wall and the nav tree.
- **Card layout is a container query, not a viewport one** — in the rail the
  card is narrow while the screen is wide.
- **A fork's transcript contains the full copied parent history**, with
  `sessionId` rewritten to the fork's own (measured 2026-08-13). No surviving
  marker distinguishes copied lines. Timestamps jump backward at the boundary,
  which a future heuristic could use. Open.
- **Exact token usage is in the transcript** — every assistant line carries
  `message.usage`; dedupe by `message.id` (`usage_of()`). A manifest's `tokens`
  can be computed rather than self-reported.
- **The log is threads, not messages.** Tool results arrive typed `"user"`,
  sidechain lines belong to a subagent, and a Skill's injected body arrives as
  a `"user"` text block with `isMeta: true` — none of them start a thread.
- Prose renders through **`md()`** — Mike's call (2026-08-13): browsability
  beats the raw-html risk. If a message renders strangely, suspect its embedded
  HTML before the viewer.
- The manifest is written by the session it describes, so `landed_at` and
  `window.after` are the last edit before stopping — approximate by nature.
- **Every append reloads an open tab.** Log milestones, not keystrokes. The one
  exception is the chat's own append: `LiveReload.mute(file, socket)` spares the
  socket that caused a write, so a reply doesn't reload the tab that asked.
- **The chat FORKS on its first message.** A headless turn must never share a
  transcript a human still has open, so `chat_session_id` is a sibling of
  `session_id`, not the same session. See [`ext/Ask`](/framework/ext/Ask/).

## Where replays come from

`Server/plugins/AILogs.js` maps `/ai-logs/<uuid>` onto
`~/.claude/projects/<cwd-slug>/<uuid>.jsonl`, read-only and UUID-validated —
transcripts are 130KB–2.4MB each and are scratch by CLAUDE.md's own rule, so
they are served from the real path and never enter the repo. No path-naming
scheme: the manifest is the join table. On static hosting the route falls to
`index.html`, the viewer sniffs the content-type and says "unavailable".
Production never depends on it.

## Open

- Subagent transcripts (`<session>/subagents/agent-*.jsonl`) aren't served.
- `AITask.session()` probes `task.jsonl` blind, so every legacy `session.json`
  task logs one console 404. `dashboard.js` avoids it by reading the directory
  listing first; the viewer has no listing to read.
- `tasks()`/`dashboard()` assume exactly two levels below `ai/`; a sub-tier
  dashboard would need a generalized walk.
- `replay.js`'s `load()`/`turns()`/`is_prompt()` are not exported, so `feed.js`
  carries ~15 lines of the same shape. Hoist when a third caller wants it.

Field-by-field authoritative-vs-derivable verdicts and the schema-v2 proposal:
[`manifest-vs-log/analysis.md`](/framework/ai/2026-08-13/manifest-vs-log/).
How the module got here, wave by wave: [`doc/waves.md`](doc/waves.md).
