# Brief — browse-on-browse

Two things on the owner's key page, `/layouts/browse/`.

## 1. Merge 5 of the overlap study

(`public/framework/ai/2026-09-18/overlap-study/overlap.md` and its `decision` line)

`public/layouts/browse/page.js` hand-rolls a 644-line card wall; `core`'s `this.browse()`
(`ext/catalog` — read `browse.md` and how `core/Layout/page.js` adopted it on 2026-09-06)
draws the same kind of wall with bands and facets. Rebuild the wall on `this.browse()`
and delete what it replaces (the study estimated 300–400 lines out; report the real
number), keeping EVERYTHING the browser does today: three tiers (Global / Sections /
Components) with counts and approved counts in the strip, picture cards (wires, reused
shots, headless shots with their real pixel sizes from `items.json`), level 2 in place
(the item at three widths, the real-page link, the why fold, Approve/Improve, the
history), the phone order under 40rem (verdict pair first), verdicts live over the
socket, buttons hidden when `edit()` is off (`ext/Ask/edit.js`, landed today). If
`browse()` cannot draw one of those, extend `ext/catalog` with the smallest seam (say
which) rather than keeping the hand-rolled path.

## 2. One verdict trail by url

(the mastermind's decision `verdict-keyspace` in
`ai/2026-09-17/mastermind-layout-browser/task.jsonl`)

A page's own corner control (`ext/Ask`, landed today) writes verdicts keyed by the
page's url; the browser writes by item id. Make the browser's card and item view read
BOTH: an item whose `url` has a verdict shows it, and a press on the browser writes with
the item's url as the key when the item is a page (the 12 wire-only items keep their
id). The approved library at `/layouts/doc/studies/approved/` then needs no change —
check it still lists the right pages.

## Prove

On your private server (`PORT=8141 node server.js`, background, killed by its real
Windows PID): re-run the browser critic's checks by number — they are `log` lines in
`public/framework/ai/2026-09-17/browser-critic/task.jsonl` (15 findings, each with a
measurement; read them all) — at 400 / 1280 / 1920 / 3440: 102 items in the file = 102
cards; the tier strip jumps and counts; level 2 opens and closes; the three pictures;
the why fold; Approve and Improve pressed once for real on one item (then truncate
`public/layouts/verdicts.jsonl` back to its prior content — the owner is the only
writer; copy it first and restore by bytes); the phone order; zero console errors, no
overflow, nothing at x:0. Two numbers that must agree: lines in page.js before and
after, and the 15 checks passing before and after.

## Fence

`public/layouts/browse/**`, `public/framework/ext/catalog/**` (the smallest seam only,
if needed), your task dir. Nothing else — not `ext/Ask`, not the approved page. The
owner's dev server on port 80 is running: never touch it; LiveReload pushes your edits —
one write per file, verify within a minute. Never `git stash`, never `find /`, never
drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here — drop
the slash.

## Final message

One screen: lines before → after, the seam added to ext/catalog if any, the 15 checks'
verdict, the verdict-by-url proof, the link.
