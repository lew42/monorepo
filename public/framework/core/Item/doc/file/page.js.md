The Doc page — and, unusually for a `page.js`, also the module's real test
suite. Eighteen `checks`, each a label and a synchronous-or-async predicate,
run on every page load and rendered as a pass/fail row with a live tally.
"Red is a broken framework, not a broken page" is the file's own words for
this, in the Overview.

## Why the tests live here, not in a `.test.js`

There is no test runner in this framework (no build step — see `CLAUDE.md`),
so a page that imports the class and exercises it **is** the test, and putting
it on the page a maintainer already visits means the suite runs every time
someone views the docs, in every browser that loads the page, with no separate
command to remember to run.

## What changed in this audit

Converted from `new Page({...})` to `new Doc({...})`: added `subject: Item`,
the `properties`/`methods` lists (25 members between the two), `notes:
"envelope"`, and `files:`. The eighteen checks and the `row()`/`tree()`
machinery are untouched — verified with `node --check` after the edit. Two
`md()` calls gained links into the new `doc/envelope.md` note and a mention
that every verb in the "The verbs" block now has its own API page.

## Improvements

1. **The eighteen checks are excellent regression coverage but poor reading
   order.** They run in the order they were written (round trip → registered
   type → unknown type → adoption → …), not grouped by which verb they're
   testing. A reader scanning the live grid for "does `move()` work" has to
   read labels, not jump to a section. *(medium, useful — the checks
   themselves don't need to change, just their grouping under a couple of
   `h2`s.)*
2. **The DOM checks (`row`, the tally) duplicate machinery that a "test demo"
   pattern would generalize.** If a second core module ever wants the same
   "assert live, render pass/fail" trick — and `List`'s page could use one, it
   currently has no automated checks at all, only interactive buttons — this
   is worth lifting into a small shared helper rather than copy-pasted a
   second time. *(medium, useful — genuinely speculative until a second
   caller wants it; see this pair's audit Recommendations.)*
