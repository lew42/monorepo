# THE MAGAZINE — imagine/mag

One composed experience that uses everything today's column program proved. At
`public/imagine/mag/`. The task composes; it does not invent.

## The ask (verbatim)

THE MAGAZINE: one composed experience that uses everything today's program proved. At
`public/imagine/mag/` (new dir; `mag` is NOT yet declared — the mastermind wires
/imagine/page.js, do NOT touch it; build and verify against the direct url /imagine/mag/).

READ THE PROVEN VOCABULARY FIRST: `core/Page/doc/findings.md` (today's seven verdicts),
`doc/columns.md` (columns, width words small/large/full/hug/fill, `index: true`, resizable
seams, bleed), `/imagine/screens/` post-composition (display type scale, golden cover via
`screens-major`, tone on the arriving area, `full` replaces / `fill` joins),
`/imagine/feeds/data/` (one JSON fetch to reactive renderings + filters),
`/imagine/vary/tone/` verdicts.

WHAT IT IS — a small real magazine that a visitor can actually read:

1. Cover — a full-screen title slide (display type, one accent, golden seam) that opens
   into the issue.
2. Contents — an index column (previews as nav, `index: true`), articles from ONE
   `issue.json` (titles, standfirsts, sections, body blocks — 5-6 short real articles, a
   few paragraphs each).
3. Reading — an article opens as a proper reading column (default track, the 40em measure
   earning its keep); images/pull-quotes may `bleed`; the NEXT article is one hop.
4. A data piece — one article is data-driven (a small chart or table from the JSON — the
   feeds pattern), filtered by one control.
5. Tone hierarchy — cover/contents/article each sit one deliberate tone step apart.

Chrome minimal: the crumb strip and the columns row ARE the navigation. Every url
cold-loads. No scrollbar surprises.

## Fence

`public/imagine/mag/**` only. Do not touch /imagine/page.js, ext/Playground, dev/DevBar,
ext/grip. Never kill the :80 dev server, never drive owner tabs, never stash, never commit.

## Verify

Headless at 400/1920/3440: cover to contents to article to next-article (screenshot each
hop), the data piece filters (numbers), every url cold-loads, zero console errors, tone
steps visible (light + dark at 1920). Probe shots to the scratchpad (`mag-*`), keepers to
this dir.
