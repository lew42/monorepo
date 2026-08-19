# Layout — a toolbar over anything, and a right-hand drawer that *pushes* the page over; for demo and guide pages that let the reader arrange things

## Use

```js
import layout from "/framework/ext/layout/layout.js";
import { knob } from "/framework/ext/layout/controls.js";

layout(() => { box("Alpha"); box("Beta"); })          // layout owns the box
layout.bar($box)                                       // …or steer a View, Element or Page you built
layout.bar($box, "mode gap column radius")            // …or name the controls yourself
layout.words.radius = $el => knob($el, "--radius", 0.25, 2, 0.05)
layout.context($box, $sel => …)                        // extra drawer content, for it or anything in it
```

## Watch out

- Register `layout.context()` once, on the region — the drawer draws the nearest registration at or above the selection, so a re-render can't strand it: [`doc/drawer.md`](./doc/drawer.md)
- `layout.bar()` returns an empty strip and fills it on the next microtask (`page.view` isn't set until `content()` returns): [`doc/decisions.md`](./doc/decisions.md)
- The `fill` page word pairs `.page.fill` with an inline `overflow: auto`, or everything below the fold is clipped: [`doc/decisions.md`](./doc/decisions.md)
- A `<select>` gets its value after its options exist; a knob reads at build and writes only on input: [`doc/controls.md`](./doc/controls.md)
- The outside-click listener runs in the capture phase, and `popstate` deselects outright: [`doc/decisions.md`](./doc/decisions.md)
- Selecting only *fills* an open rail now, it never opens one — `layout.bar()`'s sliders chip is the one explicit way in: [`doc/decisions.md`](./doc/decisions.md)
- An unregistered word in a bar's list is skipped, never thrown — a misspelling draws one control short.
- `layout.selectable($el)` grants a region beyond the one `layout.bar()` already steers — the two-up's second pane is the one caller, and its own pane ends up region'd twice: [`doc/selection.md`](./doc/selection.md).

## More

- [Overview](/framework/ext/layout/) · [`doc/vocabulary.md`](./doc/vocabulary.md) (why `words` is a registry, one bar for three targets) · [`doc/drawer.md`](./doc/drawer.md) (why it pushes, the `--drawer` rail, width clamp) · [`doc/selection.md`](./doc/selection.md) (what's selectable, page vs container words) · [`doc/controls.md`](./doc/controls.md) (the primitives, reused directly by `ext/editor` and `ext/Panel`) · [`doc/decisions.md`](./doc/decisions.md) (callers, traps in full, open items, history)
- Files that matter: `layout.js` (box, bar, selectable), `panel.js` (selection and drawer), `words.js` (the control vocabulary), `controls.js` (chips, menu, knobs). Imports flow `layout` → `panel` → `body` → `words` → `controls`.
