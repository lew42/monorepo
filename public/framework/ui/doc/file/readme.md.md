The maintainer record: why nineteen components split three-and-sixteen, where
the CSS strategy lives, and the log of the 2026-08-09 review and the
2026-08-12 unification onto the site's one demo system.

## What it gets right

The "logic a user shouldn't have to carry" bar, stated once at the top, is
what every per-component decision in `doc/record.md` traces back to — a
maintainer reading only this file already has the rule the whole directory
follows, before reading a single component's page.

## What changed in this pass

Added a "Who uses this module" table (Step 2 of the documentation skill) and
a note on the `ext/Timeline` name collision, both previously undocumented
here. See the audit report for the full caller list and the overlap case.

## Improvements

1. **No section is over two paragraphs**, so nothing here needed a fresh
   `doc/<name>.md` breakout beyond the existing `doc/record.md`. *(n/a — already
   correct)*
2. **The "Two things that will bite" section is short and could grow.** As
   more components ship CSS, the out-of-flow-clips-inside-a-stage trap will
   recur; worth a one-line pointer to `tooltip/page.js` and `menu/page.js`
   where it's shown live, so a maintainer lands on a working example rather
   than re-deriving the fix. *(simple, useful)*
