# Minion brief — two console errors that predate this task (core-columns)

Load the `minion` skill first, then `code`.

**Why:** this task must land with zero console errors, and the before-sweep found two page-breaking errors on pages it checks. Neither is caused by this task; both are one-line mistakes.

Worktree `C:\Code\lew42\worktrees\core-columns`, server http://127.0.0.1:53207 (never start/stop/restart servers). Edit only in the worktree.

1. **`/notes/` and `/notes/auth/`** throw `TypeError: img(...).attr(...).attr(...).c is not a function` at `public/notes/scale-1920-to-3413/page.js:72`. The View API's add-class method is `.ac()` — check `framework/core/View/View.js` to confirm, then fix. Grep `public/notes/` for the same `.c("` mistake elsewhere and fix those too.
2. **`/imagine/paging/`** throws `TypeError: Cannot read properties of undefined (reading 'rc')` at `public/imagine/paging/toolbar.js:355`: `this.dots` is filled with `this.dots.set(axis, span.c("paging-dot"))` (line ~192) — a View, and possibly the same `.c` mistake — but `sync()` destructures `{ $dot, label }` from each value. Read the surrounding code and git history (`git log -p -3 -- public/imagine/paging/toolbar.js`) to see which side drifted, and make them agree with the smallest change. The page must render its lab again.
3. Verify both with headless Playwright (global: `createRequire("C:/Users/mike/AppData/Roaming/npm/node_modules/")` then `require("playwright")`; scratch scripts in `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\df827164-9c31-42cf-a111-af266f471402\scratchpad\` named `cc-fix-*.mjs`): zero console errors on `/notes/`, `/notes/auth/`, `/imagine/paging/` at 1280 and 1920, and one screenshot of `/imagine/paging/` at 1920 saved to `public/framework/ai/2026-09-24/core-columns/shots/paging-fixed-1920.png` — open it and look.

**Fence:** write only `public/notes/**/page.js` files with the `.c(` mistake, `public/imagine/paging/toolbar.js`, the screenshot, and your scratch scripts. Never commit.

**Done:** reply with each fix (file:line, before → after) and the console-error counts. Five lines.
