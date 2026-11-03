# depth — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

A page becomes a 3D scene; anything wearing `.depth(n)` sits *n* steps toward the
reader. Scrolling and the pointer move the vanishing point, so layers drift against
each other. Ported and corrected from a 2025 sketch in `lew42com/public/test/3D-scroll/`.

`depth()` places the sliders where you call it and wires the enclosing `.page`. The
`.depth()` patch on `View` is what a page uses everywhere else.

**Prefer bare `.depth()` and declare the tier in CSS.** `.depth(n)` writes an inline
`--depth` that beats every class rule, so a page with a dozen layers can no longer
retune all its headings at once. `/resume/` declares all six of its tiers in
`resume.css`, which is what makes "make the header react half as much and the card
twice as much" two edited numbers instead of twelve.

⚠ **`--depth` inherits, so `.depth-layer` re-declares it.** Without the reset, a card
declaring `--depth: 2` hands 2 to every layer inside it that has no rule of its own —
silently, and compounding through `preserve-3d`.

## The two corrections that make it usable

The sketch this came from is unusable on anything longer than a screen, in two
independent ways. Both fixes are the design.

**The vanishing point rides the reading centre.** A layer's displacement is
`(distance from the perspective origin) x z/(P - z)`. Left at the box's own middle,
that distance is *half the document* — on a 4000px page, an element at
`translateZ(200px)` with `perspective: 1200px` lands 400px from where it belongs.
The sketch made this worse still, sweeping `perspective-origin` 0%→200% on scroll.
Here `focus()` pins the origin to `scrollTop + clientHeight/2`, so displacement is
~0 where the eye already is and opens up gently toward the edges. Scroll parallax
survives: a layer drifts through the reading line faster than the page does.

**Every layer counter-scales by `(P - z)/P`, as far as `--depth-flatten` says.**
Perspective magnifies a near layer by `P/(P - z)`; at the default `flatten: 1` this
cancels it exactly, so apparent size stops depending on depth — a heading can be the
closest thing to the reader and still render at the size its type scale says, and a
card cannot grow past the measure just by coming forward.

That default is the *safe* one, not the only one. Because growth and drift are the
same factor (below), a page that wants a layer to visibly come toward it lowers
`flatten` instead — `/resume/` runs `0.25`. What the token buys either way is that
the choice is explicit, rather than perspective quietly resizing the layout.

## Traps

- **⚠ `--depth-shadow` is RESET on `.depth-layer`, not merely defaulted.** Custom
  properties inherit, and a heading is a layer — so a card setting
  `--depth-shadow: 6px` handed its shadow to every heading inside it, and those
  headings cast card-shadows onto the card behind them. It renders as a pale box
  behind the text that looks like a background nobody wrote. Re-declaring the token
  in the `.depth-layer` rule makes each layer start at zero.
- **⚠ Tilt compounds.** `preserve-3d` applies a layer's rotation to everything
  inside it, so three nested tiers at `2.5deg` turn the innermost card `7.5deg` —
  far enough that its edges swing hundreds of px in `z` and it renders as a
  trapezoid sliding out from under its own text. Budget the *total*:
  *deepest tier × tilt* under about `3deg`.
- **`transform-style: preserve-3d` silently becomes `flat`** on any element with
  `overflow` other than `visible`, `opacity < 1`, a `filter`, `clip-path`, `mask`,
  or `contain: paint`. A layer that grows one of those flattens its own children
  and the nesting stops composing, with nothing in the console. This is also why
  the scene must not be a `.page.fill` — `fill` carries `overflow: hidden`.
- **`--depth` is relative to the enclosing layer**, not absolute: preserve-3d
  composes the two `translateZ` values. A `.depth(1)` heading inside a `.depth(1)`
  section is two steps out.
- **The counter-scale slightly shrinks a nested layer's own z**, because `scale()`
  applies to the child's whole local space. At these magnitudes the error is a few
  percent of a step and invisible; at ten times the step it would not be.
- **`perspective` makes the scene a containing block for `position: fixed`
  descendants** and a stacking context. Anything on the page that expected to
  escape to the viewport stops escaping.
- **The scroll handler reads no geometry.** The scene's offset inside the scrolled
  content is measured once, on resize — a `getBoundingClientRect()` per scroll
  event is a layout flush per scroll event.
