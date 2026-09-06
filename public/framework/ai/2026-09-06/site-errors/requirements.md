# site-errors — two console errors that were already on the site, fixed at the cause (Sonnet)

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `../demo-parts/task.jsonl` (the finder: its crawl of 20 demo callers at 1280 + 3440 had 14 erroring loads, all pre-existing — it swapped its own files back to prove it). Skills: `new-task` (this dir, group `web-ui`), `code`, `finish-task`.

## The two errors

1. **`this.words is not a function`** on several `public/framework/styles/layouts/*/page.js` pages. Find every page that throws it (crawl `styles/layouts/` at 1280 on the shared server — list them), then find the cause ONCE: a method that was renamed or moved (grep `words(` across `ext/demo`, `styles/layouts`, `ext/layout`; read the git log of the file that defined it: `git log -S "words(" --oneline -- public/framework`). Fix the cause, not each page — if the method moved, point the callers at where it lives; if it was deleted on purpose, delete the calls and whatever they drew, and say so.
2. **`ux/Auth/`**: `demo.exhibit({})` calls `.demo()` on an undefined `page`. Read `ext/demo/exhibit.js` and `public/framework/ux/Auth/page.js`; make the page pass what exhibit needs (or make exhibit say clearly what is missing instead of throwing three frames away — the `code` skill's §7 shape).

## Prove it

Before/after: the list of erroring urls from a crawl of `styles/layouts/**` and `ux/**` at 1280 and 3440 — after, zero, and the pages render what they rendered (screenshot one fixed layouts page and the Auth page at 1280). Zero new errors anywhere else you touched.

## Fences and budget

Write only the files that carry the cause (name them in your report), and this task dir. Never `core/**`, never `ext/demo/shell.js` (just landed), never `imagine/**`. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~80k tokens. Report in ≤ 6 plain lines: the cause of each, the files changed, the before/after error counts.
