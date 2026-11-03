# Session report tab: real cost, children and counts

Budget: $6. Load the `minion` skill first, then the `page` skill.

## Why

The sessions-pages shot report, [sessions-shots/report.md](../../sessions-shots/report.md), cause **E**, found two problems:
- The report tab of session-e00f55c9 (`/framework/ai/sessions/2026/10/20/session-e00f55c9/`) shows only "Cost: not tracked" and a table of dashes, with 0 agents.
- The `2026/` and `2026/10/` pages list task folders (08/12/apps, 01/chat-autoscroll) in their side columns instead of sessions.

The item tool now answers a session's real cost (about $915), its children and its counts: `item({path})` with the queries `summary`, `children`, `total_cost` and `progress` (session-data, merged 2026-10-23 20:46). See `public/framework/core/Task/readme.md`.

## What to do

1. **Report tab.** Find where it draws "Cost: not tracked" (`public/framework/ai/AITask/AICost.js:114` is the likely spot).
   - Make the tab read the same numbers the item tool answers, through the class that computes them (`Task.summary()` / `total_cost`). Copy no number by hand (CLAUDE.md law 7).
   - It should show the total cost (own and rolled up), the child sessions and tasks with their states, and the counts (complete of created, open).
   - Where a number really is unknown, say why in words, never with a dash.
2. **Year and month columns.** First reload `2026/` and `2026/10/` on current `michael/dev`. mastermind-page's nav-rule landed at cdf00bb25 (previews plus full detail views, Miller columns now opt-in), so this may already be fixed.
   - If they still list task folders, make them list sessions.
   - The owner has dropped Miller columns, so add no column layouts.
3. **Re-shoot** each row of the report that concerns these two problems, at 400, 1200, 1920 and 3440, into `session-report/shots/`. Name each shot the way the report names it.

## Deliverable

- A branch, `worktree/session-report`, made with `node Server/worktree-up.mjs session-report`, or the pool worktree Servex gives you. Commit at every working step.
- One `show:` line in your `session.jsonl`: the before and after numbers for the report tab (cost, children, counts) and the shots.
- Then `ready: worktree/session-report <sha> <one line>`, and stop.

## Fences

- **Yours:** `public/framework/ai/AITask/AICost.js` and whatever AITask file draws the report tab, plus the year and month session pages' listing code if step 2 needs it.
- **Not yours:**
  - `public/framework/ai/AISession/AISessionDetail.js`, `SessionWork.*` and `public/framework/ai/merge/*`, which other agents are editing right now.
  - `core/Page/*` and `core/Router/*`, which belong to mastermind-page. Send it a message if you need a change there.

## Never

Never kill or restart the dev server. Never drive the owner's tabs. Never `git stash`. Run `node --check` on every file you touch. Findings go in your `session.jsonl` as `log` lines.