- **A hidden page measures every rect at 0,0**, so `measure()` bails on
  `!offsetParent` and runs again on the next frame. Same trap `ext/toc` documents.

## Decisions

**Slide the vanishing point for the camera; rotate the LAYERS, never the scene**
(RULE, 2026-08-17). A `rotateX/rotateY` about the centre of a 4000px-tall box throws
its far ends hundreds of pixels in z — the same failure the reading-centre fix exists
to prevent, so the scene itself only ever translates its vanishing point. A single
card is small enough that the same rotation costs nothing, so `--depth-tilt` turns
each layer about its own centre. That was phase 2 on 2026-08-17 and shipped the same
day; the constraint it was deferred behind is the reason it lives where it does.

**Two sliders, because there are two genuinely different knobs.** `Depth`
(`--depth-scale`) multiplies every layer's `z` — how far apart the layers sit, which
buys growth and scroll parallax together because they are the same number. `Motion`
(`--depth-motion`) multiplies how hard the page *reacts*: pointer lean, tilt, shadow
throw, and how fast the vanishing point travels while you scroll. Each is one custom
property, so nothing recomputes and no layer knows either exists.

⚠ **Motion's scroll gain is clamped at 1 from below.** Gain 1 is exact tracking, so
displacement at the reading line is ~0. Any gain under 1 makes the origin LAG the
reading line, which produces MORE drift — the one setting where the slider would
fight its own label. Below 1 it therefore calms the pointer only.

**Reduced motion removes the effect, it does not soften it.** `perspective: none`,
`transform: none`, no shadow, and the sliders are hidden. Someone who asks for still pages is not
asking for gentler parallax.

## Tuning

Every number is a token on `.depth-scene`, so a page overrides what it wants:

| token | default | what it does |
|---|---|---|
| `--depth` | `1` | THE TIER, per layer. Relative to the parent layer; **reset, not inherited** |
| `--depth-perspective` | `1400` | unitless, because the counter-scale divides by it |
| `--depth-step` | `28` | px of z per depth unit |
| `--depth-scale` | `1` | the Depth slider (0.75–5); multiplies every layer's z |
| `--depth-motion` | `1` | the Motion slider (0–2); multiplies lean, tilt, shadow and scroll gain |
| `--depth-flatten` | `1` | how much of the growth to cancel: 1 none, 0 all of it |
| `--depth-lean` | `120` | px the vanishing point slides, window corner to corner |
| `--depth-tilt` | `1deg` | how far each layer tilts at full lean, about the axis perpendicular to it |
| `--depth-shadow` | `0px` | shadow throw; **reset per layer, not inherited** |

`--depth-focus`, `--depth-lean-nx` and `--depth-lean-ny` are written by JS; don't
set them by hand. The lean pair is written **normalised to -1..1**, not in px, so
that one JS value drives the origin slide, the tilt, the shadow throw and the motion
multiplier at four different scales without JS knowing any of them.

## GROWTH AND DRIFT ARE THE SAME NUMBER

The single most useful thing to know about this ext. Magnification is `P/(P - z)`;
displacement is `(distance from the origin) x z/(P - z)`. Same factor. **You cannot
tune one without the other by changing `P`** — lowering the perspective raises both,
which is the opposite of what "reduce the perspective so it comes at me instead of
running away" intends.

`--depth-flatten` is the only lever that separates them, and it only cuts the size
half. So the recipe for *comes toward you, does not run off the page* is: **low
flatten, low `--depth-step`, and buy the motion back from the pointer.** Lean and
tilt cost no displacement at all. `/resume/` runs `flatten: 0.25`, `step: 30`,
`lean: 220`, `perspective: 1100`.

**Depth tops out at 3, and the ceiling is legibility, not maths.** The hard
limit is `z >= P` (behind the camera, where the counter-scale inverts), but the
practical one arrives far earlier: `d` in the displacement term is the distance from
the reading line, so at high scale a heading near the top of a scrolled page is
thrown clean off it. It was 5 and the name flew off the top; three composed tiers at
step 30 keeps the worst drift near 170px at maximum.

**Lean separates siblings; step separates tiers.** The horizontal offset between a
heading and the copy under it is `lean x z/(P - z)` differenced across the two — on
`/resume/` at lean 120 that measured **2.4px**, invisible. At 180 it measured
**11.5px**.

## Where it is used

`/resume/` is the showcase — see `public/resume/page.js` for the depth assignment
and why each layer sits where it does.
