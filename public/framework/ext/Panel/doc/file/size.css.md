## size.css

The rules `size.js`'s classes select, layered on top of `panel.css`'s base
`flex: 1 1 0`. **Two regimes.** In flow, every rule keys off which axis is
**MAIN** for a given panel — the axis its own parent split runs along (row or
root → inline is main; col → block is main) — versus **CROSS**, the other one.
Out of flow, at the bottom of the file, nothing flex says applies and every
extent is restated. `size.js` is the sole writer of every class here.

## MAIN axis, hug: `auto`, and one rule for the block axis

```css size.css
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-w-hug:not(.panel-pos-absolute) { flex: 0 0 auto; justify-self: var(--panel-self-x, start); }
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-w-hug:not(.panel-pos-absolute) > :is(.panel-body, .panel-items) { flex-basis: auto; }
.panel.panel-h-hug > :is(.panel-body, .panel-items) { flex-basis: auto; }
```

`hug` is `auto` since 2026-08-19: no declared extent, no floor, no query
container — the box measures what it holds, and `.panel`'s own
`max-inline-size: 100%` (`panel.css`) caps it at the slot.
[sizing](/framework/ext/Panel/doc/sizing/).

⚠ **The third rule is the one that makes a hugged HEIGHT a real number**, and it
is deliberately unscoped. `.panel` is always a flex COLUMN, so its block axis is
its child's MAIN axis — and a `flex: 1 1 0` child of a box that is measuring
itself resolves to **zero** and takes the panel with it. Measured: a root panel
with `h: hug` and twelve lines of text read **0px** until this line existed. One
rule covers every case at once — main axis or cross, in flow or out of it, leaf
(`.panel-body`) or split (`.panel-items`). The inline axis needs no twin: a
column's cross size is already its content.

## MAIN axis, fixed: `flex-basis` alone, no floor needed

```css size.css
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-w-fixed { flex: 0 1 min(var(--panel-w-at, 16em), 100%); }
```

A chosen length is never `auto`, so there's no auto-basis to floor — the
value goes straight on `.panel`. `min(x, 100%)` is the owner's idiom: `%` is safe
here because it resolves against `.panel`'s own containing block
(`.panel-items` or `.panel-workspace`), never against `.panel` itself, so
there's no loop to guard against.

## CROSS axis: a value directly on `.panel` — and THE flow default

```css size.css
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-h-hug:not(.panel-pos-absolute):not(.panel-mode-document) { align-self: var(--panel-self-y, stretch); min-block-size: var(--panel-min, 5em); }
```

