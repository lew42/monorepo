# ai-board-fix — the task page shows the answer first, on one screen

Laws: less is more · clarity · prioritize. **Deletions beat additions; no new CSS file; final message ≤ 20 lines.**

Spec: [`../ai-board-review/proposal.md`](../ai-board-review/proposal.md) §3–§4 (Opus, measured). Mike: *"the layout is broken. the order of the content displayed is … confusing … maybe we need some top tabs on each task? Requirements, Proposal, Results? … I want short and sweet NUGGETS OF VALUE."*

## Build, in this order (each = one proposal item; stop and log if one fights you)

1. **#1 reorder** `ext/AITask/AITask.js` `report()`: **outcome · links · status · checklist · extra · shots · figures · chat · log**.
2. **#2 fold the feed** `ext/AITask/feed.js`: a turn renders its prompt (Mike's message) only; tool flow opens on click. Mike's messages become the feed.
3. **#3 links on the task page**: reuse `card.js`'s `.ai-links` pill row inside `report()` — one function, called from both.
4. **#4 rail**: when a child is routed, the archive rail is `display: none` at every width; delete the `min(22em, 34dvh)` rule at `ai.css:214-218`. Do not add a breakpoint.
5. **#5 agents table**: one row per agent, outcome = first sentence, full text on click.
6. **#7 tabs (local)**: **Requirements · Report · Session** as a `.tab-bar` toggle over the sections `report()` already builds (Report = outcome+links+status+checklist+extra+shots+figures; Session = chat+log/feed; Requirements = requirements.md rendered if present, else the request). Reuse `ext/tabs/` if it fits; no new component.
7. **#6 day strip**: the day page renders `day.jsonl` as a header strip — opened/landed, one line each, newest first, capped at ~12 lines with "more".
8. **#8 route**: the day `route(name)` prefers the dir's own `page.js` when one exists, else `AITask` — so a task never needs declaring in `children:`. Prove it: today's `report/` (has page.js, undeclared) must open its own page; `ai-board-review/` (no page.js) must open the generic viewer.
9. **#10 delete** `ext/Timeline/ai.js` after `grep -rn "Timeline/ai" public/ Server/` returns nothing.

## Prove it — before/after, measured

Headless Playwright (never Mike's tabs; wait networkidle + 2 rAF), on `/framework/ai/2026-08-16/mastermind-run/` @1440 and `/framework/ai/2026-08-17/` @900: save `before-task-1440.png`, `after-task-1440.png`, `before-day-900.png`, `after-day-900.png` (viewport-only, not full page) in this dir, and log **page height** and **y of `.ai-outcome`** (or whatever the outcome node's class is) before and after. Baseline from the review: 249,069 px tall, answer at y=12,923. Target: answer above the fold; page under ~5,000 px with the feed folded.

## Rules

- Files you may edit: `public/framework/ext/AITask/**`, `public/framework/ai/page.js`, `public/framework/ai/2026-08-17/page.js` (and the day-page module it delegates to, if any — name it in the log), `public/framework/ext/Timeline/ai.js` (delete only), this dir. Nothing else — not `framework.css`, not `styles/`, not other days' page.js.
- Skills: `code` (read once), `css` before any CSS, `documentation` if `ext/AITask/readme.md` or `doc/` need a line, `finish-task` to land. Every CSS rule inside a layer; no new stylesheet.
- Log milestones as `{"log": {"at","msg"}}` in `task.jsonl` here (bash `printf`, never Out-File); bump `step`. Land per `finish-task` with the four PNGs linked and the two numbers (height, outcome-y) before/after in `outcome`.
- Every append reloads Mike's open tab: batch, don't spam.
