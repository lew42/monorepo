# simplify-audit — requirements

## The ask, verbatim (the owner)

> spawn some minions to analyze the thoroughness and simplicity of our styles, UI, layouts, etc. we need to greatly simplify our framework. I'm not sure the best way to do that.

## Scope

ANALYSIS ONLY. Zero framework edits. The deliverable is `proposal.md` in this dir — a ranked
simplification list the owner (and the mastermind) judge. Counts first, judgment second; every
claim carries a number.

## Method

1. **CSS vocabulary census** — `framework.css` + the layer files. Every utility word, its
   definition size, and its LIVE usage count across `public/` (class attributes + `.c()` calls).
   Outputs: dead list (0–2 uses), redundant list (two words, one effect), confusing list (same
   word, different meaning by context). Start from `framework/styles/css-scopes.txt` and any
   existing census tooling — don't rebuild what exists. Raw census saved as `census.json`.
2. **Component overlap map** — systems that do the same job, VERIFIED with usage counts:
   tab systems, card/preview systems, panel systems (Panel vs Playground), demo variants
   (read `../demo-merge/proposal.md`, fold its numbers in, don't redo), generators
   (styles/layouts vs core/Page/generator), and the `old/` `core/new/` `core/legacy/` dirs
   (dead weight in files and KB).
3. **Layered-CSS health check** — rules per layer, per file; specificity battles documented in
   `doc/decisions.md` files (grep "specificity", "out-rank", "0,2,0") — each is a cost of the
   current structure; count them.
4. **THE PROPOSAL** — ranked list, each item: what merges/deletes, the evidence (usage counts),
   the risk, the effort, what the site loses. Ordered by value-per-risk. Plus a "do not touch"
   list (things that LOOK redundant but earn their place) and the three moves to make first.

## Fences

- Write only inside this task dir. Everything under `public/framework/` is read-only.
- Scratch (probe scripts, intermediate JSON) → the session scratchpad, named `simplify-*`.
- Never kill or restart the :80 dev server. Never drive the owner's tabs. Never stash. Never commit.
- Headless screenshots only if a visual claim needs one; keepers land in this dir.

## Consistency check

Total utility words counted in the census must equal the rows in the census table and in
`census.json`.