The cross-axis rules set size directly on `.panel`, never a floor on a
child. `align-self` is what does the work: it clears or restores the
ancestor's `stretch`, which is the only reason the cross axis used to always
fill regardless of `mode` (see `doc/file/size.js.md`'s finding).

⚠ **`stretch` is the one fallback in this file that is not `start`
(2026-08-19)**, and it is the whole of the flow default. A div in a row is as
tall as the row; only a panel that CHOSE a `self` shrink-wraps and sits where
it was put — which is why `size.js` writes `--panel-self-y` only then. Two
consequences fall out of the single word, and both are what a workspace
already did: a **root stretches** to a `.panel-workspace` that was given a
height (so `ext/editor`, `ext/files`, the playground and every
`--panel-height` demo are unmoved — measured, all four roots to the pixel),
and it **measures its content** when the workspace is `auto` (the Demo panes).

⚠ `:not(.panel-mode-document)` — a document root must GROW past its workspace
and let it scroll (`panel.css`), and `stretch` would cap it at one screen.

⚠ The `--panel-min` floor here tied at (0,3,0) with `panel.css`'s
`--panel-section` floor and won by load order; the playground's document
sections dropped 241px → 75px. That rule carries `.panel-workspace` on the
front now. [doc/sizing.md](/framework/ext/Panel/doc/sizing/).

## MAIN axis, hug, block: flow rather than shrink-wrap

```css size.css
.panel-items.v > .panel.panel-h-hug:not(.panel-pos-absolute) { flex-basis: auto; min-block-size: var(--panel-min, 5em); }
```

`flex-basis` alone, not `flex: 0 0 auto`: the basis is the content, so a stack
in an auto-height column is exactly as tall as what it holds — and the grow
the panel already carries (`--panel-grow`, `panel.css`) still divides a column
that WAS given a height, which is the only reason a `fill` workspace still
looks like one screen with `hug` as the default. A hugging WIDTH keeps
`flex: 0 0 auto` above: a sidebar that grows is not a sidebar.

## ⚠ The block-axis cap is `max-block-size`, never `min(x, 100%)`

```css size.css
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-h-fixed:not(.panel-pos-absolute) { align-self: var(--panel-self-y, start); block-size: var(--panel-h-at, 16em); max-block-size: 100%; }
```

A percentage *size* against an indefinite parent resolves to **zero**; a
percentage *max* resolves to `none`. Measured 2026-08-19: a bottom-edge drag
committed `h: fixed, h_at: 39.25em` and the root read **0px** in an
auto-height workspace. The main-axis twin is a bare basis — `flex-shrink`
already caps it against a definite column. The INLINE axis keeps
`min(x, 100%)`: a workspace always has a definite width.

## Self-alignment is a fallback swap, and nothing more

The value used to be a hardcoded `start`; it is now
`var(--panel-self-y, start)` — the same number when nobody has chosen, and
`center`/`end` when they have. `size.js` writes the two custom properties;
`Panel.defaults.self` is `"tl"`, which resolves to `start`/`start`, so a saved
document renders to the pixel where it always did.

⚠ **Which axis `align-self` means is the container's call, not this file's.**
In flex it is the CROSS axis — block in a row, *inline* in a column — and in
grid it is always the block one. Every rule here is already scoped to one
context, so each reads the half of `self` its own context makes it mean: the
row-context rules read `--panel-self-y`, the `.v` ones read `--panel-self-x`.
There is no rule that has to guess.

```css size.css
:is(.panel-workspace, .panel-items:not(.v)) > .panel.panel-w-hug:not(.panel-pos-absolute) { flex: 0 0 auto; justify-self: var(--panel-self-x, start); }
```

`justify-self` rides the **main-axis** rules, and only the two non-filling
ones. It is inert in flex, so a flex row's main axis stays the parent's call
exactly as before; it is the whole control the moment the slot is a grid. Being
on the non-filling rules is what makes *"a filling panel has nothing left to
align"* true with no test anywhere in JS — a filling axis simply has no rule
that reads the property.

## Out of flow: the second regime, and why it EXCLUDES rather than overrides

```css size.css
.panel-workspace .panel.panel-pos-absolute { position: absolute; inset: 0; z-index: 4; }
.panel-workspace .panel.panel-pos-absolute.panel-h-hug { align-self: var(--panel-self-y, start); }
```

Every extent is restated here because the rules above carry a main-axis extent
on `flex-basis` and on a floor on a child, and **both are inert for a box that
is not a flex item**. `%` on an abspos box resolves against the containing block
and never against the box itself, so `min(x, 100%)` caps cleanly and
no self-measuring loop.

The in-flow rules carry `:not(.panel-pos-absolute)` rather than being overridden
from below, because one leaked declaration is a real collapse:
`.panel-items.v > .panel.panel-w-hug` writes `align-self` with the **inline**
code, and out of flow `align-self` always means the *block* axis — an alignment
other than `normal`/`stretch` makes an abspos box shrink-to-fit, so that leak
would size a floating panel to its content. Excluding says the two regimes are
disjoint; overriding would make a reader prove the other six leaks harmless.

⚠ **`z-index: 4`, because a floating panel that paints under the chrome is not
floating.** `.panel-grip` is `position: relative; z-index: 2` and a bar is 3, and
every panel in a workspace shares one stacking context — `.panel` never makes
one and `.panel-workspace` does. Measured: `elementFromPoint` at the floater's
centre *and* over a coincident grip both return the floating panel.

Design record, including the measured rejections of `fixed` and `sticky`:
`size.js` in the [Files tab](/framework/ext/Panel/files/).

## The control lives here too, because the rule does

```css size.css
.panel-props-set.panel-self .panel-btn:disabled { opacity: 0.3; cursor: not-allowed; }
```

`properties.js` draws a second 3×3 tagged `self`, and greys the placements the
two conditions rule out. The greying belongs in this file rather than
`templates.css` because the *rule* is this file's: an axis that fills, or one
its slot owns, has no placement to give. `.panel-seat` — `glyphs.js`'s picture,
a dot in a frame where the panel would sit — is styled here for the same
reason, at `font-size: 1.25em` so it measures exactly what `framework.css`
gives an `.icon` and a seat and an arrow are the same size side by side.

The scoped square rule that used to sit here is **gone**: `toolbar.css`'s "a
button holding a picture is a square" now names `.panel-seat` directly
(`:has(> .icon, > .panel-swatch, > .panel-seat)`), so the fact is stated once
instead of twice.

## Improvements

1. **A grip beside a floating panel separates nothing, and the rule for it lives
   in `grip.css`.** Two selectors cover every combination, proved live across all
   seven cases of three panels: hide the seam immediately before a floater, and
   hide any seam with no in-flow panel before it. Needs an edit to a file this
   pass did not own. *(simple, required — see `size.js`'s record)*
2. **Otherwise nothing ranked.** One job (four in-flow rule pairs, main × cross ×
   hug × fixed, one out-of-flow set, plus the control that draws them), each pair
   already commented with the trap it avoids.
