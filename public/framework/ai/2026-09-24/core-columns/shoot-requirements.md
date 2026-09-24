# Minion brief — the before/after screenshot sweep (core-columns)

**The owner's words this protects:** "we don't want to clobber things; an overnight session just destroyed a bunch of padding on a bunch of containers."
**The master mastermind's words:** "Take before-and-after screenshots at 1280, 1920 and 3440 of at least SIX pages nobody on this task built … Diff them. Any change you did not intend is a bug to fix before merging."

Load the `minion` skill first.

## Where

- Worktree: `C:\Code\lew42\worktrees\core-columns`. Its own server: **http://127.0.0.1:53207** (already running — never start, stop or restart any server).
- Playwright is global. This line works (tested): `import { createRequire } from "node:module"; const require = createRequire("C:/Users/mike/AppData/Roaming/npm/node_modules/"); const { chromium } = require("playwright");`
- Your script lives in the session scratchpad as `cc-shoot.mjs` (name it exactly that — the scratchpad is shared): `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\df827164-9c31-42cf-a111-af266f471402\scratchpad\`
- Output: `C:\Code\lew42\worktrees\core-columns\public\framework\ai\2026-09-24\core-columns\shots\<label>\` where label is `before` or `after`.

## Deliverables

1. **`cc-shoot.mjs <label>`** — one command that, headless, one fresh context per page×width, viewport heights 900 (1280), 1080 (1920), 1440 (3440):
   - loads each page, waits for network idle + 800ms, screenshots the viewport (not full page) to `shots/<label>/<slug>-<width>.png`;
   - records console errors and failed requests;
   - records a **geometry dump** per page×width into `shots/<label>/geometry.json`: for every element matching `.page, .page-column-body, .page-column-head, .doc, .doc-section, .card, section, main, header, nav, [class*=panel]` (cap 400 per page) — a stable path (tag + classes + nth-child chain), its bounding box, and computed padding, margin, width, gap, flex.
2. **`cc-diff.mjs`** in the same scratchpad — compares `before` and `after`: pixel diff per png (do it inside Chromium: load both images into a canvas, count differing pixels, write a red-overlay diff png to `shots/diff/`), and a geometry diff listing every element whose box or padding changed by > 1px. Writes `shots/diff/report.json` and a short `shots/diff/report.md`: per page×width, % pixels changed and the changed elements.
3. **Run `cc-shoot.mjs before` now**, once, and stop. Don't run after/diff — the mastermind will send you that later.

## Pages (all fourteen, at 1280, 1920, 3440)

Pages nobody on this task built (the ones that must NOT change):
`/framework/`, `/framework/ai/`, `/framework/ai2/`, `/framework/ext/JSONL/`, `/layouts/`, `/layouts/practice/reader/`, `/notes/`, `/notes/auth/`

Pages this task targets (these SHOULD change):
`/imagine/paging/`, `/framework/core/Page/overview/columns/finder/`, `/imagine/design/navigation/`, `/framework/core/new/`, `/framework/core/new/1/`, `/framework/ext/DesignTool/taste/`

Also, for the nav targets, a **click probe**: on `/framework/core/Page/overview/columns/finder/` and `/imagine/paging/`, click the first three nav links in the leftmost column one at a time (whatever is a link in the first `.page-column-body`), and after each click record every open column's x and width. Put it in geometry.json under `clicks`. Largest shift of an already-open column is the number that matters.

## Fence

Write only: the two scripts in the scratchpad, and `shots/` under this task dir in the worktree. Read anything. Never edit site code. Never commit.

## Done

Reply with: the before run's counts (pngs, console errors per page, failed requests), and the click-probe's largest shift per page×width. Five lines.
