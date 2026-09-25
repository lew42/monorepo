# ai2-cost-fill — cost on AI 2, honest per-task cost, detail pages that fill the page

Task mastermind: `task-mastermind-ai2-dashboard`. Group: `ai-log` · inbox group `ai-dashboard`.
Lean: ONE minion (`minion-ai2-cost-fill`), which loads `minion`, `code`, `layout` and `css` first.
Never write the owner's name.

## The owner's words (verbatim, relayed)

> "What took so many tokens? I want to see token cost on the AI dashboard previews and detail
> pages. The detail pages are still too small: they should fill the rest of the page area, and
> only content/flow should use --measure."

## Deliverables

1. **Cost on AI 2.** Every group preview and every card preview on `/framework/ai2/` shows its
   dollar cost (a group = the sum of its member tasks, each counted once). A card's detail page
   shows the breakdown: mastermind vs minions, **per agent, with its model**. Numbers come from
   `Server/task-cost.mjs` (registry rows now carry `model`).
2. **Fix the double-counting, by time.** Today a follow-up task that reused its parent's
   session shows the parent's WHOLE total (agent-chat, live-card-wide, live-preview, live-reply
   all show $15.63; task-audit shows loose-ends' $49.93). New rule: a task's own cost = the root
   agent's running cost at the task's END (its `landed_at`, or now if still open) minus its
   running cost at the task's START (line 1 `requested_at`). The result lines in
   `%LOCALAPPDATA%\lew42\servex\logs\agent-<id>.jsonl` carry `at` + the running `cost` (restart
   banking still applies). **A minion counts toward the task that was open on its root when it
   was spawned** (its registry `started_at` falls in [start, end) of that task; if two overlap,
   the later-started one). Then every dollar is counted once and `parent_task` is no longer
   needed for these (keep the field for true sub-trees; say in the doc what changed).
   Extend the contract ADDITIVELY: `cost.agents: [{ id, model, role, usd }]`,
   `cost.window: { from, to }`. The existing view (`ext/AITask/cost.js`) must keep working.
   Re-run for 2026-09-24 on the main tree (the only main-tree writes) and show the before/after
   table for those six tasks.
3. **Detail pages fill the page.** On `/framework/ai2/`, the card/detail column takes ALL the
   remaining width and height beside the rail (and the sub-card column when it's open). Only
   running text and flow content is capped at `--measure`; wide things (tables, screenshots, the
   steps bar, the embedded task page's sections, code) use the full column width. Scope every
   rule under AI 2's own classes — no change to `framework.css`, `styles/`, or the standalone
   task page at `/framework/ai/<date>/<slug>/` (its look must not change: before/after shot).

## Merge carefully, never clobber

Screenshots BEFORE (live site, now) and AFTER (worktree) at **1280, 1920 and 3440** of:
`/framework/ai2/`, a group card (`/framework/ai2/2026/09/24/system-design/` or whatever url the
rail opens it at), a task card, and one standalone task page (`/framework/ai/2026-09-24/live-card/`).
Plus the padding/gap guard: `node <scratchpad>\ai2d-guard.mjs <label> --base <url>` then
`node ai2d-guard.mjs diff <a> <b>` (scratchpad = C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\d9998734-afb3-4d6e-91dd-751915708bd4\scratchpad),
and `MSYS_NO_PATHCONV=1 node Server/padding-check.mjs /framework/ai2/ --base <url>`.

## Fence

`Server/task-cost.mjs`, `Server/doc/task-cost.md`, `public/framework/ai2/**`,
`public/framework/ext/AITask/cost.js` + its doc. NOT `Servex/`, `live.js`/`.ai2-card-live*`
(live-card's), `framework.css`, `styles/`.

## Where

Worktree `C:\Code\lew42\worktrees\ai2-cost-fill`, branch `worktree/ai2-cost-fill`; its server
port is in your first message. Headless Playwright only (global:
`await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs")`).
Scratch in the scratchpad, named `cf-*`. The worktree lacks untracked live data (today's task
dirs, card folders): to see real data there, copy them in as UNTRACKED files and never commit
them; delete them before your last commit.

## Reply

One short paragraph: the before/after cost table for the six tasks, what shows where, the shot
folder, guard + padding results, the commit hashes. Your mastermind merges.
