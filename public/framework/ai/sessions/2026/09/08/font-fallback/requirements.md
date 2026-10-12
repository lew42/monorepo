# font-fallback — a failed font fetch must never blank the site (Sonnet, group `playwright`)

Three laws: less is more (ASAP); clear beats brief; prioritize. Length budget: the fix is a few lines; the proof is two pictures; the report five lines.

Read first: `../mastermind-playwright/minion-rules.md`. Skills: `new-task` (this dir, group `playwright`), `code` (before the edit), `documentation` (the module's doc says the opposite of what happens — make it true), `finish-task`.

## The bug, found tonight by the demo minion

`public/framework/core/App/Font.js` says (its comment, line ~22): "offline these silently fall back". They do not: when the two Google font requests fail, every page of this site renders WHITE — the `playwright-demos` minion hit it by blocking `**/*.woff2` with `page.route` (`public/framework/ai/2026-09-08/playwright-demos/task.jsonl`, the `06-network` lines). `Font.load()` (Font.js:9–12) awaits `FontFace.load()`, which rejects on a failed fetch; `App.js:75` (`const loading = Font.load(name)`) is where the app waits on it — read `public/framework/core/App/App.js` lines 60–95 to see what that rejection takes down.

## Do

1. Reproduce first: a scratchpad script `font-fallback-probe.mjs` (the Playwright import in the rules) that opens `http://localhost:8123/` with `page.route("**/*.woff2", r => r.abort())` and screenshots at 1280×800 → `before.jpg` in this dir (white, presumably), and prints the console errors.
2. Fix the cause once, in the smallest way: a font that fails to load logs ONE `console.warn` naming the font and the url, and the page renders in the fallback family — the text visible, the icons as their ligature names or hidden, your call, said in the code comment. Keep `Font.load()`'s memoization; do not vendor the fonts (the owner's trade, `core/App/doc/fonts.md`); do not touch `framework.css`.
3. Prove it: the same probe → `after.jpg` (the page readable in a system font), plus a normal run with fonts allowed → `normal.jpg` unchanged from before your edit (compare against a shot taken before you edit). Zero uncaught errors in both.
4. Make the doc true: the comment in `Font.js` and the sentence in `core/App/doc/fonts.md` (or wherever the "silently fall back" claim lives — `rg "fall back" public/framework/core/App`) now describe what actually happens, in one plain sentence each.

## Fences and budget

Write ONLY `public/framework/core/App/Font.js`, `public/framework/core/App/App.js` (only if the fix genuinely needs it — say why in the log), the one doc sentence in `public/framework/core/App/doc/` or `readme.md`, this dir, and your probe in the scratchpad. `:8123` serves the site. Budget ~80k tokens. Report in ≤ 5 plain lines: the cause in one sentence, the fix in one, the two pictures, what changed in the doc.
