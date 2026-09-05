# Rethink — the second UX pass

**What it is.** [Yesterday's review](/imagine/review/) asked one question of all eighteen
realms under `/imagine/`: can a stranger say what this page is for in ten seconds? This is the
second pass, on 2026-09-05, with a harder one: **is this the best shape this page could have?**
Eighteen Sonnet reviewers, one per realm, each had to *actually build* an alternative layout on
its realm's landing page, shoot it before and after at 1280 and 3440, measure it, and keep it
or put it back with the numbers that decided it.

**Use.** Open [the page](/imagine/review/rethink/). Seven keeps first, then the eleven that did
not — every card is one realm's before/after pair, its reviewer's own five sentences, and the
numbers. Click a shot for full size; click "the reviewer's log" for that agent's whole run.

**Watch out.**

- **Every sentence on the cards is its reviewer's own words**, harvested verbatim. The value of
  the page is that eighteen agents who never spoke to each other agreed. Do not tidy them.
- **The page is not built as the owner's 3-column card, on purpose.** Its own finding says to
  use that shape when the centre column is *alive*; two static screenshots are not, and three
  tracks measured the pictures down to 370px from 680px. The reasoning is in `page.js`'s
  comment on `card()`.
- **The container query is on `.rethink-cards`, never on `.rethink-card`.** A container query
  cannot restyle its own container and fails in silence — two reviewers lost a build cycle to
  exactly this the same night. Its lengths are `rem`, not `em`: inside a container query `em`
  resolves against the *container's* font-size, and a first pass using `34em` never matched.
- This page and `/imagine/review/` are two `fill` siblings sharing one columns row, so each is
  about 1,504px at 3440. That is why the cards are one-per-row and not a grid.

**More.** The reviewers' full logs, with the reverted code and every caveat, are under
[the day's tasks](/framework/ai/2026-09-05/); the manager's own log is
[ux-rethink](/framework/ai/2026-09-05/ux-rethink/). The rule this pass produced lives in
[the layout system](/imagine/layouts/) and [the approved five](/imagine/design/layout/approved/).
