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
declares the module's second token, `--panel-section: 16em` — the floor under a
section of a `mode: document` workspace, retunable the same way. It is not a
width, and nothing else reads it.

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

## Sizing with no containers (2026-08-19)

```css panel.css
.panel { flex-grow: var(--panel-grow, 1); max-inline-size: 100%; overflow: hidden; position: relative; }
.panel-workspace, .panel-items { position: relative; }
.panel-body:has(> .panel-t) { grid-template-rows: 100%; }
```

Every `container-type` in this file is gone, and with it `--panel-hug` as a
width. `hug` is `flex: 0 0 auto` with an auto basis and the box **measures what
it holds** — the whole reason the token existed was that a size container may not
be sized by its contents, so a hugging body measured 0 and needed a declared
16em. [sizing](/framework/ext/Panel/doc/sizing/) is the current account;
[decisions](/framework/ext/Panel/doc/decisions/) has the 61-lines-to-0 table and
what it cost.

Three lines carry what the containment was quietly doing:

- **`max-inline-size: 100%` is the cap.** 16em was a promise a 200px slot could
  not keep; the percentage resolves against the slot (`.panel-items` /
  `.panel-workspace`), never against this box, so it is not the self-measuring
  loop `cq` units were dodging.
- **`position: relative` on the two slots.** `container-type: size` was the
  containing block a *floating* panel (`position: absolute`, `size.css`) landed
  in — by accident. Without it an abspos panel escapes to the page.
  `insert.css` states the same thing for `.panel-items` and is on the delete
  list, so this file states it itself.
- **`grid-template-rows: 100%`** gives a template a row to fill, since the body
  is a grid of `min-content` rows and a percentage height would otherwise have
  nothing to resolve against. In a hugging panel that row is indefinite, so it
  falls back to the content — which is what hug means. A drawing with nothing to
  measure declares its own floor as `.panel-t-scene` (`templates.css`).

## `mode: document` — the last four rules, and the one that makes the floor a floor

```css panel.css
.panel-mode-document > .panel-items.v > .panel { flex: 1 0 auto; min-block-size: var(--panel-section); }
.panel-mode-document .panel-items.v > .panel,
.panel-mode-document .panel > :is(.panel-body, .panel-items) { flex-basis: auto; }
```

`--panel-section` is `--panel-hug` renamed and reduced to one job: the floor
under a section. ⚠ A **floor**, not a height — and it only became one with the
second rule. A `flex: 1 1 0` child contributes a zero basis to a box that is
measuring itself, so with containment already gone every section still sat at
241px and its content scrolled inside it. Nothing in a document divides the
block axis; the inline axis is untouched, so a row of columns still divides its
width by `grow`. Measured with fixed seeds: three rolled sections went from
241/241/241 with **55 boxes scrolling their own content** to 13012/1832/5062
with **0**.

## Three rules reach outside the module

`.panel-body > .section-band` (styles/sections' own class, arriving through
`templates.js`'s lazy import) is forced to full width, because a band carries
its own inner measure and the alignment picker should position *that* rather
than shrink-wrap it. `.panel-items > .drag-placeholder` (`ext/Draggable`'s
class) gets `flex: 0 0 4em`, sized on whichever axis it lands in; its outline is
`draggable.css`'s and its px height is cleared in `PanelDrag.start()`.

The third is `.panel-body:has(> .panel-t)` above, which **matches**
`templates.js`'s class to give a template a row to fill. It styles nothing of it
— the test is structural — and the loading edge is honest, because
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
Record: [Focus, and the panel that reads it](/framework/ext/Panel/doc/focus/).

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
3. **The declared extent is gone** — a hugging panel measures its content and
   `max-inline-size: 100%` caps it at its slot. *(done, 2026-08-19)*
4. **The cap is per panel, so N hugs in one cramped row still overflow it.**
   Each caps at the whole slot rather than at its share of it. Sharing needs both
   a shrink factor and a cap of *slot ÷ hugs*, which CSS cannot count — a second
   sizing currency beside `grow`, for an arrangement nobody has asked for yet.
   *(medium, speculative)*
