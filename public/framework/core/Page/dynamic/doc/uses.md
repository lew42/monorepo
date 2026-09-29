# Where dynamic pages are used

Two real, already-running systems build their pages this way today. Neither has a `page.js` for the pages listed below — both build them live from a file, through one template.

## AI 2's cards — a folder listing, then `page.jsonl`

[`ai2/card.js`](/framework/ai2/card.js), `Card.Folder.child()` (around line 1000): a year or month segment (`2026`, `2026/09`) builds a plain index page from the id alone; a day segment (`2026/09/24`) reads that day's card straight off its `page.jsonl` with `Card.jsonl(...)`. No `page.js` exists for any year, month, day or card — `child()` is the only reason `/framework/ai2/2026/09/24/<card>/` opens at all. Format: [`core/Page/jsonl/`](/framework/core/Page/jsonl/) (a page built from log lines, live — the format is shown there, not repeated here).

## The AI day pages — `route()` + one dashboard function

[`ai/page.js`](/framework/ai/page.js), `route(name)`: a name shaped like a date (`2026-09-29`) builds `new Page({ content(){ dashboard(this); } })` on the spot — `dashboard()` (from [`ext/AITask/dashboard.js`](/framework/ext/AITask/dashboard.js)) is the one template, and it reads that day's task directories and their `task.jsonl`/`session.json` files to draw the board. The same `route()` goes one level deeper: a task name inside that day becomes `new AITask({ src: this.url + task + "/session.json" })`, again one template reading one file, no `page.js` written for any single day or task.

## This module's own example

[`dynamic/example/`](/framework/core/Page/dynamic/example/) is the same pattern at its smallest: `index.json` names three items, each item is one `.json` file, and `child()` hands each one to a single template function.
