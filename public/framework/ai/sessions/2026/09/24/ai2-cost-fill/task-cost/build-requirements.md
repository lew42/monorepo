# Build brief — dollar cost per task

Parent: `task-mastermind-ai2-dashboard`. Load the `minion` skill first (and `code` before JS under public/).
Read [`requirements.md`](./requirements.md) first — the owner's words and what is already true.

Worktree: `C:\Code\lew42\worktrees\task-cost` (branch `worktree/task-cost`), its server at
`http://127.0.0.1:62634`. Work and commit ONLY there. Headless Playwright only (global:
`await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`).
Scratch scripts in the session scratchpad named `tc-*.mjs`. Never write the owner's name.
⚠ The worktree has NO untracked live data: `public/framework/ai/**/task.jsonl` files that are
not committed are absent there. Test the tool against the MAIN tree's task dirs READ-ONLY
(`--dry`), and test the view with fixtures you commit under the worktree only if they live in
your fence (or by running the tool with `--root C:\Code\lew42\worktrees\task-cost` on copied dirs
in the scratchpad).

## The shared contract (both minions build to this; neither changes it)

One line appended to a task's `task.jsonl`:

```json
{"assign": {"cost_usd": 12.3456, "cost": {"root": "task-mastermind-live-card", "agents": 7, "own_usd": 6.59, "minions_usd": 5.75, "parent_task": null, "open": 1, "at": "2026-09-24T18:10:00-05:00"}}}
```

- `cost_usd` — the task's root agent plus ALL its descendants (registry `parent` links), in USD.
- `cost.root` — the Servex agent id the task maps to. `agents` — how many agents were summed.
  `own_usd` — the root alone; `minions_usd` — the rest. `open` — how many of them are still not
  `stopped` (the figure can still grow). `parent_task` — the `<date>/<slug>` of another task
  whose root agent is an ANCESTOR of this one's (then that task's figure already includes this
  one; a group/day total must not count it twice), else null.
- A task that maps to NO Servex agent (a tab, a CLI session) gets NO line. The view shows
  **"not tracked"** whenever `cost_usd` is absent — never `$0`.
- Later lines win (`assign` merges), so re-running appends a fresh figure; the tool appends only
  when `cost_usd` or `open` changed.

## Minion A — the tool (`minion-tc-tool`)

Fence: `Server/task-cost.mjs` (new), `Server/doc/task-cost.md` (new). Nothing else. Never edit `Servex/`.

- `node Server/task-cost.mjs <task-dir>` · `--date 2026-09-24` (every task dir that day) ·
  `--dry` (print, append nothing) · `--root <repo>` (default: the repo the script lives in).
- Mapping: task.jsonl line 1 `assign.session_id` → registry row with that `session_id`; fall back
  to `assign.tab` === row `id`. Registry: `%LOCALAPPDATA%\lew42\servex\registry.json` (inspect its
  shape first). Agent cost: `logs\agent-<id>.jsonl`, lines with `type:"result"` and `cost`. The
  cost is a RUNNING total within one process: take the last value, but if a value is smaller than
  the one before it, the process restarted — bank the previous and keep adding.
- Append with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` (write the json file
  first; `"at": "NOW"` gets stamped).
- Prove it: `--dry --date 2026-09-24` on the main tree prints one row per task: slug, root,
  agents, own, minions, total, open, or "not tracked". live-card, md-pages and loose-ends must
  show totals with minions > 0. Then, for real, append to those three in the MAIN tree ONLY
  (`--root C:\Code\lew42\monorepo`) — that is the proof the owner asked for. No other main-tree writes.
- `Server/doc/task-cost.md`: what it does, the mapping, the running-total rule, when to run it
  (at landing and any time after — it is idempotent). Plain sentences.
- Reply: the dry-run table for today, and the commit hash.

## Minion B — the view (`minion-tc-view`)

Fence: `public/framework/ext/AITask/**` and `public/framework/ai/page.js` / `public/framework/ai/*.js`
(the day page and board modules, NOT any dated task dir). Grep first: there is already a
`cost` column in `ext/AITask/AITask.js` (~line 317, 331) — build on it, don't add a second one.

- **Every task card** (the day page / board) shows the dollar figure (`$12.35`), or a muted
  "not tracked" when `cost_usd` is absent; `open > 0` adds a small "+" or "so far" so a growing
  figure isn't read as final.
- **The day page** shows the day's total: the sum of its tasks' `cost_usd`, skipping any task
  whose `cost.parent_task` is set (already counted), with "N tasks not tracked" beside it.
- **Per group/project**: wherever tasks are grouped by `group`, the group shows the sum of its
  tasks the same way.
- **The task's own page** (AITask detail) shows the breakdown: root, own, minions, agents.
- Keep it one small line each; no new visual clutter. Reuse existing classes; new classes go through
  the `new-css-class` skill. No change to `framework.css` or `styles/`.
- Test with a fixture: copy two real task dirs with a cost line into the worktree only if they
  are inside your fence — otherwise build a demo in `ext/AITask/page.js` (its existing fixtures
  at ~line 24 are the place). Shots at 1280 and 1920 of the day page and a task page; zero console errors.
- Reply: what shows where, the shots' paths, and the commit hash.
