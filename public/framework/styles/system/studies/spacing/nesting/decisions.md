## The record - 2026-09-18, nesting is padding

### What was measured

One dataset - real text lifted from this framework's own `ux/Tree` module (its own
one-line blurb, and the first sentence of the "compare", "keys" and "words" demo notes in
`framework/ux/Tree/page.js`) - a topic, three items, and each item's one-line detail.
Drawn four ways on one page (`page.js`, `nesting.js`, `nesting.css`):

- **(a) Cards in cards in cards** - three real boxes (`.surface.pad`, the framework's own
  ground-plus-padding utilities), one inside the next: the topic, an item, that item's
  detail.
- **(b) Two levels** - the page's own gutter, plus exactly ONE box. Every item is a row
  inside it; an item's detail is a second line in the same row, never a fourth ground.
- **(c) Flat list** - no boxes anywhere. A hairline between rows and a real
  `padding-inline-start` (not a margin) on the item and again on its detail carry the
  hierarchy a background used to.
- **(d) `ux/Tree`, folded** - one box holding the widget, `adapt: true`, and one
  `tree.select(item[0])` right after building it, so the reader sees the SAME three
  levels with everything but that one chain shut.

Every number on the page is read live off the real render - `nesting.js`'s `measure()`
walks from the deepest text element up to the variant's own box, reading each real
ancestor's computed `padding-left` (whatever the mechanism actually is: a card's `.pad`,
`ux/Tree`'s own indent, or this page's own `padding-inline-start` on a flat row), and
reports the content width left at the deepest level plus that padding-level breakdown.
Nothing here is computed by hand from the CSS; it is what the browser actually laid out.

### The two numbers, at 400 and at 1280

| | 400px | 1280px |
|---|---|---|
| (a) cards in cards in cards | **295px** left (74% of viewport), 11 + 13 + 13 + 13 = 50px in from the edge | 211px left (16%), 20 + 14 + 14 + 14 = 62px in |
| (b) two levels | 349px left (87%), 11 + 13 = 24px in | 269px left (21%), 20 + 14 = 34px in |
| (c) flat list | 357px left (89%), 11 + 10 + 9 = 30px in | 277px left (22%), 20 + 11 + 10 = 41px in |
| (d) `ux/Tree`, folded | 275px left (69%), 11 + 13 + 16 + 16 + 5 = 61px in | 189px left (15%), 20 + 14 + 17 + 17 + 5 = 73px in |

**The decisive pair, verified twice:** at 400px, variant (a)'s deepest content box left
**295px** for the actual words - read both off the page's own live readout and off an
independent headless Playwright measurement of the same DOM element
(`getBoundingClientRect().width` = 294.78px, which rounds to the same 295px). The two
agree because both are reading the same rendered geometry; nothing is asserted that
wasn't first measured.

**The honest surprise:** `ux/Tree` (d) is not the roomiest option - it is the TIGHTEST of
the four at both widths, tighter even than three stacked cards. Its own row furniture (a
toggle glyph, an icon slot, the gaps between them, the row's own small padding) plus two
levels of indent add up to more inset than three plain `.pad` boxes do. What the tree
actually buys is not more room per row; it is that the OTHER two branches ("Keys",
"Words") cost nothing at all while folded - a card wall pays for all three branches
whether you are looking at them or not.

### The alternative: one shared ground, hairlines - when it wins

Variant (b) already IS this alternative: one box (one ground, one `--pad`) holding every
item as a row, with a hairline between rows instead of a new background per item, and an
item's own detail riding the same row rather than opening a third box. It wins when:

- **The items are many.** A card-in-card approach pays its padding cost once PER LEVEL PER
  ITEM - three items nested three deep is nine paddings stacked across the page. One
  shared box pays the cost exactly once, no matter how many rows sit inside it.
- **The items are closely related** - variants of one thing, entries in one list - rather
  than genuinely separate choices a reader is picking between. The owner's own rule from
  2026-09-17 (`layout` skill, "Boxes, padding and contrast"): options and alternatives get
  a box each so the set reads as a choice; siblings that are simply part of one set get
  nothing, or in this case, get to share the one box they are already inside.
- **The screen is narrow.** At 400px, (b) left 349px for text against (a)'s 295px - 54px
  more, for the same three levels of real content, just by not re-grounding the third
  level.

It loses when the items truly are alternatives a reader must tell apart at a glance (the
`type/anchors` study, sibling to this one, is exactly that case) - there, a shared ground
would flatten a real distinction the page needs the reader to see.

### On stating this as a rule

The first draft of this page stated "two levels is the limit" as a rule. The owner's
correction, verbatim: **"we don't want to establish things as laws that might not need to
be laws."** The page's guidance sentence was rewritten to say what the numbers show and
when each shape earns its keep - "should"/"could"/"often", never "always"/"never"/"the
limit" - and that sentence, like the takeaway above it, is computed live from the same
measurements in this table rather than typed once and left to go stale.

### Open

- `styles/css-scopes.txt` is outside this task's write fence. The reservation line for the
  prefix this page opens:

  ```
  nesting-     /framework/styles/system/studies/spacing/nesting (the four-variant comparison: .nesting-wall
               and .nesting-*)
  ```

  Until it lands there, the reservation lives only here (the same shape `type/anchors`
  used for its own `type-` prefix, 2026-09-17).
- Not measured here: 1920 and 3440. The brief scoped this study to 400 and 1280 (the
  owner's own two widths, "measured at 400" in the brief's title); the four-column wall at
  1280 already reads correctly wide of that (verified up to the viewport it was built at),
  but nobody has looked at it past 1280.
