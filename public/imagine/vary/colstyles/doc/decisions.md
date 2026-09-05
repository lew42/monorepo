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

## 2026-08-31 — Glass, the fourth look

Built the candidate the entry below scoped: `--fill-a04` on columns behind the one you're in,
`--fill-a08` on the one you're in, `backdrop-filter` on both plus the sticky head — the same
alpha ladder a chip or a hover already wears (framework.css), no new colour.

**The trap the first attempt walked into.** Depth was going to read off `.active-ancestor` /
`.active-page` (Page.css) — the real Router's own marks for "left of the open leaf" and "the
leaf". They never fire: `demo.app()` (`ext/demo/app.md`) has no Router at all — its own doc
says so ("Marks with `aria-current`, never `.active`") — so every column in every colstyles
demo box is plain `.default`, and a class-based depth rule painted all three panes the
identical rung. A headless probe of computed `background-color` caught it before a screenshot
would have (all three read the SAME rgba) — the fix is structural, not class-based: siblings
under one `.page` are `.page-column-body`, the drag seam, then `.page-column-pages`
(`render_column()`, Page.class.js) — core's own full-column rule already reaches sideways the
same way (`:has(~ .page-column-pages …)`, Page.css). `:has(~ .page-column-pages
.page-column-body)` means "something is still open past me" (a04); its `:not()` twin is the
leaf (a08). Verified after the fix: Shelf and Fiction (has something open past them) both read
`rgba(0,0,0,0.04)`; Selected (the leaf) reads `rgba(0,0,0,0.08)` — three distinct, correct
rungs, live in the demo box.

**Contrast, both schemes, body text (headless, actual composited pixel behind the glyphs, not
the token's nominal alpha) at 1920:**

| pane | rung | light | dark |
|---|---|---|---|
| Shelf / Fiction (behind you) | `--fill-a04` | 8.59 : 1 | 13.05 : 1 |
| Selected (the leaf) | `--fill-a08` | 7.90 : 1 | 11.66 : 1 |

Both schemes, both rungs, comfortably over the 4.5 : 1 floor — `--ink` (`#3f3f3f` on lew42) is
dark enough, and `--fill-a08`'s heaviest tint is still a long way from moving the floor to grey.
Zero console/page errors; folds correctly at 400, holds at 1920 and 3440 (screenshots, both
schemes, `ai/2026-08-31/drafts-and-glass/`).

**Verdict: shipped, not skipped.** It reads as depth, not decoration — the row's own soft
gradient plus the two rungs are the only new colour, and the frosted head is the one place
`backdrop-filter` earns its keep (a sticky bar over scrolling text, the exact case the property
exists for), not sprinkled everywhere for effect. Two rungs, not N: `:has()` answers "is
anything still open past me", not "how many", and a chain of nested `:has()`s for a third rung
nobody asked for.

## What was cut

- No "before/after" pair for `index: true` on the hooks page — one live demo plus a caption
  naming what it replaces was enough; a second box showing the undesirable double-list would
  have doubled the code for a point the caption already makes.
- `vary/readme.md` still says "Three labs" — outside this task's fence (`colstyles/**` + the
  one `children:` line in `vary/page.js`); flagged for whoever's fence includes it next.
  (Fixed 2026-09-05, ux-rethink round 2 — the readme now says "Four".)

## 2026-09-05 — the permutation was named, not built; now it is, on one axis

The owner's ask that night, "color variations permutated with layout variations," named a gap
this lab hadn't closed: `content()` showed four looks on ONE fixed width, and the layout axis
(the width word) only existed, uncrossed, in `hooks/`'s own `widths()` control. Added a section
crossing all four looks against two real column widths (18em, 34em) — the same `tree()` each
look page already uses, at `zoom-25`, eight small boxes instead of two separate claims. Verified:
zero console errors, `document.documentElement.scrollWidth === innerWidth` at 1280 (no real
overflow — a handful of nested `.page-column-body` rects read a few px left of the outer column
in `getBoundingClientRect()`, a `zoom` sub-pixel artifact, not a layout bug).

**Left undone, on purpose:** the reverse crossing — one look carried through several
*structural* layouts (`place/`'s add/swap/carousel) rather than just a width — is real work,
not a line item; named here so the gap stays visible instead of silently closing itself in a
"done" checkbox.
