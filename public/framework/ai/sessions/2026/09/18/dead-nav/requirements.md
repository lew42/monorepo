# Dead nav — three findings from today's studies

Owner's brief (verbatim), given to this minion by the mastermind on 2026-09-18:

Three findings from today's studies, each verified headless on your private server
(`PORT=8142 node server.js`, background, killed by its real Windows PID):

## 1. `ext/toc` is invisible on all 23 of its call sites

Source: `ai/2026-09-18/overlap-study/overlap.md`, navigation section.

Its own CSS excludes `.standard`, which every page is now. Read
`public/framework/ext/toc/` and the approved "docs three-region" shape
(`/layouts/doc/studies/approved/` or wherever the approved page lives now —
`rg -l "APPROVED" public/layouts --glob "page.js"`, drop any leading slash in
patterns): decide whether the toc should show on those 23 pages (the shape
says a long article wants it — likely yes, above the 82em breakpoint it
already names) or whether the calls are dead; build the chosen one and write
the alternative in `ext/toc/doc/decisions.md`.

If it shows: count how many of the 23 draw a toc at 1920 (a page with fewer
than three headings draws none, by its own rule — say so); the related-sidebar's
aside landed today on `core/Page` at a 70em breakpoint — make sure the two do
not overlap on a page that has both (find one or make the check on
`/framework/ux/Tree/`).

## 2. `app.js`'s built-in top nav is hidden on all 11 real destinations

Source: same study (overlap-study/overlap.md).

Read `public/app.js` and the CSS that hides it; if nothing shows it anywhere,
delete the nav's code and CSS (count the lines) and say what, if anything,
still references it; if something does show it, say where and leave it.

## 3. Three files still gate editor controls with their own socket check instead of `edit()`

`ext/Ask/edit.js`, landed today — `ai/2026-09-18/edit-mode/task.jsonl`.

Convert each the way edit-mode did (the gate line only):
- `public/imagine/cms/json/**`
- `public/imagine/importance/**`
- `public/framework/styles/system/studies/lists/**` (moved there today from
  `/imagine/design/lists/`)

Prove with the rail's edit checkbox off that each page draws zero editor
controls and zero errors at 1280.

## Fence

`public/framework/ext/toc/**`, `public/app.js` (the nav block only) and the
CSS file that hides it, the gate lines in the three named dirs, this task
dir. Nothing else — not `core/Page` (an Opus is in it), not `/layouts/browse/`
(a Sonnet is in it). The owner's dev server on port 80 is running: never
touch it; `app.js` is loaded by every page — one write, verify within a
minute. Never `git stash`, never `find /`, never drive the owner's tabs.

## Final report shape

Three lines, one per item, each with what changed and the number that
proves it.
