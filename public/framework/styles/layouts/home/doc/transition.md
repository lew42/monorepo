# Desktop → mobile, measured

The owner's sentence, which this page exists to test:

> getting them to flow properly might be tricky (although, we have `.flex.auto`, etc, which
> makes it pretty easy).

**Mostly right, and the exception is a shape, not a band.** Ten bands, zero media queries,
no horizontal overflow at 400 / 1280 / 1920 / 3440, zero console errors. Every one of the
24 flex and grid seams on the page is **one line at 1280 and above and two or more at 400**,
except the four card-internal rows that wrap inside a narrow card, which is what they are for.

| width | scrollWidth / clientWidth | page height | worst inner scroller | `.measure` | body font |
|---|---|---|---|---|---|
| 400 | 400 / 400 ✓ | 9713 | none ✓ | 284 | 14px |
| 1280 | 1280 / 1280 ✓ | 5043 | none ✓ | 1100 | 15.04px |
| 1440 | 1440 / 1440 ✓ | 5094 | none ✓ | 1257 | 15.2px |
| 1920 | 1920 / 1920 ✓ | 5544 | none ✓ | 1536 | 16px |
| 3440 | 3440 / 3440 ✓ | 6235 | none ✓ | 1728 | 18px |

*Both axes, because one of them shipped broken — see §4. "Worst inner scroller" is the
largest `scrollHeight / clientHeight` over every `overflow-y: auto` box inside the layout.*

