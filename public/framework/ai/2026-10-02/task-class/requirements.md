# Task class, page weight sorting, AI cost per page (roadmap 16, 10, 10b)

**Owner update, mid-flight (vscode-mastermind, 2026-10-02): don't wait for the weekly reset.
Combine queue items that touch the same code (Page/Item) and ship each as its own small MVP
merge, rather than one at a time.** This brief now covers three roadmap rows that all read or
write a page's own `page.jsonl`/`weight.jsonl` through Item/Page: **16** (the Task class below),
**10** (`page.pages` sorts by weight by default — `core/Page/weight/weight.js` already computes
the number, it's just not wired into sort order), and **10b** (a node script sums `cost_usd`
across task logs and writes `{"ai_cost": {...}}` onto each page it touched). Do them as **three
separate small merges**, in this order (16 first — it's the biggest and least coupled to the
other two; 10 and 10b are both quick once you're warm on `weight.js` and `Page.class.js`'s sort
seam). Don't let scope creep between them — three PRs, three landings, three outcomes.

**Model:** you are running on an OpenRouter minion (`google/gemini-3.8-flash` by default;
`deepseek/deepseek-v4-pro` only for a simple fenced text edit, never on anything with an image).
Work fast, land small, don't over-engineer. After each of the three merges, say so on your task
log (`assign`/`log` lines) so a second-opinion review can run against that specific diff before
the next one starts.

---

## Item 16: a real `Task` class (core/Task)

Owner's ask (roadmap, `ai/2026-10-02/roadmap/requirements.md` item 16): a DOM-free `Task` class
that runs in node too — id, title, state (idle / running / paused / stopped / finished),
`start() pause() resume() stop(why) finish({complete})`, timestamps and a computed duration,
`tasks: List` of subtasks; progress computed from the subtasks; `finish()` refuses while a
subtask is open ("finish step 4 first"). `AITask extends Task` then adds the brief, asks, agents,
sessions, cost vs budget, review and approval.

## Scope for THIS pass — the base class only (Law 1: fastest working version first)

Four pieces are said to fold into Task/AITask eventually: `ai/objects.js`'s display-only `Task`
(a chip/row/panel view, `AIObject` subclass — different job, not a data model), `ext/AITask`'s
`AITask extends Page` (the five-tab task PAGE renderer — a dozen+ `page.js` files construct it),
`ext/JSONL`'s `TaskJSONL` (the manifest reader those tabs read from), and `ext/AITask/nested.js`'s
`TaskTree`. Folding all four into one merge is surgery across every task's `page.js` — too big
for one pass and risks breaking every live task page mid-flight. **This brief builds the new
`core/Task/Task.js` class, proven on its own, and leaves the existing renderer untouched.** The
rename/fold of the other three happens in a follow-up pass once Task is live and trusted —
name it in your outcome as the next step, don't attempt it here.

## Build

`public/framework/core/Task/Task.js` — `class Task extends Item` (core/Item/Item.js is landed;
read its readme first, and core/List/List.js — merged with LiveList 2026-10-02, there's one
class now). Follow the class/file/folder name rule (capitalised, `code/patterns`).

