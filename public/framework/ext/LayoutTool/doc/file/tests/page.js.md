The corpus, rendered. Twenty-three cases from `cases.js`, each as its own child page
with a live `live.js` panel beside it, plus a "run the suite" table that loads
every case in its own iframe at a chosen width and checks its score against
its declared verdict.

## The rail narrows the case, and that's honest

`live.js`'s own panel sits beside each case with `data-layout-ignore`, so it's
excluded from what gets measured — but it still *occupies space*, so a case
rendered here is genuinely narrower than the same case measured headlessly (as
the suite table and `findings.json` do). The comment names this directly: a
case's verdict on this page and in the headless suite are taken at different
content widths.

## `run()` measures the case body, never the page or `.app`

The page shell (title, live rail) is furniture every case carries equally —
including its own 21px theme toggle, which once scored a `hit-size` finding
against all sixteen cases identically. `.lt-case-body` is the only root whose
width is the case's own.

## `quiet` and `at_most` are how a GUARD gets tested

A `good` case passes on "no high findings", which an exemption can satisfy
merely by lowering a severity — so a case can also claim that a named rule fires
**not at all** (`quiet: "cramped measure"`) or **at most n times**
(`at_most: { alignment: 1 }`). Both apply on top of the base verdict, including
below a `from:` width, and both show in the Expected column so the table states
the claim it is checking.

## A `bad` case with `from:` is only a finding above that width

`verdict()` treats "no finding below `from`" as a **pass**, not a skip —
420px of content isn't dead space on a phone, so staying quiet there is the
case behaving correctly, and the table marks it `n/a` rather than failing it.

## Improvements

1. **The readme claims `sweep()` "runs from the console and the tests page"**
   but this file never imports `sweep` — only `frame`. Either the claim is
   stale or a sweep control was planned and not built. *(simple, important —
   a one-line readme fix or a real feature, but not both left unreconciled;
   flagged in the audit report.)*
2. **`run()` is 23 sequential iframe loads per width** and the corpus has grown
   half again. Still under a minute, and sequential on purpose (four hidden
   iframes laying out at 3440 at once is not the same measurement), but it is
   now the slowest thing on the page. *(simple, speculative.)*
