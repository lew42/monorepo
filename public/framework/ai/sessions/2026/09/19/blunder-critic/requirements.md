# blunder-critic — sweep the last two days' pages for visual blunders; READ-ONLY

Load the `minion` skill first. Then this brief. Model: Sonnet. **You edit nothing but your own task dir.**

**Three laws.** Less is more. Clear beats brief by far. Prioritize (the worst blunders on the most-visited pages first).

## Why

The owner, 2026-09-19: "it's just making blunders all over the place." The site sidebar shipped with 46 px tree rows, labels 80 px in, a 9 px fold glyph and the filter in a bordered card inside the rail — and the minion that built it called it clean. Builders certify their own work; you are the stranger who looks.

## What to do

1. The pages: every `links[].url` on a **landed** ask in `public/framework/ai/2026-09-17/mastermind-layout-browser/task.jsonl` (merge `ask` lines by `id`; a later line's fields win) — about forty urls — plus `/`, `/framework/`, `/imagine/`, `/layouts/`. Skip `/framework/ai/**` task pages except the run task's own page and `/framework/ai/v/2/`.
2. Private server `PORT=8133 node server.js` (background; kill by its real Windows PID at landing). Headless Playwright, socket blocked, at **1280×900 and 400×800**; add 3440×1300 for the ten most-visited: the four roots, `/layouts/browse/`, `/framework/styles/system/`, `/imagine/paging/make/`, the run task's page, `/layouts/shell/`, `/layouts/practice/`. Full-page JPEG shots into your task dir under `shots/`.
3. **Look at every shot** (Read the image), and measure what looks off. The classes to hunt, each a number and not an opinion:
   - a control or a row wearing page-scale spacing (a row pitch over ~40 px in a list of more than eight; a gap over 1em between an icon and its label; a control whose padding comes from `--pad` or `--gap`);
   - a box inside a box for no reason (a bordered or filled card inside a rail, a toolbar or another card, with nothing different to say);
   - text or a control under ~12 px; a click target under ~20 px;
   - clipped, overlapping or overflowing content; a horizontal scrollbar nobody chose; content hidden under a sticky bar;
   - empty bands (over 40% of the first screen blank at 1280) and stretched bands at 3440;
   - misalignment a stranger would see (labels that do not share a left edge in one list; a lone item on a last row stretched full width);
   - console errors and 404s on load.
4. Deliverable: a `page.js` in your task dir — a wall of findings, **worst first**, each one card: a cropped shot of the blunder, one plain sentence ("the label starts 80 px in because the gap is applied twice"), the measurement, the file and line that causes it, the smallest fix. Cap 30 findings; group repeats as one finding with a count. Also `findings.json` (the same, raw). "None on this page" is a fine result for a page — list the clean pages in one line.
5. Two numbers that must agree: pages shot = pages listed (clean plus with findings).

## Rules

- `new-task` first (your dir: `ai/2026-09-19/blunder-critic/`); `ui-test`, `layout` (as a lens — its rules are suggestions, the shot is the verdict); `finish-task`.
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never drive the owner's tabs.** Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing here. A bash heredoc containing an apostrophe fails in this harness — write files with the Write tool. Do not write the owner's name anywhere.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`; `page.routeWebSocket(/.*/, () => {})`. Scratch scripts in the session scratchpad.
- Landing `outcome`: one screen — how many pages, how many findings, the five worst in a sentence each, the link.
