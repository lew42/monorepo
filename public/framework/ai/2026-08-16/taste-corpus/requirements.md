# Taste corpus — does the rulebook agree with an obvious right answer?

Follow-up to [`layout-generator-rules`](../layout-generator-rules/), same effort
(`group: layout`). Mike's standing instruction for that run: *don't stop, keep
working through this and the next usage window.*

## The gap this closes

`ext/LayoutTool/taste/`'s own readme names it first under Open:

> **Nothing validates a range against a human's judgement.** `LayoutTool/tests/`
> is a corpus of declared verdicts for `rules.js`; there is no equivalent for
> taste — no set of pages a person has ranked that a band's ordering could be
> checked against.

That is the load-bearing gap. Eleven bands were refit twice — six on calibration
and four more on use — and **nothing anywhere asserts that the resulting order is
right.** A rulebook that cannot be wrong is not a rulebook.

## The move: degrade a layout on purpose, and assert the order

A corpus of "pages a person ranked" needs a person. A corpus of **pairs** does
not: take a layout, break one specific thing about it, and the original is better
by construction. Nobody has to rank anything, and every pair names the band it is
about — so a failing pair says *which* band stopped working, not just that
something did.

```
document  +  "unbound the prose"   →  taste must rate the original higher
docs      +  "took the padding out" →  …and so on, for every preset
```

## Steps

1. `taste/corpus.js` — the degradations, each a named transform on spec text,
   each declaring the band it should cost.
2. `taste/corpus/page.js` — every pair rendered, rated and judged, live.
3. Run it, and **fix what it catches** — a degradation the rulebook does not
   notice is a finding about the rulebook, not about the case.
4. Record the verdicts in `taste/readme.md` and close the Open item, or replace
   it with a narrower one.