*(`/full/` insets the layout by its own `--page-pad`, so 400 really lays out at 316 — the
measurement is conservative against the Figma's 375.)*

**Three words do the whole transition.** `flex auto gap` with a `--column` basis is every
two-track band (hero, philosophy, highlight, contact, footer, services header): a row until
its two tracks no longer fit, then a stack. `grid auto gap` is every wall (services,
portfolio, testimonials), and `auto-fit` caps the column count at the number of cards, so
three cards can never become four on a 3440 screen. `flex gap wrap` is everything small.
**Source order is the only other lever**: the philosophy picture is first in source, so it
is the left column at 1920 and the top block at 375 with no `reverse` — the mirror of what
[`hero/`](/framework/styles/layouts/hero/) does for the opposite comp.

## 1. The nav is a real vocabulary gap

`flex: 1 1 22em` on the nav box is **the one inline `flex` on the page**, and no word can
replace it:

| | |
|---|---|
| `--grow` | only reaches children of `.flex.auto`; this row is `flex gap wrap v-center split`, and making it `.auto` would turn the brand and the button into fluid tracks too, which kills `split` |
| `.basis` | `flex: 0 0 var(--basis)` — cannot shrink, so at 400 a 22em rail overflows a 316px row |
| `.flex-1` | `flex: 1; min-width: 0` — a **zero** basis, so it shrinks for ever and never wraps |

This is the same hole the pilot found from the other side ([`wire/doc/bento.md`](/framework/styles/layouts/wire/doc/bento.md)): `--grow` closed *weight* on `.flex.auto`, and nothing closed
*a single fluid child with a real basis on a plain wrapping row*. One candidate, no new
class: let `.basis` read a grow too — `flex: var(--grow, 0) 1 var(--basis, var(--column))`.
That is one token on a class that already exists, and it is byte-identical for every current
caller. **Not shipped — `framework.css` is fenced for this task.**

## 2. `--grow` — the finding, the fix, and the gotcha it introduced

**Originally measured here as a defect.** `.flex.auto > *` was
`flex: var(--grow, 1) 1 var(--column)`, so both tracks started at the *same* basis and the
weight only split what was left over: `--grow: 2` measured **1.39 / 1.52 / 1.52** at 1280 /
1920 / 3440 — flat, which is the property that matters, but not 2.

**Fixed upstream the same night** (framework.css, 2026-08-18) to
`flex: var(--grow, 1) 1 calc(var(--column) * var(--grow, 1))`. Re-measured on this page after
the change, with the weights retuned to the Figma's own seams:

| width | services header · `--grow: 1.4` (Figma 700/500 = 1.40) | footer · `--grow: 0.8` (Figma 400/512 = 0.78) |
|---|---|---|
| 400 | 284 / 284 = 1.00 *(stacked)* | 263 / 284 = 0.93 *(stacked)* |
| 1280 | 624 / 446 = **1.40** | 469 / 586 = **0.80** |
| 1440 | 715 / 511 = **1.40** | 538 / 673 = **0.80** |
| 1920 | 877 / 627 = **1.40** | 661 / 827 = **0.80** |
| 3440 | 987 / 705 = **1.40** | 744 / 930 = **0.80** |

Exact, and flat across the whole range. A weight is now simply the width ratio.

⚠ **The gotcha, which cost a build here: a weight now moves the WRAP THRESHOLD too.** The
basis scales with the weight, so a row breaks when `--column × --grow` *summed over its
tracks* no longer fits. The first retune used `4` and `5` on the footer — the intended 0.80 —
and it stacked at **every** width, because 16em × 4 + 16em × 5 = 144em of basis. **Express a
weight as a number near 1** (`0.8`, `1.4`), not as the smallest integer pair. Under the old
shared-basis formula the same `4`/`5` was harmless, so this is a real behaviour change for
anyone porting weights across the fix.

## 3. `.wash` on a dark band paints nothing

`--wash` is `light-dark(rgba(0,0,0,0.08), …)` — keyed to the **colour-scheme**, not to the
band it sits on. On the dark highlight card in light mode that is black on black: the picture
placeholder was invisible, and nothing threw. `.muted` already solved this for text —
*"de-emphasis derived from the band's own ink, never from a fixed grey"* — and there is no
background twin of it. What shipped here is that one line, at the call site:

```js
background: color-mix(in srgb, currentColor 10%, transparent)
```

It inverts correctly on every tone in both modes, because `sections/tone.js` already hands a
coloured band its own `currentColor`. **A `.veil` class, or `.wash` redefined in terms of
`currentColor`, would retire it** — but `.wash` has hundreds of callers on light surfaces and
changing it is not a minion's call. Same family as the pilot's `.tint` finding: a surface word
that is a fixed value rather than a relative one is a trap that never throws.

## 4. `page full fill` is the wrong shape for a content-heavy page — the tier finding

**Shipped broken, and the acceptance test could not see it.** At 1440 this page rendered as
nav → hero, truncated mid-paragraph → footer: **4549px of content inside a 284px `.flex-1`
(16.0x)**, seven of ten bands in the DOM and unreachable, while the document itself did not
scroll at all (`scrollHeight === clientHeight === 1000`).

**The class string was not the culprit.** `landing`, `document` and `hero` use the identical
`page full fill flex v` and have no internal scroller at the same viewport. The difference is
content volume. In a `full` (100vh) `fill` shell the middle region gets whatever the header
and footer leave — this footer carries three link columns, so 1000 − 110 − 600 ≈ 284 — and the
remaining 4265px scrolls inside a box instead of growing the page. The three peers get away
with it only because their demo bands happen to fit a viewport.

### The verdict, and it is about the tier

**`fill` means *this layout is a screen*.** It claims the region's height and hands the scroll
to one designated pane. That is exactly right for an application shell — `shell`, `mail`,
`chat`, `dashboard`, `split` — where the chrome is fixed, the footer is a status bar, and the
reader expects one pane to move.

**A marketing homepage is a *document*.** It is taller than the viewport by design, its footer
is the end of the content rather than a pinned bar, and the reader expects the whole page to
scroll past. So this page is **`page full flex v`** — no `fill`, no `flex-1`, no
`overflow-y: auto` anywhere — and the bands simply stack until the page is as tall as it is.

**This affects every content-heavy design still queued.** The rule that falls out:

> `fill` is a claim that the layout fits one screen. If the bands can exceed a viewport —
> and any real marketing page, article or long form does — the layout wants document scroll,
> and `fill` will silently turn its middle into a porthole with nothing thrown and no
> horizontal symptom.

`landing`, `document`, `docs` and `stack` are all reading layouts wearing `fill` today. None is
broken, because none holds enough content to collapse; **each is one longer demo away from
this defect**, and that is worth one line each in `layouts/doc/decisions.md` rather than a
change nobody asked for.

### What it costs, stated plainly

The card. `demo.layout()`'s `preview()` renders `frame("56em")` at `zoom-25`, and the tier's
reason for `fill` was exactly that — *"a `fill` shape pins its footer and the wall crops
nothing"* ([`../../doc/decisions.md`](/framework/styles/layouts/doc/decisions.md)). Without it
the card shows the **masthead** — nav, hero, CTAs — and crops the rest.

That is the honest picture of a long document, and re-locking it would reintroduce the same
porthole in miniature: at 56em the middle region would be ~440px holding 4500px, so the card
would show a nav, a sliver, and a footer. **A card is a picture; a picture of a long page is
its top.** The one-line alternative, if the owner would rather have the pinned-footer card
back, is to make `fill` conditional on being handed a height — `frame()` is already the seam:

```js
frame(height){ return this.layout().ac("default").ac(height && "fill").style({ height: height ?? "" }); }
```

Not taken, because it buys a worse thumbnail with the defect this section exists to remove.

### How to catch it next time

`scrollWidth === clientWidth` is **horizontal only**, and on a `fill` page the "page height"
you naturally reach for is the *inner scroller's* `scrollHeight` — both numbers read healthy
while the page was unusable. The check that catches it, run at every width:

```js
for (const el of root.querySelectorAll("*"))
	if (/auto|scroll/.test(getComputedStyle(el).overflowY))
		assert(el.scrollHeight <= el.clientHeight + 50);   // no unintended inner scroller
```

⚠ And test **1440**. It sits between the two widths everyone tests, and it is where this was
found. ⚠ `fullPage: true` screenshots are also blind here: `.page.layout-full` is
`position: fixed; inset: 0; overflow: auto`, so the document is always one viewport tall —
measure *that* box and grow the viewport to it.

## The three places the two drawings genuinely disagree

Each is a real breakpoint in the Figma and none is worth a media query here.

1. **The nav at 375.** The Figma drops the five links entirely (an implied burger). One
   wrapping row keeps them, so the mobile header is three lines instead of one. Keeping them
   is the better no-JS answer; a burger is a component, not a layout.
2. **The philosophy heading.** The Figma's mobile puts the badge and `h2` *above* the picture
   and the body below it — an interleave one row cannot express. Here the picture leads and
   all the copy follows. The alternative that needs no query is to lift the heading into a
   full-width block above the row, which then changes the *desktop* drawing; the deviation was
   cheaper than the change.
3. **The portfolio CTA.** The Figma's mobile moves *View All Projects* to the bottom of the
   band, full width. `flex gap wrap split` wraps it directly under the heading instead. Moving
   it would mean two DOM positions, which is two drawings — exactly what this page is avoiding.

**And one that is not a layout difference at all:** the logo row reads 2/1/1/1 at 400 where
the Figma draws 3/2. The Figma uses a *larger* mark at 1920 and a *smaller* one at 375 — two
text styles for one element — and standing rule 1 forbids inventing a third. `h3` is the
desktop reading and it wraps honestly on a phone.

## What the type scale costs

The page is **4964px tall at 1920 against the Figma's 7350**. Nothing is missing: the comp's
hero title is ~64px and `h1` is `1.9em` (30px), its band padding is 120px and this page's is
`clamp(2.5em, 5vw, 5em)`. That is standing rules 1 and 2 doing exactly what they say —
*pick the closest style that exists*, *converge on two or three spacing values* — and it is
the single biggest visual difference between this render and the comp. It is a **decision to
review, not a defect**: a `--h1-scale` token, or a `.display` level above `h1`, is the
conversation this page opens.
