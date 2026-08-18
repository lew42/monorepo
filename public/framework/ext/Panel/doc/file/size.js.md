## size.js

Per-axis sizing: `w` and `h`, each independently `fill | hug | fixed`,
replacing the one-word `mode` for both axes at once — and the two rules that
fall straight out of it. **Self-alignment**: `self`, where the panel sits in
the slot its split hands it, exists only on an axis that does *not* fill.
**Position**: `position`, whether the panel is in that slot at all or floating
over it. `sizing(item, $panel)` is the sole writer of the classes and custom
properties `size.css` reads — called on every draw and every `repaint()` from
`workspace.js`, and again by hand from `toolbar.js`'s size pickers right after
each pick (nothing redraws it on a plain `change` the way a mirror gets
repainted). Imports `View`, `display.js`'s truth table and `glyphs.js`'s
`PLACE`, and nothing else.

## The key finding: `mode: "hug"` was never "hug both axes"

`flex-grow`/`flex-shrink`/`flex-basis` only ever touch the flex **MAIN**
axis — the one the panel's own parent split runs along (row or root is
inline; col is block) — and `panel.css` never set `align-self`, so the
**cross** axis always filled regardless of what `mode` said. A saved `hug`
panel was already only hugging the axis its split ran along; nothing about
that changed today.

```js size.js
export function extents(item){
	const main = item.parent?.get("dir") === "col" ? "h" : "w";
	const legacy = item.get("mode") === "hug" ? main : null;

	return {
		main,
		w: item.data.w ?? (legacy === "w" ? "hug" : "fill"),
		h: item.data.h ?? (legacy === "h" ? "hug" : "fill"),
	};
}
```

`extents()`'s fallback — no `w`/`h` in the data — reproduces exactly that
per-axis behavior: hug on whichever axis is main, fill the cross one, until
an explicit `w`/`h` says otherwise, per key. **No saved document changed
meaning.** It is a named export rather than a local because `self_axes()`
has to answer *"does this axis fill?"* with the same words `sizing()` uses;
two copies of that `??` chain would drift and the control would then grey out
buttons that work.

⚠ `item.data.w`, never `item.get("w")`. `Panel.defaults` answers `"fill"`,
which would swallow the legacy fallback whole before it could be read.

## The legacy `.hug` class still ships alongside the per-axis ones

```js size.js
.ac((main === "w" ? w : h) === "hug" && "hug");
```

`panel.css`'s scene container-type switch still reads plain `.hug`, keyed to
whichever axis is main for this panel — the same test `mode` used to decide,
now derived instead of stored. A scene sizes exactly as it always did,
whichever way that resolves.

## `w_at`/`h_at` carry a fixed length as a custom property, not a class

```js size.js
if (w === "fixed" && item.get("w_at")) $panel.style("--panel-w-at", item.get("w_at"));
```

A class can only be one of a fixed set of names; a length is arbitrary, so
it rides a CSS custom property instead. `size.css` caps it with the
`min(x, 100%)` idiom, so a fixed length wider than its slot never overflows.

## `self` — the panel in its slot, and the rule that gates it

`align` moves a leaf's *content* inside its body. `self` moves the *panel*
inside the slot its split hands it. Nine codes, the same `tl`…`br` vocabulary
`align` already uses, read through `glyphs.js`'s `PLACE` — `self[0]` is the
block half, `self[1]` the inline one.

The name is the CSS word for the thing: `align-self` and `justify-self` are
literally *"place me in my parent"*. It sits beside `align` as one short word
against another, `align` = my content, `self` = me, and it collides with
nothing.

```js size.js
const self = item.get("self") ?? "tl";
$panel.style({ "--panel-self-x": PLACE[self[1]] ?? "start", "--panel-self-y": PLACE[self[0]] ?? "start" });
```

**Two conditions, both necessary, before an axis can be self-aligned:**

1. **The axis must not fill.** A panel already occupying its whole slot has
   nothing left to align.
2. **The slot's display mode must let a child place itself on that axis** —
   `display.js`'s `live_axes(mode, dir)`. Flex has `align-self` but **no
   `justify-self` at all**, so the main axis always belongs to the parent, and
   a column swaps which axis that is. Grid gives the child both.

**Neither test appears in `sizing()`, and that is the design.** Condition 1 is
enforced by *which rule exists*: `size.css` reads `--panel-self-*` only from
rules already gated on `.panel-w-hug` / `.panel-w-fixed` / `.panel-h-hug` /
`.panel-h-fixed`, so a filling axis has no rule to read it. Condition 2 is
enforced by the engine: `justify-self` is inert in flex, so writing it
unconditionally can never make a main axis movable. The two custom properties
go on every panel, always, and the cascade sorts out which one means anything.

⚠ `Panel.defaults.self` is `"tl"` and must stay `"tl"`: `PLACE.t` and
`PLACE.l` are both `start`, which is exactly the `align-self: start` the
cross-axis rules hardcoded before `self` existed. Any other default silently
moves every saved hugging panel.

`self` is deliberately **not** in `Panel.shared` — a mirror shares what it
holds and how it looks, never its place in somebody else's row, which is the
same call `dir`, `grow` and `mode` already made.

