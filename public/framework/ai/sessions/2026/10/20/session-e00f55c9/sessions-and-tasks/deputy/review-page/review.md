verdict: fix
1. [fix] Ask 1 says "find the true parent link and fix the generator, don't patch around it", but the diff touches no generator (nothing under `Server/`, `session-tree.json` unchanged). Instead `SessionWork.js:267-268` prints "33 tasks ran in sessions filed under another day: their cost and Approve are not shown here yet", which is the patch-around the owner ruled out. shots/work-1920.png shows the result: the "deputy" and "Figma: mobile cards" rows have no Approve button and show $0.00, and those 33 tasks' cost is missing from the rolled-up total.
2. [fix] The diff leaves loose references to `v/review`, a page this diff does not add and that is not on michael/dev. `ux/Filter/readme.md:576` names it as "First user", which is a dead link. `css-scopes.txt:418` registers `rv-` for it. `MobileRow.js`/`MobileHome.js` gain `Row`, `dot_key`, `href`, `below` and `after` seams "for v/review's ReviewRow", and nothing uses them. Point the readme at the Work tab (`AISession/SessionWork.js`) and drop `rv-`. The seams are fine to keep, but their comments should not name a page that does not exist.
3. [fix] `Review.js` repeats itself (law 6). Its `walk()`, `totals()` and `ready()` are never called, because `SessionWork.judge()` (`SessionWork.js:243-249`) and `paint()` (`:256`) re-implement the same approved/live/leak/waiting rule and the same totals with slightly different inputs (`n.state` vs `DONE`, `n.last` vs `f.last`). Keep one: either SessionWork calls `Review`, or `Review` shrinks to its constants and `STATES`.
4. [note] Ask 3 names `Session.progress()` as "the one counting code". `SessionWork.js:239` calls `Task.progress_of` directly. That gives the same count (Session.progress wraps it), but the open-task list (`:238`) treats `stopped` as done while the progress count does not. So "0 of 4 complete" and the "Open:" list can disagree about the same task.
5. [note] `paint()` calls `TimeFilter.add({ root: this.$list })` (`SessionWork.js:260`) on every repaint, and every approval event triggers a repaint. Each call adds another `MutationObserver` on the same list, and the old ones are never disconnected. The newest pill happens to win because observers fire in the order they were added, but the observers keep piling up. Build the pill once in `render()` and only call `apply()` on repaint.
6. [note] The README update promised in the last `show:` line ("The AISession readme needs a Work tab line (SessionWork, Approvals, Review)") is not in the diff. Ask 4 also wants each class documented where it lives.
7. [note] shots/work-1920.png and work-400.png: a folded row (`details.sw-node`) is drawn as a grey bordered card, while a plain row is flat, so the nested list looks like a mix of cards and rows. The builder noticed this too. The mobile picks ask for flat rows with one indent.
8. [note] The head's Approve all writes only the session's own line (`SessionWork.js:266`), and children are approved because the state is inherited when read. That is what the brief asked for. But "Approve all" here means the same thing as the head's own Approve, so a single button labelled "Approve this session and everything in it" would be simpler.
9. [note] None of the new classes (`SessionWork`, `Approvals`, `Review`, `FilterPill`, `TimeFilter`) has a page that lists its live instances (rules.md, "Show the class"). `Approvals` holds the state the owner would watch.

Widths given: 400, 1200 and 1920 (shots/work-*.png), Year selected in the shots.

## Requirements
- 1 "Children nested, never flat … fix the generator" — partly — rows nest by task folder (work-1920.png: "deputy" folds 4 inside), but the generator is not fixed and 33 tasks are named as a gap (finding 1)
- 2 Row and head show title, cost own + rolled, duration, tasks created/completed, open tasks — yes — work-400.png head: "$227.41 own · $314.01 with 71 below · 23 h 26 min · 36 of 71 tasks complete", "Open: queue · …"
- 3 "Completion is honest" — yes — only `complete` counts (`Task.progress_of`), and rows with no tasks say "no tasks recorded" (work-1920.png "day page"); uses `Task.progress_of` rather than `Session.progress()` (finding 4)
- 4 Keep Approve per row + Approve all, leaks red, Today ▾ pill, classes in `ai/AISession` — yes — work-1920.png: Approve pills, red leak rows, Year ▾ pill; `Approvals.js`, `Review.js` under `ai/AISession/`; `Review` is duplicated (finding 3)
- 5 Work tab first and open by default, other tabs stay, look first at 400/1200/1920, `show:` logged — yes — `AISessionDetail.js:21,40`; session.jsonl line 39 is the `show:` line
- Live instances of the new classes — no — finding 9
## Page structure
- page 1 — yes — work-400.png: the session title heads the page and the Work card
- page 2 (most important first) — yes — the totals and Approve all come before the rows
- page 4 (duplicate title) — no — work-400.png: the title appears three times (breadcrumb, panel head, Work card head)
## Navigation
- techniques — tabs (the session tabs), a dropdown pill, folds
- tabs stable — no — work-400.png: the session tabs wrap to 2 rows ("Related" on its own line); this was so before the diff
- current place marked — yes — the "Work" chip is outlined
## Layout
- suits the content — yes — a head card, then one nested list, in the panel's width
## Sizing
- controls sized to content — yes — the Approve pills are compact
## Wrapping
- nothing wraps that shouldn't — yes — the "Open:" lines wrap at 400, which is expected for a list of titles
## Spacing and padding
- rhythm even — no — work-1920.png: folded rows are grey cards with their own padding, plain rows are flat (finding 7)
## Colour and contrast
- status colours — yes — green approved, amber waiting, red leaking; the dots match
- colour not the only signal — yes — each row says "leak", "waiting" or "working" in words
## Flow
- the press path is clear — yes — Approve sits at the right end of each row; Approve all sits under the totals
## Words
- plain titles — yes — record titles ("day page", "Projects: Project class and ProjectMove tool"), not slugs
- no noise — yes, mostly — the gap sentence is honest but describes an unfixed generator (finding 1)
