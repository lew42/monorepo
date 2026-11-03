## What this file is

`(seed, opts)` → spec text, recursively. The generator no longer picks a part
from a flat list; it draws a SHAPE (the body's own arrangement, one of the
nine `model.js` weights), fills its tracks with ROLES, and recurses through
INNER wherever a track is deep enough to split. Every structural draw comes
from `model.js`; every size comes from `ext/DesignTool/taste/ranges.js`'s
`AUTHOR` table — the same numbers `taste.rate()` grades the result against.

## `opts` may still be a bare number

`ext/Panel/generate.js` calls `gen(seed, depth)` and is owned by another
session — `roll()`'s first line (`typeof opts === "number" ? { depth: opts }
: opts`) is that compatibility promise stated as code, not only as a comment.

## A fixed-measure role is always a leaf, whatever the depth dial says

`block()` checks `!INNER[role]` before recursing. `rail` has no entry in
`INNER` at all, so depth cannot make one split — a nav rail that divides is
two nav rails. `claim()`'s branch that emits a fixed `--basis` is gated the
same way, and the readme records the measured cost of getting this wrong: a
fixed *container* that then splits hands its children a fraction of an
already-small share, columns down to 20px at 3440 on `compose/` before this
was leaf-only.

## It still reaches broken layouts on purpose

Unchanged since the depth dial replaced the fixed skeleton: this is a search
over a mostly-invalid space, not an enumerator of valid pages. The format's
silent words (`scroll`, `stick`, `fluid`) are position-sensitive and nesting
multiplies exactly them, so past about depth 4 most rolls are slivers.
Shipped raw — no score, no guard rails — was the owner's call; `ext/DesignTool`
scoring stays phase 2.

## Two bounds that are not guard rails

**`CAP` (80 boxes).** A fresh depth per child can branch faster than it
shrinks, and five ruler shots plus twelve wall tiles all render at once —
this stops a deep roll hanging the page, it does not make any roll valid.

**A fixed `--basis` only on a leaf.** `ext/Panel`'s `share()` reads `--basis`
as a *fraction* of the row where on a real page it is a *minimum*. Measured
on `compose/` at 3440: leaves-only took the page from `F 8` to `D 64` and the
narrowest panel from 20px to 410px.

## Improvements

1. **The generator still covers two families — rails and bands.** Overlays
   and the nested-column shapes aren't in `SHAPES`, so parts of the
   hand-written rail can't be reached from an integer; `shell` (a column
   inside a rail) is the shape `gen()` has no move for at all, and
   `presets.js` reaches it by hand. *(medium, already the module's own named
   next move)*
