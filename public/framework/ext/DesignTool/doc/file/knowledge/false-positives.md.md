What not to flag. Every entry is a real bug found **in the analyzer**, by
running it against this site and reading the output — the largest and most
concretely evidenced file in the knowledge base, and the one worth reading
before writing any new rule.

## It ends with the rule that generalizes all the others

"When a rule fires more than a handful of times on a page a human would call
fine, the rule is wrong, not the page" — stated as a checklist of ten box
categories (inline, `contents`, scroller, crop, shell, code, scaled, stretched
hit-area, table, repeat) that covers every false positive found so far, plus the
counter-rule: not every mass finding is wrong (`measure`'s 1333 hits were all
real).

## The 2026-08-15 crawl is what gave the file its arithmetic

Four classes added in one pass, all from an 854-measurement site crawl rather
than from reading one page: a table read as a stack of cards (3277 of 3414
`cramped`), a repeat counted as a habit (`hit-size` 437× for one CSS line,
`alignment` 20,924× site-wide), a line clamp read as a clip, and `boxed()`
missing at the child end. **Removing them moved the site median from 66 to 79
and F grades from 269/854 to 61/854** — which is the file's own thesis stated as
a number: the published ranking was mostly authored by the analyzer.

## Improvements

1. **The "counter-rule" section is the newest and most important corrective
   in the file** (mass findings aren't automatically false positives) **but
   sits last, after eight entries that all argue the opposite instinct.** A
   reader skimming top-to-bottom absorbs "mass finding = bug in the analyzer"
   seven times before reaching the one paragraph complicating that. Moving it
   directly after the intro (or restating the balance in the intro itself)
   would land the actual lesson — "check by hand, don't pattern-match on
   count" — before the examples that could be over-generalized from.
   *(simple, useful.)*
