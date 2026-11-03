# demo-parts — the demo gains its title and footer; nothing else moves (Sonnet)

Three laws: less is more; clear beats brief; prioritize. Length budget: the report is 6 plain lines.

Read first: `../mastermind-graduate/layout-brief.md` deliverable 3 (the owner's five parts of a demo: viewport, path bar / toolbar, footer, title, optional section wrappers); `../../2026-09-04/mastermind-platform/minion-rules.md`; **`../layout-study/plan.md`** §2 (the demo decision: `ext/demo` is the one system — 202 callers; the viewport with its handle is `stage.js:29`, the path bar `shell.js:137`, the toolbar `stage.js:105`; the two missing parts are a title and a footer, at `shell.js:69`) and §7 slice C1. Then `ext/demo/shell.js`, `stage.js`, `demo.js`, `readme.md`, `doc/`. Skills: `new-task` (this dir, group `layout`), `code`, `css`, `new-css-class`, `documentation`, `finish-task`.

## The job

Slice C1 only: `ext/demo` gains `title` and `footer` as options a demo page may pass (a string, or a function that draws), rendered where the plan says, styled with the tokens the shell already uses — no new colour, no new size. A demo that passes neither renders byte for byte what it renders now. Update `ext/demo/readme.md` (one line each) and the demo's own `page.js` so the two parts are SHOWN once.

## Prove it

Use the mastermind's shared server at `http://localhost:8123/` — start none, kill none. Headless: the `ext/demo` page and twenty demo callers you pick across `/framework/` and `/imagine/` (list them) at 1280 and 3440, zero console errors; pixel-diff three of them before/after — 0. One screenshot of a demo with both parts on, at 1280 and 3440, in your task dir.

## Fences and budget

Write `public/framework/ext/demo/**` and this task dir only. Never `ext/layout/**` (twelve importers; the plan says it lives), never `core/**`. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~80k tokens. Report in ≤ 6 plain lines.
