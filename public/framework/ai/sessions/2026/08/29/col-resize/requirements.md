# col-resize — resizable columns + `hug` / `fill`

## The ask (owner, verbatim, 2026-08-29 — from `imagine-program/requirements.md`)

> can we make the columns resizable?

> we need a "fill" and "hug" mode for columns.  for small columns, we could set them to "hug", so
> they only use as much as they need.  and for some columns, we might want to fill, use all the
> space.

## Scope

1. **Resize** — drag a column's inline-end seam. Hand-rolled pointer events (no `ext/grip`; core
   must not depend on ext). A drag writes inline `--page-column-flex/-min/-max` on that body — the
   same seam the width words use, one level stronger. Double-click resets to the page's word.
   Per-visit only; the persistence question gets logged, not answered.
2. **Two width words** — `width: "hug"` (content-sized, no grow) and `width: "fill"` (spends the
   leftover row, no takeover — distinct from `full`, which claims the whole row and collapses its
   ancestors). Class family `.page-column-<word>` exactly, so the generator's menus line up.
3. **Docs** — `doc/columns.md` gains resize + the two words; `doc/method/` gets an entry per new
   method; the Finder demo wears one `hug` and one `fill`.

## File fence

Owned: `core/Page/Page.class.js`, `core/Page/Page.css`, `core/Page/doc/**`,
`core/Page/overview/columns/finder/**`.
Not: `core/Page/page.js`, `core/Page/generator/**` (a sibling is adding hug/fill to its menus
against these class names — the names are the contract), `overview/columns/uses|examples/**`,
`ext/Playground`, `dev/DevBar`, `ext/grip`.
