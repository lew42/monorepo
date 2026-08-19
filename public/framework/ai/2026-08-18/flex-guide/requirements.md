# flex-guide — extend the flex guide in place: the five steps a five-year-old still needs

Laws: less is more · clarity · prioritize. **Deliverable: `public/framework/styles/layouts/flex/page.js` extended in place with the five missing steps, each one demo + one clause; verified headless at 400 and 1280 (two pngs in this dir, zero console errors); final message ≤ 15 lines.** Sonnet. Show, don't tell — the demo IS the explanation.

The owner (2026-08-18): *"Create a 'flex guide' and a 'grid guide'. […] Imagine you're explaining flex/grid to a 5 year old. Start simply, show how each feature works, show how they interact, etc."*

## What exists

`/framework/styles/layouts/flex/` (`page.js`, 99 lines, group "Guides"): nine one-word `word()` cards (row → gap → v → v-center → split → auto → basis → wrap → three), a "Where it breaks" section, four copy-paste templates, a next link. `word()` is `styles/layouts/word.js` — a class string as an inline child page (card = the shape; page = the same string at real size on a stage under `layout.bar()`). The test-drive minion's read of it: [`../panel-flex/guide-notes.md`](../panel-flex/guide-notes.md) — *"already good … extend in place, once."*

## Add — in this order, after the nine cards and before "Where it breaks" (or wherever the reading order says; keep the progression simple → interacting)

1. **Grow weights** — two fluid boxes at `flex: 2` vs `flex: 1`: *why one box is bigger*. ⚠ The vocabulary has NO grow-weight word (`.flex.auto`, `.all-1`, `.three`, `.flex-1` all set `flex-grow: 1`; `--grow` exists only under `.flex.auto` — `framework.css:398`), so this demo shows the raw declaration and SAYS that in one clause. Do not invent a class.
2. **`min-width: 0` — why text refuses to shrink**: the same row twice, one child holding a long unbroken word; without `min-width: 0` it blows out the row, with it it shrinks. `.flex-1`/`.basis`/`.flex.auto > *` already carry `min-width: 0` (`framework.css:398,403,410`) — show that a bare child does not.
3. **`align` vs `justify`** — one demo, two axes: `v-center` (cross axis) beside `h-center`/`split` (main axis) on the same three boxes of unequal height; one clause naming main vs cross.
4. **Wrap vs squeeze, side by side** — `flex gap` and `flex gap wrap` with the SAME six boxes on one screen (a two-column demo), so the choice is visible at one glance; drag the stage narrower and one wraps while the other squeezes.
5. **A row inside a column** — `flex v gap` holding a `flex gap` row: the first nested example. Two levels, not three.

Each step: a `demo()` (or a `word()` card where a single existing class string IS the step — 3 and 5 might be) + one caption clause in the house voice (short, no restating). Reuse the page's own `boxes()`/`n()` helpers and the `pad wash` box idiom. Inline `.style()` is allowed ONLY for the raw declarations the vocabulary lacks (step 1's `flex: 2`, step 2's `min-width`), and each such demo says so.

## Rules

- Load `code`, `layout` and `css` once (the css skill has you read framework.css — the words above are at lines 379–492). Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `layout`); `documentation` is not needed for a page (no readme); `finish-task` at the end (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Fence: `public/framework/styles/layouts/flex/page.js` and this dir only. Do not touch `word.js`, `framework.css`, the grid guide (another minion owns it), or `ext/`.
- Verify headless (global playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; scratchpad `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/a14ec0db-4e8c-4ce1-a14c-378e52ac01a0/scratchpad/`): `http://localhost/framework/styles/layouts/flex/` at 400 and 1280 → `flex-guide-400.png`, `flex-guide-1280.png` here; zero `console.error`/`pageerror`; `document.querySelector('.app').scrollWidth <= clientWidth` at both. Two numbers that must agree: demos you added (count them in the file) and demos rendered (`document.querySelectorAll('.demo').length` delta vs before).
- Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Only `p()`/`h1`–`h6` read backticks; a backtick inside `` css(`…`) `` kills every page; no DOM after an `await` outside a callback. Wait in the foreground.
