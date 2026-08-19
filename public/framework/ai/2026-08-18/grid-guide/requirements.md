# grid-guide — extend the grid guide in place: the steps a five-year-old still needs, in order

Laws: less is more · clarity · prioritize. **Deliverable: `public/framework/styles/layouts/grid/page.js` extended in place — the missing steps below, each one demo + one clause, and the `auto-fit`/`auto-fill` section moved up; verified headless at 400 and 1280 (two pngs in this dir, zero console errors); final message ≤ 15 lines.** Sonnet. Show, don't tell.

The owner (2026-08-18): *"Create a 'flex guide' and a 'grid guide'. […] Imagine you're explaining flex/grid to a 5 year old. Start simply, show how each feature works, show how they interact, etc."*

## What exists

`/framework/styles/layouts/grid/` (`page.js`, 79 lines, group "Guides"): three `word()` cards (`stack` = `grid gap`, `auto`, `three`), the `.grid.auto` rule explained in three parts, "A cell that wants more" (span, with a measured 94px overflow), "Where the same markup breaks" (one token, three values), `auto-fit` or `auto-fill`, three templates, a next link. `word()` is `styles/layouts/word.js`. The test-drive minion's read: [`../panel-grid/guide-notes.md`](../panel-grid/guide-notes.md) — *"extend in place, now."*

## Add — in this order (a beginner's order; keep the page a scan)

1. **What is a track** — before anything: a grid is a table with no lines drawn. One tiny demo, one clause. (May be the first sentence under the h1 rather than a demo.)
2. **`fr` vs a fixed length** — `grid-template-columns: 1fr 200px` beside `1fr 1fr`: `fr` divides the leftover, a length doesn't share. Raw declaration — the vocabulary has no word for a hand-written template (`grid/page.js` says so already: *"there is no utility for a hand-written grid-template-columns"*); the demo says so in one clause.
3. **`auto-fit` vs `auto-fill`** — the section already exists; **move it up** to right after the `.grid.auto` rule explanation, before the reader has seen `auto-fit` used three times.
4. **`gap`** — one demo, the same wall with and without `gap`; the word is in every string already, unexamined.
5. **A span that is fine** — the span section exists as a warning; add the case where a span is right (a hero cell in a fixed count `three`), one demo.
6. **Template areas** — one `grid-template-areas: "a a" "b c"` picture (raw declaration, says so). Even one doubles what a beginner can build.
7. **`min-width: 0` / `minmax(0, 1fr)`** — why one long word blows out a track: the same wall with a long unbroken word in one cell, once with `1fr` and once with `minmax(0, 1fr)`. Note that `.grid.auto`'s `min(var(--column), 100%)` is the guard for the OTHER failure (a track floor wider than its box) — one clause distinguishing the two.
8. **`dense`** — cells of two sizes with and without `grid-auto-flow: dense`; one clause.
9. **Alignment inside one cell** — `justify-self` / `place-self` on one cell; the page never places content *inside* a track today.
10. **A nested grid** — a cell that is itself `grid gap auto`. Two levels.

Each step: a `demo()` (or `word()` where an existing class string IS the step) + one caption clause in the house voice. Reuse the page's `cells` idiom (`div.c("pad wash")`). Inline `.style()` ONLY for raw declarations the vocabulary lacks (fr, areas, dense, place-self, minmax) — each such demo says the vocabulary has no word for it, so a reader knows it is CSS, not a class.

## Rules

- Load `code`, `layout` and `css` once (framework.css grid words: `.grid`, `.grid.auto`, `.grid.three`, `.gap` — lines 448–492). Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `layout`); `finish-task` at the end (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Fence: `public/framework/styles/layouts/grid/page.js` and this dir only. Do not touch `word.js`, `framework.css`, the flex guide (another minion owns it), or `ext/`.
- Verify headless (global playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; scratchpad `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/a14ec0db-4e8c-4ce1-a14c-378e52ac01a0/scratchpad/`): `http://localhost/framework/styles/layouts/grid/` at 400 and 1280 → `grid-guide-400.png`, `grid-guide-1280.png` here; zero `console.error`/`pageerror`; `document.querySelector('.app').scrollWidth <= clientWidth` at both — ⚠ the span demo already overflows on purpose at ≤ 320; do not "fix" it, but nothing you add may overflow at 400. Two numbers that must agree: demos added (count in the file) and demos rendered (`.demo` count delta).
- Timestamps from the clock; forward slashes; never Out-File a `.jsonl`; never a person's name — "the owner". Only `p()`/`h1`–`h6` read backticks; a backtick inside `` css(`…`) `` kills every page; no DOM after an `await` outside a callback. Wait in the foreground.
