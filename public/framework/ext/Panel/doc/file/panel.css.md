## panel.css

Structure only — where a panel sits and how it sizes. What a panel *looks* like
is `surface`/`wash` off `framework.css`; the floating bar is `toolbar.css`, the
divider is `grip.css`, and what a *template* looks like is its own payload, in
`templates.css`. Nothing in this file is about chrome.

## The flex chain, and why it's `1 1 0` everywhere

`.panel-workspace`, `.panel`, `.panel-items` and `.panel-body` are all
`flex: 1 1 0; min-width: 0; min-height: 0`. `1 1 0` rather than the `flex-1`
utility, because that utility carries no `min-height` — and every level of
this nesting holds something that scrolls, so a missing `min-height: 0`
would let content force the box open instead.

`.panel-workspace { height: var(--panel-height, 34em) }` is the one place a
height is asserted: chrome is sized by its region, never by its content, and a
call site retunes the token (`.style("--panel-height", "14em")`). The same rule
declares the module's second token, `--panel-hug: 16em` — the extent a *hugging*
panel takes on the axis its content cannot measure, retunable the same way.

## `--panel-grow` is the grip's write target

`.panel { flex-grow: var(--panel-grow, 1) }` — the only property `grip.js`
touches during a drag, and the only one it commits on `pointerup`. Nothing here
reads pixels. `position: relative` on the same rule is what the bar and the
placeholder are absolute against.

## The picker writes two tokens; the body reads them `safe`

```css panel.css
align-content: safe var(--panel-y, center);
justify-items: safe var(--panel-x, center);
```

The nine alignment codes are these two custom properties and nothing else —
`toolbar.js`'s `place($body, code)` writes `start`/`center`/`end` into them, and
the body is a one-column grid of `min-content` rows, so `align-content` moves the
rows and `justify-items` moves each row's box.

⚠ **Centred overflow spills out of BOTH ends, and the near end cannot be scrolled
to.** Measured with an inspector 467px tall in a 217px body: under plain `center`
its first row sat **124.8px above** the panel and the body reported
`scrollHeight: 342` — the part above the start edge is not in the scrollable
region *at all*, so no amount of scrolling ever reaches it. `safe` falls back to
`start` on exactly the axis that stopped fitting: same body, first row **0px**
below the top edge, `scrollHeight: 467`, every row reachable.

Content that **fits** does not move a pixel — a `panel(fn)` drawing lands at
top+59 left+152 under either spelling — and all nine codes still land: `tl/cc/br`
at top+0/59/118, left+0/152/305.

One rule, both axes, every template. `templates.css` used to carry a local
`align-content: start` for `.panel-props` behind a `:has(> .panel-props)` guard;
it is gone, because two mechanisms for one problem is how they drift. The visible
difference is an inspector that *fits*: it now centres like every other payload
instead of hanging from the top, which is what the empty "Click any panel" state
wanted anyway.

## One class is the whole contract for a control surface

```css panel.css
.panel-body:has(> .panel-controls) { padding-block-start: var(--panel-bar-h); }
```

The bar is an overlay that lights **on hover** — which for a payload whose top
edge holds controls is exactly when its first row is in use, and the pointer
arrives before the click. A payload says `.panel-controls` and the body reserves
the bar's published height (`--panel-bar-h`, declared in `toolbar.css`, which the
bar itself is sized by — so the reserve cannot drift from the thing it clears).

Measured on the inspector at 1600, bar lit: bar bottom **245.89**, payload top
**245.89**, first row top **253.33** — overlap **0**, where the private `2.4em`
reserve it replaced lived in `templates.css` and covered one payload only. Any
other control surface adopts it by adding the class to the element it draws, with
no second rule and no flag: `ext/editor` did, and three of its five regions —
`palette`, `layers`, `properties` — now wear it. The `canvas` abstains because it
is the document rather than a control surface, and the `status` strip because a
badge is read with the pointer somewhere else.

⚠ **`.panel-controls` is not emitted here.** `properties.js` puts it on the
inspector's root; `workspace.js` reaches that file through `templates.js`. It is
the fifth foreign class name in this sheet and the second used as a condition.

