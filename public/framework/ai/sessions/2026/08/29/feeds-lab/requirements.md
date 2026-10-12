# feeds-lab — verbatim ask

From `public/framework/ai/2026-08-29/imagine-program/requirements.md` (owner, 2026-08-29):

> explore utilization of advanced web embeds (youtube, etc), apis (json -> renderings), etc.
> don't stop, keep building cool experiences, focusing on clean, clear, simple navigation,
> filters, ui, ux.

## Scope — file ownership

Own `public/imagine/feeds/**` ONLY. `feeds` is already declared in `/imagine/page.js`
`children:` — do not touch that file. Replace the stub at `public/imagine/feeds/page.js`.

## Build

1. **video/** — YouTube embeds: lazy iframe (click-a-thumbnail pattern, poster from
   i.ytimg.com, no iframe until asked), a small picker column beside a player column
   (the inbox pattern). Stable well-known videos. 16:9 stage, no scrollbar surprises.
2. **data/** — JSON -> renderings: one `data.json`, ~20 rows with fields worth filtering.
   Render three ways from ONE file: a wall of cards, a columns tree (group -> item ->
   detail), a table. One filter control (text + facet chips) filters all three.
3. **live/** — one live public API fetch (CORS-friendly, keyless). Small clean dashboard.
   Handle failure honestly (offline = a quiet note, never a blank page).

Previews as nav on the index. Verify headless at 400/1920/3440: filter numbers, iframe
absent pre-click, live/ under a blocked network, zero console errors (except the blocked
fetch's own).
