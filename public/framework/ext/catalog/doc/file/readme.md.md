The maintainer's document: what `catalog()` does, why it runs from
`initialize()`, who actually calls it, and the two things still open. The
reader's document is `page.js` — showing the rail running is that page's
job; explaining the fork that produced it is this one's.

Served twice: cited by a maintainer reading the directory, and collapsed at
the bottom of the Overview tab via `md.details(import.meta, "readme.md")`.

## What moved out

The full narrative — nine dated design decisions, each with the option
weighed against — used to be this file in its entirety, at design-record
length. It now lives at [`doc/decisions.md`](../decisions.md), summarized
here as a five-row table; `readme.md` itself stays to one screen, per the
skill's own rule for a section that outgrows two paragraphs.

## Improvements

1. **The "Who calls it" table is this audit's one-time framework-wide grep,
   not a live query.** Accurate today (2026-08-15); a tenth caller added
   next month won't add itself here. No fix that isn't a build step —
   recorded so the next audit knows to re-grep rather than trust the table.
   *(medium, important)*