## The hug/fill trap, measured

```css panel.css
.panel.hug { flex: 0 0 auto; }
.panel.hug > .panel-body { flex-basis: auto; min-inline-size: min(var(--panel-hug), 100cqi); }
```

⚠ **The basis, and only the basis.** A `flex: 1 1 0` body inside a panel that is
itself `0 0 auto` resolves to **zero height**, because a `flex-basis: 0` box has
no content size of its own to report upward — so the body's basis becomes `auto`
while grow and shrink stay what the `1 1 0` rule above gave every level. That is
what lets a panel hugging the *width* of a row still fill the row's height, and
scroll instead of clipping when a band overruns it (measured: a `features` band
hugged in a row is 775px of content in a 420px body, and the body scrolls).

## The declared extent is capped by the slot it is handed

```css panel.css
.panel-workspace, .panel-items { container-type: size; }
```

16em is a promise a 200px workspace cannot keep. Measured before this rule: a
hugged leaf in a 200px workspace was a **248.3px body 48.3px past the edge**, the
same 48.3px overhang on the block axis in a 200px-*tall* one, and a hug in a 200px
slot of a 1200px workspace put a 248.3px body inside its own 200px panel. Both
extents now read `min(var(--panel-hug), 100cq…)` — the declared extent, or what
there is, whichever is smaller.

⚠ **The cap's reference cannot be the panel.** `.panel` hugging is `flex: 0 0 auto`
and takes its size from this very body, so `100%` or a container on `.panel` is the
self-measuring loop `--panel-hug` exists to escape: the percentage resolves to zero
while the panel is being sized, and the hug collapses again. `.panel-workspace` and
`.panel-items` are the two boxes sized *from above* — a declared height, then
`flex: 1 1 0` all the way down — so containment has no content size to lose. Query
units resolve against the **nearest** ancestor container, which is why one rule
covers both readings: a hug inside a split caps against its own row or column, a
root leaf against the workspace.

Measured at 1600×950, before → after:

| case | before | after |
|---|---|---|
| hug in a 1200px row | 248.3 × 600 | **248.3 × 600** |
| hug in a 1200px column | 1200 × 248.3 | **1200 × 248.3** |
| root leaf hug, 1200px | 248.3 × 600 | **248.3 × 600** |
| `hero` (real content) hugged in a column | 1200 × 288.7 | **1200 × 288.7** |
| hug in a 200px workspace | 248.3 wide, 48.3 past | 200 wide, **0 past** |
| hug in a 200px-tall workspace | 248.3 tall, 48.3 past | 200 tall, **0 past** |
| hug in a 200px slot of a 1200px workspace | 248.3 in a 200px panel | **200** |

Roomy is pixel-identical from both doors: the bar's `aspect_ratio` toggle and
`seam.js`'s menu both land 248.3 × 600 at 1600, and both land 200 × 600 in a 200px
workspace. Every panel box on `/framework/ext/Panel/`, its `/full/` route,
`/framework/ext/editor/` and `/framework/` is unmoved at 1600 **and** 400 (58, 71,
20 and 3 boxes measured, zero changed) — the cap is inert until something is too
narrow to honour it.

## The 3440 story lives in three rules — and hug is one of them

```css panel.css
.panel:not(.hug) > .panel-body { container-type: size; }
.panel.hug > .panel-body:has(> .panel-t) { container-type: size; block-size: min(var(--panel-hug), 100cqb); }
.panel.hug > .panel-body:not(:has(> .panel-t)) { container-type: inline-size; }
```

`container-type: size` needs a box whose size the content does not decide —
exactly what a *filling* panel is. This is the seam `templates.css`'s `cq` units
size against.

⚠ **Containment reports an EMPTY box, and that is what used to collapse hug.**
`container-type` on an axis means the box is measured as if it had no contents,
so in any shrink-to-fit context — which is what `mode: "hug"` asks for — the
body measured **0px wide** and the panel with it (517.8 → 0, measured; and 0 for
*every* template, not only the scenes). A hug in a *column* failed the other
way: `cqh` is undefined in an inline-size container, so `.panel-t`'s
`min-block-size: 100cqh` fell back to the small viewport and drew a 900px-tall
panel.

