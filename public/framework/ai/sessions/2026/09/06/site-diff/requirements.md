# site-diff — one command that shows what changed on the site since the last landing (Sonnet)

Why: today shared CSS changed a dozen times, each task proved six pages, and the owner found the breaks — the fat nav, a bled wall, a broken table, thirty-eight erroring layout pages — one at a time. Nothing watches the whole site between landings. This tool does, and the mastermind runs it after every landing.

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `ext/DesignTool/readme.md` and `ext/DesignTool/vision/` (the existing screenshot runner — reuse its browser handling; do not build a second Playwright harness if one exists); `core/Search/Search.js` (how the corpus of 568 pages is enumerated from `/directory.json` — reuse that list). Skills: `new-task` (this dir, group `ai-ops`), `code`, `finish-task`.

## What to build

`public/framework/ext/DesignTool/diff/site-diff.mjs` — a node script, no new dependency (Playwright is at `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`):

- `node site-diff.mjs baseline --out <dir> [--pages <n>] [--widths 1280,3440]` — shoots a representative set of pages (default: 40 — the home, the four realm fronts, the paging front + library + one mechanism, the layout tree + one layout, one Doc page, one Research page, the blog front + one post, the notes wall + two notes, the platform hub + mvp, the size and spacing pages, the controls page, and a spread of `styles/layouts/*`; a `--all` flag takes the whole corpus) at each width into `<dir>/<slug>@<width>.png`, plus a `manifest.json` (url, width, console error count, scrollWidth vs clientWidth, framed boxes at x:0 count).
- `node site-diff.mjs compare --baseline <dir> --out <dir>` — shoots the same set and reports, in one table to stdout and `report.json`: per page and width, pixels changed (count and %), NEW console errors, new sideways scroll, new x:0 boxes — sorted by pixels changed, and a one-line summary: "N of M pages changed; K new errors". Known-dynamic regions (the `/framework/` live clock) are masked by a small list in the script.
- One browser, ≤ 4 pages concurrent, closes on exit, exits non-zero if new errors or new sideways scroll appear. Runs against a url given by `--server` (default `http://localhost:8123`).

## Prove it

Run `baseline` now against the shared server, then `compare` against the same baseline immediately: 0 pages changed except the masked clock. Then change one line of a scratch stylesheet injected via `--inject <css>` (a flag for exactly this test: adds the css to every page) and `compare` again: the pages it touches show up at the top. Time for 40 pages × 2 widths under 90 s. Put the baseline dir path convention in the readme (the mastermind keeps baselines in its scratchpad, never the repo).

## Fences and budget

Write `ext/DesignTool/diff/**` (script + `readme.md` + a one-screen `page.js` registered in `ext/DesignTool/page.js` `children:`), this task dir. Shared server for the runs — start none, kill none. Never `find /`; never spawn agents; never `git stash`/`git rm`/commit. Budget ~150k tokens. Report in ≤ 6 plain lines: the two commands, the timing, the self-test result, the mask list.
