# Minion brief: the AI dashboard's Dashboard + Sessions tabs — Part 2 of panel2-sessions

Part 1 is merged into `michael/dev` (ext/panel2, and core/Page/ext/Inbox restructured into
`Inbox.Rail` / `Inbox.Compact`). Your worktree branch has been synced with `michael/dev` — pull
if you resumed from an older state. Load the `minion` skill first, then `page` (you're building a
view) and `code`.

Task directory (read the parent's task.jsonl and the full brief before you start):
`public/framework/ai/2026-10-02/panel2-sessions/` — `requirements.md` there is the owner's
original words for the whole task.

Fence: `public/framework/ai/` only — a new `public/framework/ai/sessions/` folder and a new
`public/framework/ai/dashboard/` folder (the two new tabs), plus edits to `public/framework/ai/
overview.js` and `public/framework/ai/page.js` (read both whole first — dense, hot files other
agents may also touch; check `git log michael/dev -1` hasn't moved under you before editing
either). Do not touch `ext/panel2` (done — read its readme, don't edit it), `ai2/` (reference
only), or `core/Page/ext/Inbox` (done — use `Inbox.Compact`, never fork it).

## The owner's plan — TWO messages, read both; the second REPLACES "Overview = grid"

**First (original brief, still the "why"):** a time-based Sessions list, one preview card per
session (VS Code tab, Servex agent, or CLI), newest first, click opens its prompts in order. "For
this VS Code tab I should be able to see that with a tag that says VS Code on it." A compact Inbox
and the Log "next to it, in a responsive way... the flex-wrap way... or automatic grid."

**Second (mid-task correction — build THIS tab shape, not a plain "Overview grid"):**
- **Overview** (existing tab, keep its name): quick links — every AI page and its main sub-pages,
  laid out hierarchically with icons. This is a navigation index, not a data dashboard — closer
  to what `overview.js`'s System tab already looks like than to a grid of live tiles.
- **Dashboard** (a NEW tab, separate from Overview): a grid of preview tiles, each titled with
  what it is:
  - **Inbox** tile — top 5 items only.
  - **Log** tile — top 5, with anything already shown in the Inbox tile removed (no duplicates).
  - **Sessions** tile — see below.
  - **In flight + queued** tile — tasks currently building or queued, each with a progress bar.
  - **Stalled** tasks tile — shown FIRST among the tiles (stalled is top priority). A sibling
    task, `stalled-and-budgets` (owned by another mastermind), computes this: it writes
    `public/framework/ai/tasks.json` with one row per task from the last 7 days — `{dir, title,
    agent, card, brief, budget, spent, started_at, last_line_at, landed, state}` where `state` is
    `landed | building | stalled | snoozed | killed`, plus a score/`why` for ordering (stalled
    highest). **Check this task's own `task.jsonl` / card for a message from that mastermind
    naming the final field list before you build against it** — it said it would send one. If
    `tasks.json` doesn't exist yet when you get here, build the tile to read it defensively (empty
    state: "no data yet") rather than inventing your own stalled-detection logic — law 6, don't
    build a second version of what that task already owns. The same file gives you "in flight +
    queued" (`state: building`, show the ones with no `landed_at`) and lets Stalled and In-
    flight/queued be two thin views over one JSON file, not two separate computations.
  - Each tile links to its own full view (Inbox → the Inbox tab, Sessions → the Sessions tab,
    etc). On 3440 tiles may grow larger — **do not** put two full-screen views side by side; this
    is a grid of compact previews, not a split-screen.
- **Inbox** stays its own tab, unchanged (full list, not just top 5 — that's the Dashboard tile's
  job).

