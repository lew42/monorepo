verdict: pass
1. [note] `/framework/ai/asks/undone/` did not become a saved filter (requirement 2 asks for all three pages). Only a link to `?kind=ask` was added. `plan.md` gives the reason: `undone.json` holds 1167 asks but `state.asks` folds only 87, and folding them in needs `Server/State.mjs`, which the brief fences out. That is a real follow-up for the owner, not something this task can fix inside its fence — shots/asks-undone-1920.png.
2. [note] `/tasks/` used to show tasks "grouped by module, ranked". It now opens a flat, newest-first Inbox list ("newest 150 of 539"), so the per-module grouping is gone — shots/tasks-400.png, chip row. That matches "the same rows the Inbox would", but the old page's view has no replacement.
3. [note] At 1920 the Lanes view draws only two columns: Landed today drops under In flight and leaves the right half of the page empty, even though there is room for three columns — shots/tasks-lanes-1920.png. This probably happened before this change too (the same tasks.css); it is worth a follow-up because Lanes exists to show all of today at once.
4. [note] The Inbox chip counts now apply the other groups' filters (Today under Kind: task counts tasks only), and a new Home chip was added. Both change the main Inbox, not just a preset, which goes past the rail fence ("only to export a preset"). `plan.md` records both as decisions.
5. [note] `DashChips.note_bad` returns the colour string, not the view (`… .el.style.color = "#c62828"`). It was moved unchanged from TasksPage and no caller uses the return value.

Widths given: 400, 1200, 1920, 3440 for `/framework/ai/tasks/` and `/tasks/` (both forward to the Inbox), plus the agent's own 400/1920 shots of lanes, architecture, asks/undone, `?landed=week` and `?recent=today`.

## Requirements
- 1 "Plan, one screen in plan.md" — yes — plan.md: one table (page, showed, chips, stays, dies) plus a Decisions list that includes redirect vs mount
- 2 "the three pages read nothing but state.json through DashState; old readers and row code removed" — partly — TasksPage.js is deleted, and Lanes now reads DashState (diff of TaskLanes.js); asks/undone still reads undone.json (finding 1)
- 2 "every old url still lands on the same rows" — yes — `DashChips.saved()` maps `?landed=yesterday|week` to `recent=` and keeps the hash; shots/tasks-landed-week-1920.png
- 2 "TaskState.mjs --watch … say which in the log" — yes — plan.md and the readme say it keeps writing state.jsonl because DashState tails it as its pulse
- 2 "decision line: /live/ left for the owner" — yes — plan.md Decisions; the diff does not touch `public/live/**`
- 3 "check_page at 400 and 1920, zero console errors, zero same-origin 404s" — yes, as the log tells it — task.jsonl log: five urls plus lanes/architecture, zero errors; the settings.jsonl 404s also happen on main
- 3 "landed-today on the tasks page = Inbox Today chip = check.landed_today.state" — yes — Lanes "Landed today 13" (shots/tasks-lanes-1920.png), and plan.md says the Today chip is 13 and equals check.landed_today.state
- 3 "the Built line in one-dashboard.md and ai/readme.md extended to step 3 with the commit" — yes — diff: "steps 1, 2 and 3 … 38628861d"; the readme lines are updated
- Owner's ask: "one AI dashboard that just works, with filters; not another dashboard" — yes — the tasks pages forward to the one Inbox list (shots/127-…-framework-ai-tasks/sheet.png)

## Page structure
- page 1 (says what it is) — yes — the Inbox and Lanes have titles ("AI", "Tasks"); asks/undone has no h1, only an intro sentence (from before this change) — shots/asks-undone-1920.png
- page 2 (one takeaway above the fold) — yes — chips plus list, sheet.png
- page 3 (detail nested) — yes — Architecture is its own tab

## Navigation
- techniques — tabs (AI tab bar; List/Lanes/Architecture), a sidebar, a bottom rail at 400
- tabs wrap — tab_rows 2 at 400 (AI tabs, by design at mobile), 1 at 1200 — layout.json
- route everything — yes — each saved filter is a url; the List tab links to the preset url
- back works after the redirect — yes — `location.replace`, so the old url does not stay in history

## Layout
- columns use the width — no for Lanes at 1920 (finding 3); yes for the Inbox — sheet.png 1920/3440
- overflow_x — false at every width — both layout.json files

## Sizing
- widest text — 292–573px, readable — layout.json widest_text
- empty share — 22% at 400 up to 58–60% at 3440, the Inbox's existing shell — layout.json `empty`

## Wrapping
- wraps — only the drawer rail buttons and the mode button, which belong to the shell, not this change — layout.json wraps
- chips — wrap to three rows at 400, readable — shots/tasks-400.png

## Spacing and padding
- band shares — inbox-head 0.055 and list 0.844 at 400 — layout.json bands; no big_empty band
- padding — consistent card padding in Lanes and the list — shots/tasks-lanes-1920.png

## Colour and contrast
- contrast — yes — the active chips are orange with dark text, the rest muted grey and still legible — shots/tasks-400.png
- red check line — n/a

## Flow
- order — yes — counts, chips, search, then rows; Lanes: tabs, then lanes

## Words
- content 1 (plain sentences) — yes — the SavedFilter fallback says "This list is now a filter of the Inbox: <url>"
- content 2 (names link) — yes — "routed asks in the Inbox" and "lanes" are links
- chip label "in a module's tasks/" — note: clear, but long for a chip — shots/tasks-400.png