- **State machine:** `state` one of `idle | running | paused | stopped | finished`. Starts `idle`.
  - `start()` — idle/stopped → running, stamps `started_at` (first time only).
  - `pause()` — running → paused, stamps nothing extra (no `paused_at` list needed — duration
    math must still work, see below).
  - `resume()` — paused → running.
  - `stop(why)` — any non-finished state → stopped, stamps `stopped_at`, records `why`.
  - `finish({complete} = {})` — **refuses while any subtask in `tasks` is not finished**: don't
    throw, warn like `Item.locate` does ("finish step 4 first", naming the first open subtask's
    title) and return `this` unchanged. Otherwise → finished, stamps `finished_at`.
  - Every transition goes through `set()` (so it is one delta line, replayable, and emits
    `change`/`delta` the way `Item.set_one` already does) — don't hand-roll a second emit path.
  - An illegal transition (e.g. `pause()` while `idle`) warns once (`Item`'s own `warn` pattern)
    and is a no-op, never a throw.
- **Timestamps + computed duration:** store `started_at`, `stopped_at`/`finished_at` as ISO
  strings. `duration()` sums RUNNING time only (pausing stops the clock) — track this with a
  small running total plus "when the current running span started", not a naive
  `finished_at - started_at` (that would count paused time as duration).
- **`tasks: List` of subtasks**, owned the way `page.pages`/`page.content` are (see
  `core/Item/Item.js`'s `lists()` — anything in `this` that is a `List` with `owner === this`
  is found automatically; no extra wiring needed beyond creating the property).
- **Progress is computed, never stored** (CLAUDE.md law 7: compute, don't recall) — a method
  (`progress()`) returning something like `{done, total}` from `tasks`' own states (a subtask is
  "done" once `finished`). Empty `tasks` → whatever a task with no subtasks should sensibly
  report (your call — say what you picked and why, one line, in the outcome).
- **Register it:** `Item.register(Task, "Task")` so it hydrates correctly from a `type: "Task"`
  line, the same as every other registered class.
- **No DOM at import time** — this file must be importable from plain `node`, like
  `core/Item/Item.js` already is. Don't import `core/View` or anything that touches `Element`.

## Prove it (show, don't tell — CLAUDE.md "Presentation")

A live demo beats a description. Build `core/Task/live/page.js` (a real declared child, the way
`core/Item/live/` already demos Item — read that page first and follow its shape) that:
- Creates a `Task` with two or three subtasks.
- Lets you start/pause/resume/stop/finish it and each subtask from the page, live, no reload.
- Shows the computed `progress()` and `duration()` updating as you interact.
- Tries to finish the parent while a subtask is still open, and shows the refusal happening (not
  just describes it) — e.g. a message appears where the attempt was made.

A `.test.mjs` next to `Task.js` (node, no DOM) covering the state machine, the subtask-blocks-
finish rule, and duration math is welcome alongside the live page, not instead of it.

## Docs

`core/Task/readme.md` (the module's index, the shape above with the `readme-shape` convention —
what it is Β· use Β· watch out Β· more) and update `core/readme.md`'s own index line to list Task
among the seven-ish core classes. Run the `documentation` skill before landing.

## Land

One small merge: `core/Task/Task.js`, `core/Task/Task.test.mjs` (if you add it),
`core/Task/live/page.js`, `core/Task/readme.md`, the one-line addition to `core/readme.md`. Check
the live demo at the four review widths (400/1200/1920/3440 — `merge.mjs`'s gate) before landing.
Land on `michael/dev` the normal way (worktree → smoke → `merge.mjs` → return). Budget: $8.

## Out of scope — say so, don't attempt

- Folding `ai/objects.js` `Task`, `ext/AITask/AITask.js`, `ext/JSONL`'s `TaskJSONL`, and
  `ext/AITask/nested.js`'s `TaskTree` into this class — next item, after this one is trusted.
- `AITask extends Task` (adding brief/asks/agents/cost/budget/review/approval) — same, next pass.
- The `task_step_start`/`task_step_done` tools mentioned in the roadmap row — a separate tool-
  building task for whoever owns Servex tools, not this one.

---

## Item 10: `page.pages` sorts by weight by default

Read `core/Page/weight/readme.md` and `weight.js` first — the number (`1 + distinct referrers +
manual`) is already computed, live, at `/framework/core/Page/weight/`. What's missing: wiring it
into the DEFAULT order of `page.pages` (the List of sub-pages, `core/Page/Page.class.js` /
`core/List/List.js` (merged with LiveList 2026-10-02)).

- **Ids stay stable — this is display order only, never a rewrite of the list's own
  add/after order.** Don't touch how `add`/`move`/`order` store things; add a read path (e.g.
  `page.pages.sorted_by_weight()` or a `{order: "weight"}` option wherever pages are currently
  iterated for a nav/listing) that computes each child's weight (await `weight(child.url)`,
  there's a cost — cache per page load, don't refetch on every render) and returns them heaviest
  first, ties broken by the existing order.
- **Where this actually shows up:** wherever `page.pages` is walked to build a nav list or an
  index wall today (grep for `.pages` iteration in `core/Sidebar`, `core/Page`, any `browse()`/
  index page). Wire the DEFAULT call site(s), not every possible future reader — say which ones
  you changed.
- A live proof: an index page with 3+ sub-pages of differing weight (use
  `node Server/page-refs.mjs <to-url> --weight <N>` to fake a difference), screenshot or shot
  showing heavy-first order.
- Land small: this should NOT touch Task.js or core/Task/ at all.

## Item 10b: an AI cost on every page

A node script, `Server/page-ai-cost.mjs` (follow the existing `Server/page-refs.mjs` and
`Server/task-cost.mjs` as the two closest patterns — read both first): walks every
`ai/<date>/<slug>/task.jsonl`, sums each task's `cost_usd` (already written by
`Server/task-cost.mjs` — don't recompute cost, just redistribute it), and for every page folder
an `action` line's `files` touched, splits that task's cost evenly across the distinct page
folders it touched (CLAUDE.md law 7: compute, don't recall — this is exactly that kind of script,
never a hand-written number). Write one line per page: `{"ai_cost": {"usd": N, "tasks": N,
"at": "<iso>"}}` onto that page's own `page.jsonl` (same file weight.js falls back to, same
convention as the `weight` manual line).

- The page header (wherever a page's chrome is drawn — `core/Page` — check how `weight` or
  similar per-page facts are shown today, if anywhere, and follow that) shows "$N.NN of AI work ·
  M tasks", linking to `/framework/ai/log/` filtered to that page's folder (a query param is fine
  for a first pass — say what you used).
- Run the script once over today's real logs and show the real number on one real page's live
  demo screenshot — prove it, don't just ship the script unexercised.
- Land small: this should NOT touch Task.js, core/Task/, or weight.js.

## Review

After each of the three lands, post one line on this task's log naming the commit and the diff
(`git diff <sha>^..<sha>`, or point at `review/diff.patch` if `merge.mjs` wrote one) so a second
Gemini Flash pass can review it against this brief before the next item starts. Don't wait for
that review to start the next item — land, log, move on; the review catches problems after the
fact, it doesn't gate you.
