A stat-tile strip: `grid gap auto` at `--column: 9em`, each tile a `card` with
a tight `--gap`. No `stats.js`, no `.ui-stats` — both were demoted for having
zero call sites while three hand-rolled copies of the same tile existed
elsewhere on the site.

## Why there is no `ui.stats()`

The strongest evidence against it is on this very page: the demo that wants
an icon in the label row abandoned the function form entirely, because a
function has no room for a row its author didn't anticipate. `--column` is
the whole "variant" mechanism — shrink it and the same markup goes from a
two-up card grid to a four-up tile strip, no selector written.

## Improvements

Nothing ranked: the "three hand-rolled copies before this page existed"
finding is the strongest evidence in the whole directory for the function/
template bar, and it's already stated plainly in the exhibit note.
