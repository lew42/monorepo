## properties.js

The inspector: one panel drawing the **focused** panel's words as live controls.
It is a `T` entry's payload like `generate.js` is — big enough to earn a file,
lazily imported by `templates.js`, and the second entry that reads something
outside the panel it is drawn in. Design record:
[Focus, and the panel that reads it](/framework/ext/Panel/doc/focus/).

## It reads focus, and so never takes it

```js templates.js
properties: { icon: "tune", focus: true, draw($body, panel){
	$body.append(import("./properties.js").then(m => () => m.properties(panel)));
} },
```

`focus: true` is the entry flag `workspace.js` checks before handing focus to a
clicked panel — the same shape as `tone: true`, and the same idea: the entry
declares what it reads. An inspector that focused itself would be holding
controls that edit the surface the controls are inside.

## `.panel-controls` is the one word it says about its own top edge

```js properties.js
const $props = div.c("panel-props panel-controls");
```

The bar is an overlay that lights on **hover** — which for a control surface is
exactly when its first row is in use. This file used to solve that privately,
with a `padding-block-start: 2.4em` in `templates.css` measured against the
inspector's own text size. It now declares the *fact* instead — my top edge holds
controls — and `panel.css` reserves the bar's published `--panel-bar-h` on the
body. Measured with the bar lit: overlap **0**.

The whole adoption cost for the next control surface is that class on the element
it draws, and `ext/editor` has now paid it: `palette`, `layers` and `properties`
wear `panel-controls` on the region they draw and nothing else changed — the
canvas abstains because it *is* the document, and the status strip because a
badge is read with the pointer somewhere else. Deliberately *not* a `T`-entry
flag like `focus: true` — the drawn payload is the thing the bar overlaps, and
CSS can already see it.

## Two listeners on the root, and they retire themselves

```js properties.js
const hear = () => { $props.el.closest(".panel-workspace") ? render() : stop(); };
const stop = () => { root.off("focus", hear); root.off("change", hear); };
```

`Item` events bubble to the root, so one pair of listeners there catches a focus
move and any panel's `change`. ⚠ The root outlives this DOM: switching the
template, closing the panel or any structural redraw drops the element and leaves
the root holding a dead closure. There is no teardown hook in the draw contract,
so each listener checks whether it is still in a workspace and unbinds itself if
it is not — one wasted round, then gone. `clock`'s self-cancelling timer is the
same pattern in `templates.js`.

`render()` refills through `$props.empty(fn)`, which re-establishes the captor —
the module has no `await` anywhere, and the entry above is the
promise-resolving-to-a-function shape for the same reason.

## Every chip is `set()`, and then one repaint

```js properties.js
.click(() => { target.set(key, name); repaint(target); });
```

`set()` is the bar's own call, so the root's listener saves and there is no
second write path. `repaint()` (exported by `workspace.js`) is the part the bar
gets for free and an inspector cannot: the target's `$panel`, `$body` and
`$items`, out of a `WeakMap` the view rewrites on every draw.

⚠ **Nothing may touch these buttons after `set()`.** The `change` it raises
re-renders every inspector on the page, this one included, so the element the
handler is running on is gone by the time `repaint()` returns. That is harmless
in this order and would be a bug in any other.

## The vocabulary is `glyphs.js`'s, not this file's

`ALIGN`, `COMPASS`, `PLACE`, `SEATS`, `MODE`, `SIZES`, `DIR`, `DISPLAY`,
`SWATCHES` and `glyph()` all come from `glyphs.js`, which imports `View` and
nothing else — so the bar, a seam's menu and this inspector can never draw a
different picture for the same word, and none of the three can circle through
the others. The nine align codes *are* their two axes and are generated there,
not listed.

## The second 3×3: `self`, and the two conditions that gate it

```js properties.js
const dead = (!axes.x.live && name[1] !== "c") || (!axes.y.live && name[0] !== "c");
```

`align` moves a leaf's **content** inside its body — that grid lives on the
panel (`tools.js`'s `align_grid()`). `self` moves the **panel** inside the slot
its split hands it, and it lives here rather than on the panel because two
identical 3×3s on one surface would be unreadable. Its picture is a `SEATS`
frame with a dot in it, never `COMPASS`'s arrows, for the same reason one level
up.

It is drawn **last**, under `width` and `height`, because those two rows are
what gate it: an axis that fills has nothing left to align, so picking an
extent above visibly opens or closes the grid below. `size.js`'s `self_axes()`
answers both halves — the fill test and `display.js`'s `live_axes()` truth
table, read off the slot's **real** computed display.

## `position` sits above `width`, because it says what those rows mean

```js properties.js
words(target, "position", Object.keys(POSITION), 2, POSITION);
```

In flow an extent is a flex basis; out of flow it is a declared box. Ordering
the row above the two it governs is the same reading that puts `self` below
them. A **split** is not offered it, the same withholding `mode`/`w`/`h`
already make above — a split gets its axis and nothing else, and its extents
are not editable here anyway, so a floating split could only ever be
`inset: 0`.

Switching to `absolute` opens the `self` grid on both axes at once, because out
of flow the slot's display mode has no say — only the fill test is left. That is
one branch in `self_axes()`; nothing in this file tests it.

**Shown, never hidden.** A dead axis honours nothing but its middle, so the
grid narrows to the strip of placements that are real: a column in a flex row,
a row in a flex column, one dot in a block slot, all nine in a grid. The dead
buttons stay in place, greyed and `disabled`, each carrying the reason in its
`title`, and the same sentence sits under the grid so it can be read with no
hover at all.

⚠ **Only the LIVE halves decide what reads `on`.** The stored code keeps
whatever it said about an axis nobody can move — the default is `tl` — so a
projection is what makes `tc` light up in a flex row, which is where the panel
genuinely is. Without it the default would highlight a disabled button.

The `on` swap is done by hand in the click handler (`querySelectorAll(".on")`,
then `ac("on")`), the same idiom `tools.js`'s `align_grid()` and `toolbar.js`'s
`pick()` use: the drawer rail is refilled on `panel-focus`, not on `change`, so
nothing else would move the highlight there.

## Improvements

1. **The empty state could name the affordance it is asking for.** "Click any
   panel" is honest but a first-time reader does not know a ring will appear;
   one more clause would carry it. *(simple, cosmetic)*
2. **`TONES` comes from `toolbar.js` and the tone chips are words.** The bar
   shows the same four as words too, but an inspector has room for swatches —
   `--surface`/`--wash`/`--prim`/`--ink` are already the four tokens the
   templates read. *(simple, speculative)*
3. **A leaf's `grow` is not offered**, so sizing is still the grip's alone. A
   number here would be a second sizing channel, which the module has so far
   refused — worth reopening only if seams prove hard to hit.
   *(medium, speculative)*
