# Decisions — colstyles

Answering the owner's question — *do we have control over how a columns tree renders* —
with every hook shown live (`hooks/`) and one content tree (`tree.js`) wearing three
complete looks (`finder/`, `cards/`, `ink/`).

## `width: "fill"`, not `"large"`

The three look pages and `hooks/` first shipped `width: "large"`. Under `/imagine/`'s own
columns row the chain is four deep (Imagine → Vary → Colstyles → the page itself) before the
embedded `demo.app()` box even starts, and `large`'s flex-basis is the same `1 1 0` every
unworded column already has — so Vary, Colstyles and a `large` leaf split the row's leftover
**evenly**, three ways, regardless of the word. Measured at 1920: all three landed at 565px,
the embedded demo box got 538px, and the tree's own three columns (14 + 16–40 + 28–64em)
needed ~1000px — the box scrolled to show only its last column.

`fill`'s `flex: 1 1 100%` is the fix, not a width bump: its basis starts from the WHOLE row,
so it takes everything left after the ancestors' floors instead of an equal third. Same
change at 1920: Vary and Colstyles settled at their 16em floor (256px) and the leaf took
1184px — the embedded box now gets ~750–830px, enough to show all three of its own columns
with only a small, honest overflow (matches the doc's own "widening a column is never the fix
for dead space" — the fix here was the right WORD, not a wider one).

## Cards — margin on the body, never `gap` on the row

The seam (`column_grab()`) is a real flex item with `flex-basis: 6px` and
`margin-inline-start: -6px` — net outer size zero, so "the row's arithmetic is still nothing
but the bodies" (`core/Page/doc/columns.md`). A `gap` on `.page-columns-row` would add itself
between *every* flex item, seam included, fighting that same zero-outer-size math. Cards gets
its gutter from `margin-inline` on `.page-column-body` instead — a size on the ITEM, the same
knob a width word already turns, never `display` or `flex` on the row.

**What survived:** the seam still drags correctly (headless-tested — grab, drag, drop; no
console errors). **What moved:** it now floats in the card gutter instead of sitting flush
on a hairline, since there is no hairline in this look. Neither is a bug; it is the honest
shape of the trade.

## The specificity floor `border-inline-end` sits behind

Core's own body rule — `.page.columns .page-column-body { …; border-inline-end: 1px solid
var(--line); }` — is three classes deep on purpose (`Page.css`, the flex/border block). A
look's own `.vary-colstyles-look-X .page-column-body { border: none }` at two classes LOSES
outright regardless of load order; the hairline survives every such override silently (no
console warning, no visual cue beyond "the border didn't change"). Both Cards (removing it)
and Ink (recolouring it) had to restate `.page.columns` in their own selector to match core's
count — `.page.columns.vary-colstyles-look-cards .page-column-body`. This is the general
shape of the trap, not specific to this lab: any look that touches `flex`, `min-width`,
`max-width` or `border-inline-end` on a column body needs the same bump.

## Ink — `--code-bg` / `--code-ink`, not a new pair

The palette's tokens are all `light-dark()` — built to stay READABLE in both colour schemes,
which is the opposite of what a look wants when it wants to stay VISUALLY DARK in both. `--ink`
itself flips (dark text in light mode, light text in dark mode), so `background: var(--ink)`
would give Ink a black panel in light mode and a near-white one in dark mode — the two modes
would look like different looks.

`--code-bg` / `--code-ink` (`lew42.css`) already solve this: both sides of their `light-dark()`
are dark, because a code block wants to stay a dark box under a light page (and a dark one).
Reusing them means Ink never drifts from the one dark-in-both-modes pair the theme already
ships, instead of a second constant nothing keeps in step with it.
**Gap found:** the token system has no plain "always dark" (or "always light") primitive of
its own — every existing token is deliberately `light-dark()`-flipped for contrast, and the
only way to get a fixed visual direction today is to find (or hand-write) a pair whose two
`light-dark()` sides already agree, the way `--code-bg` does.

## What tokens can't reach (the honest gaps)

- **No token exempts one flex item from the row's `gap`.** Cards needed a different property
  (`margin`) rather than a retuned number, because there is no "seam is exempt from gap" knob.
- **No "always dark" / "always light" token primitive.** Ink works because `--code-bg` /
  `--code-ink` happen to already be one; a look that wanted the opposite (always light
  panels on an otherwise-dark site) would have to hand-write its own pair the same way.
- **The empty-slot hairline pattern (`.page-columns-row`'s `background-image`) is a `background`
  shorthand.** Any look that sets `background` on the row (Cards, Ink both do, for the floor
  colour) loses that pattern outright — there is no way to keep the ghost hairlines and also
  own the row's colour, short of restating the `repeating-linear-gradient` by hand. Neither
  look here missed it (both show real columns, not empty slots), but a look with fewer than
  three visited columns would.

## 2026-08-31 — item selectors reach the generator's own classes too

Ink's three `.page-column-item` rules are now `:is(.page-column-item, .page-gen-item)` —
[`core/Page/generator/`](/framework/core/Page/generator/) draws the same tree shape under its
own class (`doc/decisions.md` there measured the gap: row/body/head/title carry over verbatim,
the item never matched). `:is()` of two single classes is still one class of specificity, so
this changes no cascade outcome on any page that already worked.

**What this does and does not do.** `core/` may not import `/imagine/`, so `colstyles.css`
still never loads on the generator page today — the generator dresses its own `.page-gen-item`
from `generator.css`'s own copy, unchanged. This fix is for the day colstyles is loaded by
hand there, or reused somewhere neither file anticipated: the class list was the only thing
narrower than it needed to be, and now it isn't. Verified: `git diff` touches nothing under
`core/Page/generator/`; a live probe of `/framework/core/Page/generator/#42` lists 59
stylesheets and `colstyles.css` is not one of them; the ink look's own screenshots are
pixel-identical before and after at 1920 and 3440.

## What was cut

- No fourth look. Three was the ask; a fourth would have needed its own reason and none of
  the interaction notes above pointed at one. Reconsidered 2026-08-31 against the alpha ladder
  (`--fill-a04/08/16/32`, transparent black/white stacking) — a "Glass" look stacking those by
  nesting depth is a real candidate, genuinely different from Cards (opaque) and Ink (solid
  dark), but it wants its own design pass rather than a rushed fourth entry; roadmapped, not
  built.
- No "before/after" pair for `index: true` on the hooks page — one live demo plus a caption
  naming what it replaces was enough; a second box showing the undesirable double-list would
  have doubled the code for a point the caption already makes.
- `vary/readme.md` still says "Three labs" — outside this task's fence (`colstyles/**` + the
  one `children:` line in `vary/page.js`); flagged for whoever's fence includes it next.
