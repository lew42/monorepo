What each shape actually uses of a 3440 screen, measured, and the three ways to
spend width: more tracks, more regions, or places inside a row.

## The table is the argument

Six library entries with their measured `width_used` at 3440 — 88%, 83%, 75%
against 28%, 27%, 18%. The prime objective says widescreen space gets *used*;
this is the only place on the site that says by how much, per shape.

## It refuses one fix explicitly

**Widening the column is never the answer.** It trades a `dead-space` medium
for a `measure` high, and one of those is content nobody can read. That is the
single most likely wrong response to a `dead-space` finding, which is why it is
stated as a ⚠ rather than left implied.

## It reframes the finding as a question

A `dead-space` medium does not mean "this is wrong"; it means "is there a
second thing the reader wants beside it?" — and if there genuinely is not (a
login form, one article, a settings pane), `defer.js` is where the finding goes.
That is the rule's own design intent (`readme.md`'s "one score, or two?"
decision) restated where an author will meet it.

## Improvements

1. **Every number in the table is from one run at one moment.** Nothing
   re-measures them, so this file can go stale exactly the way a hand-typed url
   list does. Generating the table from a stored run would fix it and would need
   somewhere to store the run — `audit/findings.json` is the existing shape.
   *(medium, important.)*
