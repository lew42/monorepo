Regroups a flat task list by `group` — the effort a task names itself as
belonging to. No registry: the association lives entirely in the one field
that already knows it. Full mechanism: [effort](/framework/ext/AITask/doc/effort/).

## Derivation only, since the board stopped grouping

`efforts()` and `tally()` are pure functions over a task list; nothing here
renders. It used to: `effort_groups()` drew the ai index's whole rail and
`dots()` drew each group's state roll-up. The board now lists by date, so
both were deleted rather than left uncalled (2026-08-16). What survives has
two readers — the compose box's effort `<select>`, and `glance()`'s counts on
a day tile — and the effort itself is now something you *filter to*, through
a card's tag and `dashboard.js`'s `effort_board()`.

## ⚠ `when()` parses, it does not compare text

Task logs carry both `…T17:22:30.464Z` and `…T12:22:30-05:00` for the same
instant, so `by_activity` runs both through `Date.parse` before subtracting.
As strings the UTC stamp sorts hours late and nothing complains — see
[board.js](/framework/ext/AITask/files/board.js/) for the case that exposed it.

## Improvements

1. **`tally()` duplicates `card.js`'s `DOT` mapping** (`running` → `live`,
   etc.) as its own `KIND` literal rather than importing `DOT` — two literals
   that must be kept in step by hand if a third state is ever added.
   *(simple, important)*
2. **`by_activity`'s tie-break (`live(x) - live(y) || …`) is used both for
   tasks inside one effort and for the efforts themselves** — reused
   correctly, but the double duty isn't obvious from the name alone; a
   one-line comment at the second call site (`efforts()`'s final `.sort`)
   would save a re-read. *(simple, speculative)*
3. **`efforts()` returns `counts` that only `glance()`-shaped callers want.**
   With the roll-up gone, the compose box reads `slug`/`title` and drops the
   rest. Harmless, but the return shape now promises more than any caller
   uses. *(simple, later)*