The fix is to give hug an honest extent instead of a measurement it cannot take.
A `cq` **scene** has no content size to hug at all, so it takes `--panel-hug` on
both axes and gets the same size containment a filling panel gives it — meaning
a hugged scene renders exactly as a 16em panel of that scene would. A hugging
body holding **real content** — a section band, a `panel(fn)` drawing — still
measures its own block axis (a `hero` hugged in a column is its own 288.7px, as
before), so only its inline axis can be contained, and `--panel-hug` floors that.

Measured, every template, at 1600×950: hug in a row = 248.3px wide (16em) with
the row's full height; hug in a column = 248.3px tall for a scene, content height
for a band; fill unchanged to the pixel. Both extents carry the slot cap above —
`min(…, 100cqi)` and `min(…, 100cqb)` — which changes none of those numbers and
only bites where 16em was never available.

## Three rules reach outside the module

`.panel-body > .section-band` (styles/sections' own class, arriving through
`templates.js`'s lazy import) is forced to full width, because a band carries
its own inner measure and the alignment picker should position *that* rather
than shrink-wrap it. `.panel-items > .drag-placeholder` (`ext/Draggable`'s
class) gets `flex: 0 0 4em`, sized on whichever axis it lands in; its outline is
`draggable.css`'s and its px height is cleared in `PanelDrag.start()`.

The third is the two hug rules above, which **match** `.panel-t`
(`templates.js`'s class) to tell a `cq` scene from real content. They style
nothing of it — the test is structural — and the loading edge is honest, because
`workspace.js` imports `templates.js` on the line under the one that loads this
sheet.

Two more are conditions rather than targets, both the inspector's:
`.panel-controls` (the reserve, above) and `.panel-props` (the focus ring,
below).

## The focus ring is guarded by the thing that reads focus

```css panel.css
.panel-workspace:has(.panel-props) .panel.focus::after { … inset 0 0 0 2px var(--prim) … }
```

The second foreign class used as a *condition* rather than a target:
`.panel-props` is the inspector's own (`templates.css`, emitted by
`properties.js`). The mark is drawn only in a workspace that actually holds an
inspector, so a demo that is one `panel("clock")` gains no new decoration and
`ext/editor`'s regions stay exactly as they were — and switching the last
inspector away takes the ring with it, with no JS to notice. A pseudo-element, so
the panel keeps its box and nothing reflows; `z-index: 2`, under the bar's 3.
Record: [Focus, and the panel that reads it](/framework/ext/Panel/docs/focus/).

## Improvements

1. **The three foreign class names above are the module's only silent couplings.**
   Renaming `.section-band`, `.drag-placeholder` or `.panel-t` elsewhere leaves a
   panel laying out wrong with nothing to grep from that end. A line in each of
   those modules' readmes naming this consumer is the cheap half of the fix.
   `.panel-t`'s owner is in this directory, which makes it the cheapest of the
   three. *(medium, important)*
2. **`--panel-height`'s `34em` default is overridden inline by nearly every call
   site** (`14em`, `22em`, `30em`, `100%`), which is a default earning its keep in
   no demo on the page. *(simple, speculative)*
3. **`--panel-hug`'s `16em` is one number for both axes and every template**, and
   a slot narrower than 16em could not honour it — measured at 200px, a 248.3px
   body inside a 200px panel, clipped. Capped now (above): both uses read
   `min(--panel-hug, 100cq…)` against the nearest slot box, and roomy widths are
   unmoved to the pixel. *(simple — done)*
4. **The cap is per panel, so N hugs in one cramped row still overflow it.**
   Each caps at the whole slot rather than at its share of it: measured, two hugs
   in a 200px row are 200px each and the row scrolls to 400 (it was 496.6 before
   the cap, so the same arrangement is better and not fixed). Sharing needs both a
   shrink factor on `.panel.hug` and a cap of *slot ÷ hugs*, which CSS cannot
   count — a second sizing currency beside `grow`, for an arrangement nobody has
   asked for yet. *(medium, speculative)*
