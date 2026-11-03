# doc-member-routes — a doc's member pages should open from anywhere (Sonnet)

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `../notes-pages-3/task.jsonl` (the finder: `/framework/core/Page/doc/method/link/`, `doc/method/crumbs/`, `doc/method/preview_card/`, `doc/method/activate/`, `doc/property/children/`, `/framework/core/App/doc/method/inject/` all 404 from a cold load although the `.md` files exist and are served; only topic routes `doc/<name>/` mint pages; `/framework/styles/doc/*.md` is not routed at all and those docs live at `/framework/styles/rules/<name>/` and `/layers/<name>/`); `ext/Doc/` (readme, `Doc.js`, how `doc/<name>/` routes are minted from the `files:` declaration — files are declared, never crawled), `core/Page/page.js` (it already links two of the 404ing member urls). Skills: `new-task` (this dir, group `web-ui`), `code`, `documentation`, `finish-task`.

## The job

1. Find where `ext/Doc` mints `doc/<topic>/` and why `doc/method/<name>/` and `doc/property/<name>/` are not minted on a cold load (they probably exist only after the API tab has been opened, or the member tier is drawn but never registered as routes). Fix it at the cause so a member url loads cold, from a fresh tab, for every Doc on the site — same for `styles/doc/*.md` if a Doc owns it (if `styles/` is not a Doc, point its readme at the real routes instead and say so).
2. Prove: the six urls above load cold with zero console errors; a crawl of every `Doc` page's declared members (enumerate from the declarations — count them) at 1280 returns 200 and renders; the count of member urls that 404 goes from N to 0.

## Fences and budget

Write `ext/Doc/**`, `styles/readme.md` (only if 1 says so), this task dir. Never `core/**`. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~120k tokens. Report in ≤ 6 plain lines: the cause, the fix, N → 0, what you left.
