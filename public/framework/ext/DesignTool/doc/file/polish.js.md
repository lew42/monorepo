The second tier: not BROKEN, but OFF. `rules.js` reports geometry that fails;
nothing there fires on a page that merely looks wrong, which is most of what a
designer would actually change by hand. These seven rules do — near-miss
alignment, padding that doesn't scale, a ragged row, two h1s, structure with
nothing to see it by — and every one of them **caps at medium** in `score.js`,
together, not per rule.

## Two floors for padding, because they measure different things

`pad-scale` checks both a font-size floor (can the text breathe) and a
width floor (is the frame proportionate to what it holds) — 20px on a 1000px
box passes the first and fails the second, which is exactly the owner's original
complaint about it "looking off" while nothing was technically cramped.

## `alignment` and `heading-offset` split one problem by window size

A 3–12px near miss is `alignment`'s job (wider gaps read as a deliberate
second column); a heading sitting any distance from the text block directly
beneath it is `heading-offset`'s, because a heading and its own text are never
two columns. Same underlying complaint, two rules, because the safe window is
different for each relationship — worked in full in
[False positives](../../knowledge/false-positives.md).

## `double-pad` could not fire, for its whole life

It demands ≥6px of padding on the parent, then required the child to be at least
`parent.clientWidth − padding − 4` wide to count as filling it. A child that
fills a padded parent is `clientWidth − padding × 2` wide, so the two conditions
together resolved to `padding ≤ 4` and `padding ≥ 6`. **Zero findings in 854
site runs**, and it read exactly like a rule the site never happened to trip.
Now tested against the parent's real content width, with a corpus case.

⚠ The general lesson: **a rule that never fires is a claim about the site and a
claim about the rule, and only one of them is checkable from the output.** The
corpus is where the difference is settled.

## `ragged-row` is deliberately low severity

`Page.css` sets `align-items: start` on preview walls on purpose, so a ragged
row is a design choice as often as a mistake — the rule flags it rather than
rules on it.

## Improvements

1. **`level()`'s class-name fallback (`/\.(h[1-6])\b/`) only matches a class
   literally named `h1`–`h6`.** A heading rendered as `<div class="page-title">`
   (a real shape on this site — see `Page.css`'s title styling) is invisible
   to `hierarchy` and `heading-offset` alike. Both rules already lean on tag
   name first; the fallback exists for exactly the case it can't actually
   reach. *(medium, useful — would need a documented convention for "this div
   is acting as a heading," which doesn't exist yet.)*
2. **`invisible`'s threshold (`painted >= 2`) and `whitespace`'s (`share <
   0.25`) are two different heuristics for "does this page have visible
   structure," arrived at independently.** Worth a line in
   `knowledge/thresholds.md` explaining why they don't share a definition —
   currently that reasoning lives only in each rule's own comment. *(simple,
   speculative.)*
