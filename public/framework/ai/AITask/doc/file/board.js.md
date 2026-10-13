The board's shape: a flat list of task rows, one card per row, on a time
spine. `dated()` is the index's listing, `list()` the day's, and `group()` the
titled run both wrap themselves in. It renders rows; it never loads them —
that is `dashboard.js`, which is what keeps the import one-way
(`dashboard.js → board.js → card.js`) and out of the mutual-import trap.

## A heading only where the label changes

Every row *has* a heading label; only the ones that differ from the row above
get printed. That single rule produces both behaviours the board wants: today
reads as a run of distinct times (`12:34 PM`, `12:22 PM`, …), and a past day
collapses into one `SATURDAY` over all of its cards. There is no grouping pass
and no second data structure — `dated()` walks the sorted rows once and
remembers the last label it wrote.

## What "by date" means: the day directory, not the timestamp

`heading()` and the sort key both read the **day dir** out of the url
(`ai/<date>/<slug>/`), not the manifest's stamps. A task that started before
midnight and landed after it stays under the day that holds its files, which
is the day a reader will look for it under. It also means a task with no
timestamp at all — a proposed one — still has a date, and files at the bottom
of its own day rather than off the end of the board.

Beyond six days back the weekday is joined by the date, because "TUESDAY"
alone names two different days once a week has gone by.

## ⚠ The stamps are parsed, never string-compared

Task logs carry both `2026-08-16T17:22:30.464Z` and
`2026-08-16T12:22:30-05:00` — the same instant, written two ways, depending on
which session wrote the line. Compared as text the UTC one sorts five hours
late, which put a 12:22 PM card above a 12:34 PM one on a board whose whole
point is chronology. `newest` runs everything through `Date.parse`. The bug is
invisible in any log where every writer happens to agree on a format, which is
why it survived in three files (`board.js`, `dashboard.js`, `effort.js`) until
the dated list made the order legible.

## ⚠ `new Date("2026-08-15")` is not August 15th

A bare `YYYY-MM-DD` parses as **UTC** midnight, so west of Greenwich it
renders as the day before — every heading on the board would have named the
wrong weekday. `local()` builds the date from its parts instead. Nothing
throws and the dates look plausible, which is the whole hazard.

## Improvements

1. **`day_of()` is a third copy** of the "second segment from the end"
   assumption, alongside `dashboard.js`'s walk and the one `card.js` just shed.
   The readme records the fixed-depth `ai/<date>/<slug>/` shape as Open;
   whichever change generalizes it should collapse these into one helper.
   *(simple, important)*
2. **`group()`'s `render` parameter is a two-caller switch** — the day passes
   nothing (plain `list`), the Active strip passes `dated`. Fine at two; if a
   third shape appears, the callers should compose `.ai-group` themselves
   rather than grow an enum. *(simple, speculative)*
3. **A run of one card still costs a heading**, so today's section is
   effectively a heading per card. That is what was asked for, and it reads as
   a timeline — but if a day ever holds forty landed tasks it becomes eighty
   rows of alternating heading and card. Worth revisiting at that volume, not
   before. *(medium, later)*
