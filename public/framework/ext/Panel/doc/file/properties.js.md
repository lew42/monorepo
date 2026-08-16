## properties.js

The inspector: one panel drawing the **focused** panel's words as live controls.
It is a `T` entry's payload like `generate.js` is — big enough to earn a file,
lazily imported by `templates.js`, and the second entry that reads something
outside the panel it is drawn in. Design record:
[Focus, and the panel that reads it](/framework/ext/Panel/docs/focus/).

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

## `ALIGN` is generated, not listed

```js properties.js
const ALIGN = ["t", "c", "b"].flatMap(y => ["l", "c", "r"].map(x => y + x));
```

The nine codes *are* their two axes, and `toolbar.js` keeps its own copy of the
same list for its 3×3 popover. Two derivations of one idea rather than two
literals — and this file stays out of `toolbar.js`, which by design reads nothing
of `ext/Panel` and is read by everybody.

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
