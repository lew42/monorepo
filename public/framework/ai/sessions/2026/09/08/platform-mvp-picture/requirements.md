# platform-mvp-picture

## The ask, verbatim

> the imagine/platform page launches mvp automatically, which i suppose is fine, but shouldn't
> the url say imagine/platform/mvp/?
>
> also, the mvp page has "Running" heading, followed by breadcrumbs and then a table, and the
> table is broken. the first column is chopped off, no horizontal scroll. actually, this isn't a
> table, it's a column pager... but still, way too cramped, cut off, no scroll vertically either.

## What it turned out to be

The "column pager" under **Running** is a PNG — `ai/2026-09-06/platform-slice/slice.png`, an
1800px screenshot of a four-column row, shrunk to about a third inside a ~560px column. The
chopped first column is in the picture itself (the row was scrolled when it was shot). Nothing
is live, so nothing could scroll.

## Scope

- Cut the two columns that carry the numbers (the topic column with its like and "signed in
  as carol", and the #general column with its like) out of the same shot, side by side, and
  show that instead: `slice-columns.png`, beside the original.
- Caption it as a picture, with the whole row one click away and the live topic another.
- Answer the url question. No routing change: a `default` column is the parent's landing
  preview, not a route (core/Page/doc/method/default_column.md), and the crumb strip agrees
  with the url.

## Files

- `public/imagine/platform/mvp/page.js` — `running()` only
- `public/framework/ai/2026-09-06/platform-slice/slice-columns.png` — new
- `crop.html` here — the recipe: open it through the dev server and `shot` selector `#fig`