## `self_axes(item)` — the control's half, and the only place `live_axes` is read

```js size.js
export function self_axes(item){
	const { w, h } = extents(item);
	const dir = item.parent?.get("dir") ?? "row";
	const mode = slot_mode(panels.get(item));

	const live = live_axes(mode, dir);
	return { x: verdict(live.x, w, "width", mode, dir), y: verdict(live.y, h, "height", mode, dir) };
}
```

Returns `{ x: { live, why }, y: { live, why } }`. `why` is the sentence the
control shows when an axis is dead — one clause per failing condition, joined,
so an axis that both fills *and* sits on a flex main axis says both. The CSS
needs none of it; only `properties.js` does.

**`slot_mode()` reads the container's real computed `display` rather than
assuming.** A split's `.panel-items` and the root `.panel-workspace` are flex
today, and every one of the nine codes would be a lie about the main axis if
that were hardcoded and something later changed it. Reading it means the
control follows with no second source of truth to disagree — verified by
forcing `display: grid` on a `.panel-items` and watching the horizontal
column go live.

⚠ A detached element computes to nothing, so an unmounted panel reads as the
flex it is about to be.

```js size.js
const panels = new WeakMap();
```

The panel's own element, kept weakly, because the control that asks lives in
the properties rail and holds no part of the panel it edits — `workspace.js`
has its own `views` map for the same reason and does not export it.

## `position` — in the slot, or over it

```js size.js
export const floating = item => item.get("position") === "absolute";
```

Two values ship, `static` and `absolute`, and `static` is honest about layout:
`.panel` is `position: relative` only so its own bar and overlays have a
positioning root, and `relative` with no insets sits exactly where `static`
would. `absolute` floats the panel over the slot its split hands it. The
inspector offers it to a **leaf** only — the same withholding `mode`/`w`/`h`
already make, on the grounds that a split gets its axis and nothing else.

**`fixed` and `sticky` are rejections, and both were measured rather than
argued.**

- **`fixed` escapes the workspace.** An abspos probe inside `.panel-items`
  and inside `.panel-workspace` both resolved to the workspace's own box
  (900×400); the *same* probe set to `fixed` resolved to the **viewport**
  (1600×1000) from both places. `container-type: size` is a containing block
  for absolutely positioned descendants and not for fixed ones. A fixed panel
  therefore lands over the site chrome, which is never what an embedded design
  tool wants.
- **`sticky` sticks to the host page, not to anything a panel can name.**
  Walking the overflow chain up from a `.panel`: `.panel` (`hidden`, but
  `scrollWidth === clientWidth`), `.panel-workspace` (`visible`), `.bleed`,
  `.default flow`, then `.pages` — the **site's** page scroller, 7129 against a
  900 viewport. Nothing between a panel and there ever scrolls. A sticky panel
  would slide against the browser viewport as the *host page* scrolled, clamped
  inside `.panel-items`: inert in a full-height workspace and, in an embedded
  one, a behaviour that is a property of the page it was embedded in. That is
  not a panel word. It would become one the day `.panel-items` scrolls.

## Why floating is safe here: the containing block is bounded on both paths

Neither path is assumed. A **nested** panel's containing block is its parent
split's `.panel-items`, which `insert.css` already makes `position: relative`
for the `+` bar. A **root leaf**'s is `.panel-workspace`, a size query
container and therefore a containing block for absolutely positioned
descendants. Measured, both are the workspace's own box — a floating panel can
never leave the workspace, and `panel.css` needed no change to make that true.
Measured with a root leaf at `self: br`: 248.3×248.3 at 651.7,151.7 inside a
900×400 workspace.

## The collapse the owner named, measured — and the fix is the one this file owns

Forcing a middle panel to `position: absolute` today with no support gives a
**0×0** box. It is the `container-type` trap again: a shrink-to-fit box whose
contained body reports empty. And its two grips land on the **same x**
(450, 450) — one seam drawn twice, the top one resizing a panel that no longer
occupies anything.

The owner's answer is the mechanism already here — a **declared** extent, capped
against the slot:

```css size.css
.panel-workspace .panel.panel-pos-absolute { position: absolute; inset: 0; z-index: 4; }
.panel-workspace .panel.panel-pos-absolute.panel-w-hug { inline-size: min(var(--panel-hug), 100%); justify-self: var(--panel-self-x, start); }
```

`fill` → `inset` 0 on that axis and no size, so it stretches. `hug` →
`min(var(--panel-hug), 100%)`. `fixed` → `min(var(--panel-w-at), 100%)`.
Measured that `%` on an abspos box resolves against the **containing block**
and never against the box itself (`min(600px, 100%)` → 400 in a 400px CB), so
`min(x, 100%)` is exactly right here and there is no self-measuring loop — the
same idiom as everywhere else in this file, for once without the `cq` detour.
The clamp measured: a `fixed: 24em` (372.5px) floating panel in a **200px**
workspace is 200px wide with `scrollWidth === clientWidth`, and a `hug`
floating panel in a **120px** workspace is 120px, not 248.3.

