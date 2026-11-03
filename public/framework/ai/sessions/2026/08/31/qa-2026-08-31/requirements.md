# qa-2026-08-31 — fresh-eyes integration QA

READ-ONLY task. Edits nothing outside this dir. Server driven headless on a private
port (`$env:PORT='8097'; node server.js`), torn down at the end. The :80 dev server is
never touched; owner tabs are never driven.

SKIP entirely (a sibling agent is editing them right now):
`public/imagine/cms/edit/**`, `public/imagine/vary/colstyles/**`.

## The ask, verbatim

fresh-eyes integration QA over everything landed TODAY (7 waves by different agents; the
seams BETWEEN them were never tested together). Drive headless on the private port, break
things on purpose, report with numbers. The seams:

1. **Generator pileup** (`/framework/core/Page/generator/`) — one page gained: specs
   gallery, look switcher, store split, copy button, unknown-word feedback,
   save-your-spec, export control. Interactions: save a spec, switch look, reload — both
   survive? saved spec + `#42` seed + ink look simultaneously? unknown-word hint while a
   saved spec is loaded? export control beside copy — layout at 400? does the store key
   (single key, patch) hold dressing + saves + last-address after ALL of today's writers
   touched it?
2. **Blog pileup** (`/blog/`) — sitemap.xml urls vs posts.js (must be 1:1 + roots),
   section labels on index vs the section pages' own lists, prev/next in hello-lew42
   parts vs next_up at part 3 (both render? contradictory?), feed.xml still valid,
   reading times still present after Post.js edits by two agents (card() was edited today
   by the sweep — meta line order sane?).
3. **Decks** — numeral + Space/arrows on all six standalone cuts AND pitch AND swap: any
   cut where the numeral desyncs or Space scrolls the page instead?
4. **Mag** — prev hop + next hop on first/middle/last articles; both absent exactly where
   documented?
5. **`/imagine/generated/seed-7/`** — browsable from the /imagine/ rail? all 14 pages walk
   clean? the index page lists it?
6. **cms/stream (NOT cms/edit)** — wire + blocks + json pages: append path still 200s,
   compact buttons still show sane counts after the export agent added rpc:ls traffic?

Also: one full-site console sweep (the known benign `<name>/page.js` probe-404 family
excluded) — list any NEW error url.

VERIFY: every claim carries a number, url, or screenshot. Tear the server down. Report:
findings ranked by severity (or "clean" per seam), the one worst finding first, total urls
swept.
