# layout-space

## The ask, verbatim

> analyze the current page/content structures....
>
> it seems my page layout situation has reached its token allotment...
>
> anyway, we're trying to explore the web - page - layout space as well as possible...
>
> the thing is... i belive there is infinte space between here and there....
>
> adn this fucking ui is impeding me...
>
> fuck this ai... build some cool stuff... ggo?

## What the analysis found

Sixteen layouts at `styles/layouts/`, each a directory + a `page.js` + a
`layout()` function + a readme paragraph. Every one of those functions is the
**same shape**: a `div.c(<class string>)` tree whose leaves call parts of one
shared `site` object (`web.js`). The content is already one object; only the
class-string tree differs.

So a layout is not code. **A layout is a nested list of class strings**, and the
cost of visiting a point in the space is currently a directory.

That is the token allotment: sixteen hand-authored samples of an infinite space,
each costing ~40 lines and a nav slot, browsed one at a time through an exhibit
built for teaching rather than for searching.

## The proposal

Make a layout a **string**, then the space is browsable.

1. A text format — indentation is nesting, a line is `<class tokens> > <part>`.
   The whole Docs layout is six lines.
2. A generator — `seed → text`, so every point in the space has an integer
   address and the space can be *sampled* instead of authored.
3. A ruler — one spec rendered live at five widths **at once**, top to bottom, so
   the whole width curve is one glance rather than a drag.
4. A lab page — the text on the left, the ruler on the right, a strip of
   generated seeds to jump into, the spec in the URL hash so any point is a link.

MVP is the lab at one url. Deferred to phase 2: promoting a spec back into a real
`page.js`, mutation/neighbour browsing (change one word, see the six neighbours),
saving pinned specs, and a spec→`LayoutTool` score.

## Steps

1. Read the layout tier — what a layout costs today
2. `spec.js` — text → live view
3. `gen.js` — seed → text
4. `ruler.js` — one spec at five widths at once
5. `space/page.js` — the lab, hash-addressed
6. Link it from `layouts/` and verify in the browser
7. Readme + land
