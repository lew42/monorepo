# Real per-session Claude costs: reader, hook, grid, week view

Budget: $7 (raised from $6 once the owner's role/filter/summary addition folded in — see item 7).
Load the `minion` skill first. Task dir: `public/framework/ai/sessions/2026/10/02/session-costs/`
(read `../requirements.md` there for the owner's full dictated words — this brief is the
build plan already cut down from it).

You're working in a Servex pool worktree (Servex only lets minions run that way — main tree is
refused). Commit each file the moment it works (`git add <exact paths>`, never `-A`). Before
touching `public/framework/ai/sessions/page.js` or `sessions.css`, run
`node Server/hold.mjs on "minion-session-costs — grid+detail"` (against your worktree's own dev
server), make that whole edit, confirm the page and a detail route both load clean at 1920 (zero
console errors), then `node Server/hold.mjs off "minion-session-costs"`. When done, tell the task
mastermind so it can `node Server/merge.mjs <your worktree path> [pages]` into `michael/dev`.

## What exists already (read first, reuse — law 6)

- [`public/framework/ai/sessions/page.js`](/framework/ai/sessions/) + `sessions.css` + `readme.md`
  + `doc/decisions.md` — the data grid this task extends. Read all four before editing.
- `Server/task-cost.mjs` + `Server/doc/task-cost.md` — a DIFFERENT, already-working cost system
  (per-task, from the Servex agent log's own running `total_cost_usd`). Don't touch it; this task
  reads the raw Claude Code session transcript instead, because that's the only place per-PROMPT
  token counts exist.
- `Servex/ext/openrouter/reconcile.mjs` — reads the real OpenRouter ledger
  (`%LOCALAPPDATA%\lew42\servex\logs\openrouter.jsonl`) against OpenRouter's own bill. Reuse its
  `OR_LOG_PATH` export; don't re-derive the path yourself.
- `.claude/hooks/append.mjs` — the ONLY way any script in this repo appends a JSONL line
  (`node .claude/hooks/append.mjs <file> <json-array-file>`). Use it; never `fs.appendFile` a
  JSONL line yourself.
- `public/framework/ai/2026/10/02/session-<id8>/page.jsonl` — a real, already-existing per-session
  page (one folder per Claude session id, first 8 hex chars of the uuid). A sibling task
  (`task-mastermind-prompt-refine`) owns creating/naming these folders and their other line
  shapes — **you only ever APPEND to a `page.jsonl` that already exists. Never create the file or
  the folder.** If none exists for a session, skip it quietly (exit 0, one line to stderr) — same
  convention as `task-cost.mjs`'s "unknown agent" case.
- Pricing (no table exists in this repo yet): claude-sonnet-5 $2/$10 per MTok in/out,
  claude-opus-5 $5/$25, claude-opus-5-5 $4/$20, claude-haiku-4-5 $1/$5, claude-fable-5 /
  claude-fable-5-1 $10/$50. Cache reads run about 0.1x the input price, cache writes about 1.25x —
  comment these two as estimates in the code (they vary slightly by model; closest documented
  numbers are good enough for an estimate the readme already calls an estimate).

## Build

1. **`Server/session-cost.mjs`** — a node reader + tiny CLI.
   - A `PRICES` table (per-model $/1M tokens: `in`, `out`, `cache_read`, `cache_write`), using the
     numbers above. An unknown model name falls back to claude-sonnet-5's price and is listed in
     the result's `unknown_models`, never thrown.
   - `cost_of_transcript(path)`: reads one Claude Code session transcript (a `.jsonl` file of
     `{type, message, ...}` lines). Walk it in order; group every `assistant` line's
     `message.usage` under the nearest earlier REAL `user` line (same rule
     `ai/sessions/doc/asks/decisions.md` already documents for VS-Code-vs-CLI tagging: skip
     `isSidechain`/`type:"task_notification"` lines — they are not a real prompt boundary).
     Sum each group's `input_tokens`, `output_tokens`, `cache_read_input_tokens`,
     `cache_creation_input_tokens` × that message's own `message.model` price. Return
     `{ total_usd, by_prompt: [{ at, usd, input, output, cache_read, cache_write, model }],
     unknown_models: [...] }`.
   - Find a session's transcript by id: search every
     `%USERPROFILE%\.claude\projects\c--Code-lew42-*\<session-id>.jsonl` (not just the main
     checkout's own folder — a worktree session lives under a differently-named project folder;
     this is `ai/sessions/doc/asks/decisions.md`'s own noted open gap, and this script is the right
     place to fix it since it already needs every folder).
   - CLI: `node Server/session-cost.mjs <session-id>` prints the JSON result (for testing).
     `node Server/session-cost.mjs --append <session-id>` computes it, then looks for
     `public/framework/ai/<today Y>/<today M>/<today D>/*-<first 8 hex of session-id>/page.jsonl`
     (TODAY's date folder only). If found, appends ONE line via `.claude/hooks/append.mjs`:
     `{"cost":{"total_usd":N,"last_prompt_usd":N,"by_model":{...per-model usd...},"source":"claude","at":"<ISO>"}}`.
     If not found: one line to stderr, exit 0 (quiet).
   - Prove it works: run `node Server/session-cost.mjs 355eb7ba-ed23-46bb-ab6f-77c073a23571`
     (this very session's own id — a real, large transcript) and paste the resulting JSON's
     `total_usd` and prompt count into this task's own task.jsonl as a log line.

2. **Wire the Stop hook, additively.** In `.claude/settings.json`, add a `"Stop"` array (create it
   if absent — don't touch any existing `PreToolUse`/`PostToolUse`/`SessionStart` entries) with one
   hook: `node Server/session-cost.mjs --append-stdin`. Claude Code's Stop hook payload arrives on
   stdin as JSON and includes `session_id` — read that field, then run the same `--append` logic.
   `timeout: 15`. Wrap the whole thing in try/catch so a Stop hook failure never blocks the turn —
   log the error to stderr and exit 0 either way.

3. **`Server/week-cost.mjs`** — run-by-hand script (no scheduler wiring needed this task).
   - This week's window: read `public/framework/ai/usage.json`'s
     `utilization.seven_day.resets_at` minus 7 days (fall back to the last Monday 00:00 if that
     file is missing).
   - Claude $: scan every `page.jsonl` under `public/framework/ai/<year>/<month>/<day>/*/` whose
     day falls in that window, sum every `cost.total_usd` (take the LAST `cost` line per file —
     it's a running total, same convention as `task-cost.mjs`'s agent log reading).
   - OpenRouter $: reuse `Servex/ext/openrouter/reconcile.mjs`'s `OR_LOG_PATH`, sum `cost_usd`
     across lines in the window (real $, already billed — don't re-derive, just sum).
   - Write `public/framework/ai/sessions/week.json`:
     `{ claude_usd, openrouter_usd, plan_usd: 200, plan_pct_used (usage.json's seven_day.utilization),
     usd_per_pct: claude_usd / plan_pct_used, top: [ up to 10 { session, usd }, largest first ],
     small_usd (sum of the rest), as_of: ISO }`. A note in the file/comment: this is a point-in-time
     snapshot from a manual run, not live — the page below says so too.

4. **Extend `public/framework/ai/sessions/page.js` + `sessions.css`** (inside the hold — see top):
   - Cost column header becomes clickable: toggles sort by cost (missing/null sorts last),
     clicking again reverses it, a third state returns to the default (newest-activity-first).
     Simple state on `this`, redraw `$rows` the same way `activated()`'s `draw()` already does.
   - State cell: an in-flight/working Servex row gets a small blinking green ▶ (CSS animation;
     wrap it in `@media (prefers-reduced-motion: reduce)` to disable the blink, keep the icon
     static). Idle/dormant rows get a plain quiet dot, same as today. No checkmark here (the
     owner's own words: that belongs only on the detail page, which this brief doesn't need to
     add since "done" isn't shown in this grid).
   - Add a RAM column (`COLUMNS` + `--col-ram`, min ~64px): show `r.ram_mb` + "MB" only when
     `r.ram_sample_age_ms` exists AND is under 10000; otherwise render nothing in that cell (never
     a stale number). If `GET /api/agents` doesn't carry RAM data yet, still add the column and
     the check — it will just stay blank until Servex adds the field. Note that as an open
     dependency in `doc/decisions.md`, don't fabricate a number.
   - Cost cell: if the row carries `cost_claude_usd` and/or `cost_openrouter_usd` (new, optional
     fields — add them to `merge()`'s output shape, defaulting both to null), show Claude $ in the
     existing muted style and OpenRouter $ beside it with a small "OR" tag in a different color
     (pick one that passes contrast against both themes — check `framework/design/color`'s tokens,
     don't invent a new color). Fall back to the existing single `r.cost` rendering when neither
     new field is present, so every currently-live row keeps working unchanged.
   - A small line above the grid (in the Panel2 header, beside "live — polls every 20s"):
     fetch `this.url + "week.json"` once in `activated()` (degrade silently on a 404 — the script
     may not have been run yet) and show e.g. "$12.40 Claude · $1.05 OpenRouter this week, plan
     55% used — ~$0.23/1%".

5. **Extend the detail page** (`session_page()` in the same file): `load_transcript()` already
   fetches the snapshot + a transcript file. Add a third fetch of the SAME session's
   `page.jsonl` (reuse whatever path pattern `week-cost.mjs` above already searches with, factor
   it into one shared helper if that's easy, otherwise duplicate the one-line glob — don't import
   across a server-script/browser-page boundary, this is a static site). If it has a `cost` line,
   show a compact row per logged prompt above/beside the existing prompt list: time, input/output
   tokens, $. Keep the existing "no transcript yet" message untouched for sessions that have
   neither a transcript nor a cost line.

6. **Docs pass.** Update `ai/sessions/readme.md` (what's new, one line each) and
   `ai/sessions/doc/asks/decisions.md` (append, don't rewrite — two open items: RAM waiting on a
   Servex field, week.json being a manual snapshot not yet scheduled).

7. **Owner addition (fold in, same brief, don't split into a second minion):**
   - **Every row carries its role** (fast assistant, smart assistant, vscode mastermind, Servex
     mastermind, task mastermind, minion, reviewer, clarity, echo/refiner, fixer…). For a Servex
     row, read it straight from the registry (`GET /api/agents`'s own `role` field — it's already
     there, see `Server/task-cost.mjs`'s `row(id).role`). For a VS Code/CLI row (no Servex role),
     best-effort from what's already on hand, never a guess dressed up as data: an `id`/`tab`
     starting `echo-` → "echo/refiner"; a task's own line-1 `group` naming "every-prompt" or
     similar → "fast assistant"; otherwise fall back to the existing source tag ("vscode
     mastermind" / "cli") rather than inventing a role. Note this heuristic plainly in
     `doc/decisions.md` as a known gap — a real role needs the session's own line 1 to record it
     going forward, which is outside this task's fence.
   - **Filters:** a multi-select role filter (checkboxes or a small chip row above the grid — reuse
     whatever selection control pattern is already common on this site before inventing one; a
     plain `<label><input type=checkbox>` row is fine if nothing reusable turns up quickly) plus a
     date-range filter defaulting to the last 30 days. Both filter client-side over the already-
     fetched rows (no new endpoint).
   - **A summary row for whatever is filtered:** total Claude $, total OpenRouter $, session count
     — recomputed from the filtered set, shown once above the grid (reuse the small "this week…"
     line's spot, or right beside it).
   - **A "by system" view:** cost per role, largest first — a second small compact list (reuse the
     grid's own row styling at a smaller scale, don't build a new table), so a role eating most of
     the spend stands out. Can live right below the summary row, same page, no new route needed.

## Prove it, then land

- Run `node Server/session-cost.mjs 355eb7ba-ed23-46bb-ab6f-77c073a23571` and log its `total_usd`.
- Run `node Server/week-cost.mjs` once and confirm `week.json` is written with sane numbers.
- Headless-check `/framework/ai/sessions/` and one detail route at 1920 (zero console errors)
  before releasing the hold.
- Commit every file by its exact path (never `-A`). Log a line in THIS task's `task.jsonl`
  (`public/framework/ai/sessions/2026/10/02/session-costs/task.jsonl`) when done, then stop — the task
  mastermind reviews and lands.
