# Report: mobile variant, ready to merge (not merged)

**Branch:** `worktree/mobile-picks`, 10 commits ahead of `michael/dev` (dev merged in twice; merges cleanly). Smoke passes; Task tests 58 of 58.

## URLs (under `/framework/ai/sessions/v/mobile/`)
1. `` and `<yyyy>/<mm>/<dd>/`: day list
2. `all/`: nested sessions (same date header as the Day tab; today by default; `?days=` and `?end=` still work)
3. `e00f55c9-bad4-4ee2-899e-d629ea1eede6/`: session page
4. `e00f55c9-bad4-4ee2-899e-d629ea1eede6/sessions-and-tasks/`: task detail

## Shots
`../shots/`: day-400, nested-400, session-400, task-400, run-indicator-400, day-1200, nested-1200, session-1200.

## Reused
`AISessionsPage`, `AISessionDetail` (with its `head_tools()` session menu), `SessionTree`, `AISessionConversation` and `AISessionFollow` (Chat), `TaskView.draw_bar` (the one bar), `TaskPage` and the Task verbs (run buttons).

## Changed outside `v/mobile/`
- `AISessionsPage.route()`: the name `v` goes to the variant (the one exception).
- `TaskView.draw_bar` and `TaskView.css`: amber pulsing running, red blocked.
- `styles/css-scopes.txt`: `mob-`.
- `sessions/v/page.js`: new page linking mobile.
- `sessions/doc/mobile-cards.md`: link from "Next".

## Readmes now out of date
`core/Task/readme.md` (bar states, static `draw_bar`), `sessions/readme.md` (the `v/` folder and the `route("v")` exception), `mobile-cards.md` "Next".

## Not verified
- Run buttons were never pressed (they would write into real task logs). They are `TaskView.VERBS`, filtered by `Task.can(state, verb)`, and a press calls `task.act(verb)`, which saves the verb line. "Next" assumes a series parent.
- Chat shows "No transcript" because `/ai-logs/` returns nothing for that session on this server.

## Sessions with no parent link (before the tree was rebuilt)
f6ab074a, 97f36736, a267d87a, cdbe8d65, e00f55c9, 037b7c00, 8d452ffd. Re-check after `session-summary.mjs --index`; the nested page says "No parent links recorded for this day" when none exist.

## Nested page: pairs now nest (no code filter was at fault)
The worktree's `sessions/2026/10/22/index.json` was a stale gitignored copy I made earlier (28 snapshots, none of the new sessions). With the main tree's copy (49 snapshots) and the rebuilt `session-tree.json`, `v/mobile/all/` shows "49 sessions" and nests `mobile-picks` under `Figma cards` ("+1 minion") and `item-act` under `item`. The header counts all 49; the list shows 47 top rows because 2 are children inside a parent. No filter in `rows()`, kind or the by_id check is deliberate; a child whose parent is not in the list still stays at the top. Shot: `shots/nested-400.png` (a parent opened).