**Derived, not seeded.** The other candidate was to measure the panel's rect in
JS on the way out of flow and write `w_at`/`h_at`. Rejected: it writes data the
user did not ask for, the number is stale the moment the slot changes, and it
is not idempotent. Deriving in CSS is also **continuous** — a floating panel
reads the same `w`/`h` and the same `--panel-self-x`/`-y` it already had, so
switching modes moves nothing except the siblings, which is precisely what
float means. Measured: a `hug/hug self: cc` panel sits at 325.8,75.8 before the
switch and at 325.8,75.8 after it. And when a drag `move()`s a floating panel
into a different split it re-derives against its new parent with no data
written at all — measured landing at 651.7,151.7 inside the column it was
dropped in.

## `self` needed no new machinery, and that is the whole payoff

Measured: **Chrome honours `justify-self`/`align-self` on an absolutely
positioned box whose insets are 0.** `justify-self: center` on a 100px box in a
400px CB lands at +150; `align-self: end` on a 50px box in a 300px CB lands at
250. So the two custom properties `sizing()` already writes unconditionally do
the whole placement job, and the indirection stays exactly as it was — the
floating rules are simply another set gated on a **non-filling** axis.

Here that gate has teeth rather than being merely tidy. An alignment other than
`normal`/`stretch` makes an abspos box **shrink-to-fit**, so writing
`justify-self` on a filling axis *is* the collapse. And out of flow the two
properties always mean the containing block's inline and block axes — never the
flex axes the in-flow rules are written against — so there is one pair of
floating rules, not one per context. That is also why the in-flow rules are
excluded with `:not(.panel-pos-absolute)` rather than overridden: `.panel-items.v
> .panel.panel-w-hug` writes `align-self` with the **inline** code, which out of
flow would apply it to the block axis and collapse the panel. Excluding is a
stronger statement than overriding, and a reader should not have to prove the
other six leaked declarations harmless.

`self_axes()` gains the one branch the CSS does not need:

```js size.js
const live = floating(item) ? { x: true, y: true } : live_axes(mode, dir);
```

Out of flow the slot's display mode has no say at all, so only the fill test is
left — measured, a floating `hug/fill` panel reports `x` live and `y` dead with
*"height fills — nothing to align"*.

## The legacy `.hug` class is withheld from a floating panel

```js size.js
.ac(!over && (main === "w" ? w : h) === "hug" && "hug");
```

`.hug` exists to make a **body** hug where the panel's own box could not say how
wide it was. A floating panel's box states its extent directly, so its body
simply fills it and gets the size containment `.panel:not(.hug) > .panel-body`
already gives every filling panel — measured, a floating `hug/hug` panel and its
body are the same 248.3×248.3 with `container-type: size`. The consequence worth
knowing: a floating panel holding *real* content takes `--panel-hug` rather than
measuring its own block axis the way a static hugging panel does. A box out of
flow has to declare its extent; that is the trade, not an oversight.

## What the other two verbs do, and they needed nothing

**`close()` is unchanged.** It is a tree verb and floating is a paint word, so a
floating panel closes and absorbs exactly as any other does — measured, three
panels became two at 450 each with one grip. **Drag** likewise: `move()` is the
only thing a drop does to the tree, and the panel then floats over its new slot.
**`w`/`h` are kept**, all three extents, meaning the same three things — only
their carrier changes, from a flex basis plus a floor on a child (both inert for
a box that is not a flex item) to a declared size on the panel's own box.

⚠ **The grip is the one loose end, and it lives in a file this pass did not
own.** A floating panel must not keep a seam beside it. Two rules cover every
combination and were proved by injecting them live across all seven cases of
three panels:

```css grip.css
.panel-items > .panel-grip:has(+ .panel.panel-pos-absolute),
.panel-items > .panel-grip:not(.panel:not(.panel-pos-absolute) ~ .panel-grip) { display: none; }
```

The first hides the seam immediately before a floater; the second hides any seam
with no in-flow panel before it, which is what catches a floating *first* child
leaving a grip at x=0.

## Improvements

1. **A fixed extent in a grid slot shrink-wraps instead of taking its
   length.** `.panel-w-fixed` carries its length on `flex-basis`, which is
   inert in grid, so a grid-slotted fixed panel is sized by its content and
   merely *placed* correctly. Adding `inline-size` to that rule would fix it
   and is inert in flex only while `flex-basis` stays explicit — worth doing
   the day a split can actually be a grid, not before. The floating rules
   already state `inline-size`/`block-size` for exactly this reason.
   *(simple, latent)*
2. **`.panel-items.v` gets no `justify-self` twin.** In flex it would be
   inert and in a grid `.v` container `align-self` would mean the block axis,
   not the inline one this file writes there — a shape `workspace.js` cannot
   currently make, so the rule is left off rather than left wrong.
   *(medium, latent)*
3. **`legacy` is computed from `item.get("mode")` on every call.** Once a
   saved document has been through one edit with the new pickers, `w`/`h` are
   always present and the legacy branch is permanently dead weight for that
   panel — fine at the current size, worth noting if `extents()` grows.
   *(simple, speculative)*