Build **Dashboard** as described above. Do not build a grid version of **Overview** — leave
Overview as a quick-links index (if it isn't already close to that, a light pass to add
hierarchy + icons is in scope, but don't turn it into live tiles — that's Dashboard's job now).

## What to build, in order

1. **The Sessions tab**: a real folder, `public/framework/ai/sessions/`, with `page.jsonl`
   containing `{"settings":{"tab":true,"weight":<after the existing ones>}}` so `detect_tabs()`
   in `overview.js` picks it up automatically (don't hand-edit the tab list). One preview card per
   **session that has an id**, newest activity first, live (poll — model `ai2/agents.js`'s
   `all_agents()`: fetch, cache ~10-30s, redraw only on change, stop polling when `document.
   hidden`). Covers THREE kinds, each with a visible **source tag**: `VS Code`, `Servex`, `CLI`.
   Each card: source tag, agent id or VS Code tab title, model, state (working/idle/dormant/
   stopped), the last prompt's first line, the time, cost if known. Click → that session's own url
   (e.g. `/framework/ai/sessions/<id>/`) showing its prompts in order — **prompts live inside
   their session, never as a separate log page.**
2. **Data for Sessions**: check this task's `task.jsonl` / card for whether `mastermind-servex-9`
   built the `GET /api/sessions` route this mastermind asked for (Servex/agents inbox note,
   2026-10-02). If yes, fetch it (model `ai2/agents.js`'s pattern: `servex_base()` +
   `servex_fetch()`, cached, polled). If no route exists yet, write a small standalone script
   instead (`public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs`):
   - Servex rows from the existing `GET /api/agents` (session_id, role, model, state, cost — tag
     `source: "servex"`);
   - scan `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` for session ids not
     already covered — read each file's last few lines for the latest timestamp and the most
     recent `"role":"user"` message's first line; tag `source: "vscode"` for an interactive
     session, `"cli"` for a one-shot (document the heuristic);
   - write one JSON snapshot; run it from wherever is less code (a dev-only `Server/` route, or
     the page refetching a file the script regenerates on an interval) — say which, and why, in
     the Sessions tab's own short note or the task readme.
   - **Verify end to end** on this VS Code mastermind's own session,
     `361c4d18-e878-4c04-9537-444e847e13d5` — it must show up tagged `VS Code` with a real last
     prompt line. If it doesn't, the script is wrong; fix before moving on.
3. **The Dashboard tab**: a real folder, `public/framework/ai/dashboard/`, tab-detected the same
   way, weighted to sit near the front (after Inbox, before or after Log — your call, say why).
   Built as ONE Panel2: `header` is a full-width slim toolbar (title left, controls right — this
   can be the page's existing `.inbox-head` strip redrawn as a Panel2 header, or a new one; keep
   whatever title/tabs shape `ai/page.js`'s `content()` already has), `main` is a `.panel2-grid`
   (Part 1's responsive grid — read `ext/panel2/readme.md`) holding five tiles: Stalled, In-
   flight+queued, Inbox (top 5), Log (top 5, inbox items removed), Sessions. Each tile can be its
   own small Panel2 (so it gets its own mini toolbar) or a plain `.surface` card — pick the
   simplest that satisfies "each titled with what it is."
   - **Inbox tile**: `new Inbox({ page: this }).compact` (Part 1b's new API), sliced to 5 items —
     check `Inbox`'s data shape first; if it doesn't expose "top 5 by score," that's a reasonable
     small addition to `Inbox` (lives in `core/Page/ext/Inbox`, which is outside your fence — ask
     `task-mastermind-inbox-ext` via `drop("/framework/ai/", "...")` before editing it yourself,
     or filter/slice the compact view's own list from your side if that's enough).
   - **Log tile**: reuse the existing Log tab's render (read `tab_page()` in `overview.js`), top 5,
     with inbox items filtered out by id.
   - **Sessions tile**: the same card list/render as the Sessions tab (one function, two mounts).
   - **Stalled / In-flight+queued tiles**: read `public/framework/ai/tasks.json` if present (see
     above); each row a tiny card with a progress bar for in-flight/queued (`spent`/`budget` or a
     generic indeterminate bar if no budget), and the `why` string for stalled ones. Empty/missing
     file → one quiet "nothing yet" line, not an error.
4. Keep Overview's own content as a quick-links index (light touch only, see above).

## Rules

- Reuse, never duplicate (law 6): `Inbox.Compact`/`Inbox.Rail`, the Log tab's existing render,
  `ext/grip`, `ext/panel2`, `tasks.json` (once it exists) — wiring, not rebuilding.
- No build step, resolve urls against `import.meta`, every CSS rule in a layer.
- This mastermind is at its 2-minion cap for this task (you and the Inbox-restructure minion
  already ran) — you're being resumed/revived for this, not a fresh 3rd minion. Pull the worktree
  branch (now synced with `michael/dev`) before you start.
- When done: `node Server/layout-check.mjs <Dashboard tab + Sessions tab + one session's
  transcript url + Overview tab> --widths 400,1200,1920,3440`, read every shot yourself band by
  band — a tile row that wraps badly or a title on two lines is a fail to fix now.

## Report back

To `task-mastermind-panel2-sessions`: the Dashboard tab url, the Sessions tab url, which data path
you used for Sessions and why, whether `tasks.json` existed yet (and what the Stalled/In-flight
tiles show if not), and the layout-check results at all four widths.
