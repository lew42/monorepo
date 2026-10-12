# Card consolidation — the plan (step 1)

Task mastermind: `task-mastermind-content-modules`. Follows [content-modules](../content-modules/), whose
census found 75 card kinds, 57 of them duplicates, 19 padding rules, a plain card drawn 7 ways.

## The owner's words (the acceptance test)

> "we need to be more careful about what kind of cards we have, whether we're using the right one in the
> right place, and what it looks like, what it does and how it behaves ... We're still breaking things
> frequently, like the wrong spacing in the wrong places."

The master's brief: "Step 1, the PLAN ONLY, on one page: which kinds merge into which (target: the
smallest set that covers every real job); ONE spacing table (each kind's padding and bleed, and the rule
behind it); and a migration order, least risky first. Show before and after for each merge, side by side."
Step 2 (the first two or three merges) waits until worktree/page-cards is merged into michael/dev.
The owner was burned by a padding sweep once already: step 1 changes NO existing CSS or JS.

## Deliverables (step 1)

1. `plan.json` — the target set: each target kind (name, job in one sentence, classes, padding, bleed,
   the rule behind the padding), and for each of the 75 catalog kinds: `into` (a target), `keep` (it has a
   real job no target covers — say which), or `drop`. Each merge carries risk (low/med/high), the number of
   files and pages it touches (grep-counted, not guessed), and what would visibly change.
2. The ONE spacing table: every target kind, its padding, its bleed, and the rule in one plain sentence
   (e.g. "a framed box pads by --pad-card, which scales with the box itself").
3. A migration order, least risky first, each step naming the pages to screenshot before and after.
4. The page: `/framework/ux/Content/plan/`: level 1 is the target set drawn live with the three numbers
   (75 → N kinds, 19 → M padding rules); then each merge as a before/after pair SIDE BY SIDE, both drawn
   live (before = the current real classes, after = the target); then the spacing table; then the order.
   Linked from the Content index and the catalog.
