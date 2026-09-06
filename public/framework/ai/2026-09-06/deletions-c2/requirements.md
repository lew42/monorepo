# deletions-c2 — what the layout study said to delete, deleted with proof (Sonnet)

Deleting beats adding. Length budget: the report is 6 lines with the numbers.

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; **`../layout-study/plan.md`** §8 ("What I would delete") and its census table; `../layout-a/task.jsonl` (core/Layout replaces the things below). Skills: `new-task` (this dir, group `layout`), `code`, `documentation`, `finish-task`.

## Delete, each with the same proof

1. `public/framework/ext/Playground/` — 1,895 lines, zero importers per the census. Before deleting: `grep -rn "Playground" public --include=*.js --include=*.md --include=*.css` — every hit is either a declaration to remove (`ext/page.js` `children:`), a link in a readme/doc/note page to re-point at `/framework/core/Layout/` (the notes program made pages this week that may link it — re-point those links, do not delete the note's sentence), or a real importer (then STOP and report instead of deleting).
2. `public/framework/ext/demo/layout.js` — 110 lines; same grep, same rule.
3. `public/framework/styles/layouts/full.js` — 32 lines; same.

NOT yours: `imagine/layouts/LayoutsCard.js` and `number.js` (another minion owns that realm today), `ext/layout/` (twelve importers — it lives), anything under `core/`.

## Prove it

Before/after: a crawl of `/framework/ext/`, every page that carried a re-pointed link, and `/notes/` at 1280 and 3440 — zero console errors, zero 404s on the re-pointed hrefs (probe each). `git diff --stat` line count deleted. The memory note about the Playground is the mastermind's, not yours — say in your report that it needs updating.

## Fences and budget

Write: the deletions above, `ext/page.js` (one name removed), the readme/doc/note lines that linked them (one line each, listed), this task dir. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~80k tokens. Report in ≤ 6 plain lines: lines deleted, links re-pointed (count + files), anything you refused to delete and why.
