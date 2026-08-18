# depth.css

Two rules carry the ext: `.depth-scene` establishes the perspective, `.depth-layer`
places an element in it. Everything else is the sliders' own layout and the
reduced-motion opt-out.

## Perspective is stored as a number, not a length

`--depth-perspective: 1400` is unitless, and the `perspective` property multiplies
it by `1px`. It has to be: the counter-scale divides by it, and `calc()` cannot
divide by a `px` value. A single token that is sometimes a length and sometimes a
number would be two tokens that can disagree.

## The counter-scale, and how much of it to apply

Perspective magnifies a near layer by `P/(P - z)`; `.depth-layer` scales by
`(P - z)/P`. `--depth-flatten` decides how much of that cancelling lands: `1` is the
full cancel, so apparent size stops depending on depth at all; `0` lets the growth
through, so a layer visibly comes toward the reader.

**This is the only lever that separates growth from drift**, because magnification
and displacement are the same `z/(P - z)` factor — changing the perspective moves
both together, which is why "reduce the perspective so it comes at me instead of
running away" cannot work. A page wanting growth without drift runs a low flatten
AND a low step, then takes its motion from the pointer instead.

Full flatten is still the right default: it is what lets a heading be the closest
thing to the reader without rendering larger than its type scale says, and what
stops a card growing past the measure just by coming forward.

## Motion multiplies the reactive half

`--depth-motion` scales the lean, the tilt and the shadow throw together, which is
what makes the Motion slider one knob rather than three. The scroll half of that
slider is not in this file — it is a JS number folded into `--depth-focus`, because
CSS never sees the scroll offset.

## Tilt and shadow both key off one normalised pair

JS writes `--depth-lean-nx/ny` as `-1..1`. The origin slide multiplies by
`--depth-lean` (px), the rotation by `--depth-tilt` (deg), the shadow by
`--depth-shadow` (px), and all three by `--depth-motion`. One input, four scales,
none of them known to JS.

The shadow throws AGAINST the lean, because the light stays put while the camera
moves. `box-shadow` is safe here — it is not on the list of properties that flatten
`preserve-3d`.

## `--depth` is relative, and re-declared

`transform-style: preserve-3d` composes a layer's `translateZ` with its parent's, so
a `.depth(1)` heading inside a `.depth(1)` section is two steps out. This is a
feature — a section can be moved and its contents keep their relationship — but it
is the thing that surprises everyone once.

`.depth-layer` **re-declares `--depth: 1`** for the same reason it re-declares
`--depth-shadow`: custom properties inherit, so a card declaring `--depth: 2` would
otherwise hand 2 to every layer inside it that had no rule of its own. The reset is
what makes a page's tier table — one selector per tier, in the page's own
stylesheet — behave the way it reads.

## Reduced motion removes it

`perspective: none`, `transform: none`, no shadow, and the sliders are hidden. Not a gentler
parallax: someone who asks for still pages is not asking for a smaller version of
the thing they turned off.

## Traps

- **`preserve-3d` silently degrades to `flat`** on any element with `overflow` other
  than `visible`, `opacity < 1`, a `filter`, `clip-path`, `mask`, or
  `contain: paint`. A layer that grows one of those flattens its children and the
  nesting stops composing, with nothing in the console.
- **`--depth-shadow` is RE-DECLARED on `.depth-layer`, and must stay that way.**
  Custom properties inherit, so a card setting it handed its shadow to every layer
  inside it — and a heading is a layer. Headings then cast card shadows onto the card
  behind them, which reads as a pale box behind the text that looks like a background
  nobody wrote.
- **Tilt compounds through `preserve-3d`.** Three nested tiers at `2.5deg` turn the
  innermost card `7.5deg`, which trapezoids it. Budget *deepest × tilt × motion*
  under about `3deg`.
- **The `@layer base, theme, site, util;` line has been stripped by a formatter
  once.** Nothing broke loudly; put it back if it goes again.
- **ASCII only, comments included** — same reason as `toc.css`.

## Improvements

1. **`.depth-ctrl` styles a range input with one declaration and inherits the rest.**
   It reads fine in both schemes today because it is the UA control, but the site
   has no styled range anywhere yet — the first one should probably be a shared
   component rather than this. *(medium, later)*
2. **No `@container` awareness.** The scene assumes it is the page. A scene inside a
   panel would want its focus measured against that panel's scroller instead, which
   `depth.js` already almost supports — it looks for `.pages` by name. *(medium, later)*
