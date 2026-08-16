## What this file is

The design record for the whole-page layout catalog: the shape of the
directory, what the 2026-08-12 merge kept and deleted (ten layouts from
`core/Page/layout/` absorbed six pages from this tier), why cards are drawn
by the child rather than a shared gallery module, and three things that will
bite anyone extending it.

## The merge table is the fastest orientation to the directory's history

Twelve survivors with one line each on what they teach, six deleted with one
line each on where the lesson went (`cards` → `grid gap auto` is a word;
`masthead` → `landing` plus an optional CTA). Reading this table first
explains why some obvious layout names (`cards`, `holy-grail`, `masthead`)
don't exist as urls.

## The three bite-prone traps

`children` is the only list (no second map to fall out of sync — `fit` did,
silently, before this was fixed); a layout page reaches up for its nav,
never sideways; `overflow-y` belongs to the row, not the panel inside it. All
three recur across the sixteen individual layout pages without being
re-explained each time — this is their one canonical statement.

## Improvements

1. **Nothing ranked** beyond the file's own "Open" section (media queries
   not following `zoom`; the twin-screen vs. quarter-size pedagogy split),
   which already names what this record considers unfinished.
