# Pagination — decisions

Landed 2026-08-21, wave 2 of the graduation. Task log:
[`ai/2026-08-21/ux-graduations/`](/framework/ai/2026-08-21/ux-graduations/).

## The caller census: there was nothing to keep compatible

`ui/pagination/page.js` is the only file in `public/` (`ai/` excluded) with pagination
markup — no `.js` stylesheet, no `ui.pagination()`, no `.ui-pagination` class anywhere.
`ui/doc/record.md` §11 already recorded `.ui-pagination` as dropped in the 2026-08-09
review, "a class styled nowhere." Unlike `ui/tree`, there was no function and no CSS to
carry forward — the class reads nothing but `framework.css`'s own `button` and `.prim`,
exactly what the template did.

## Class-name stamp check

Grepped every `.css`/`.js` under `public/framework` (`ai/` excluded) for a bare
`.pagination` selector: zero hits. Plain `Pagination`, no prefix needed.

## What "remembered" actually was

The graduation rule is "something has to be remembered between renders." `current` is
that thing — the template's own page said the quiet part out loud: *"a component holding
the current page on your behalf is the thing this template exists to avoid — the caller
already has that number."* Read narrowly, that argues against ANY class. Read against the
rule this whole wave uses, it argues for the SAME class Filter and Tree are: the caller
still owns the *data* (`pages`, what a page number means), the class owns exactly one
number and the wire that fires when it changes — not a difference in "who has the number"
but in "who does not have to write `go()` inline at every call site."

## No `Pagination.Button` part

The brief that opened this wave named `Pagination.Button` as a candidate part, alongside
`Tags.Chip`, "only where real." It is not, here: every button is homogeneous — a label, a
`.prim` toggle `go()` drives centrally, one click handler that calls `go()` with a number.
There is no per-button branching the way `Tree.Row` branches on `href`/`kids`, and no
per-button state the way `Tags.Chip` owns its own × listener. A static `Button` class
would wrap one `<button>` and one class toggle in ceremony a plain method already reads
as a loop — `page(label)` stays a method, not a part. Logged, not defaulted past.

## `go()` toggles two buttons, doesn't rebuild the row

Same move as `Filter.set()` and `Tree.select()`: `this.buttons` is a `Map` from label to
button, built once per `draw()`, so `go()` removes `.prim` from the previous current and
adds it to the new one — two DOM writes, not a re-render of the whole row.

## No named extension

Nothing in `ui/pagination/page.js`'s own doc asks for a subclass — no "next" note the way
`ui/tree`'s readme named keyboard roving. **Zero named extensions shipped.**

## Parked
- **A `total` bound on `go()`.** Considered and rejected: `pages` can legitimately elide
  the real count behind `"…"`, so the class has no reliable maximum to clamp against
  without the caller passing one explicitly — an option this wave didn't ask for.
