## split.js

Click a panel's **edge**, get a split preview: a ghost of the arriving panel
that follows the pointer and flips across the midline, committing on a left
click and cancelling on a right click or Escape. One gesture where a strip of
edge buttons used to be three, because the edge you clicked already supplies
both arguments `divide()` takes.

```js split.js
const AXIS = { l: "row", r: "row", t: "col", b: "col" };
const LOW = { l: true, t: true, r: false, b: false };
```

`l`/`r` divide a **row** — a new column beside you; `t`/`b` divide a
**column** — a new row above or below. `LOW` is also the opening guess at
which side the ghost starts on, so a click that commits without any pointer
movement still does the obvious thing.

## One live preview per document

```js split.js
let live;   // one preview per document — a second edge click cancels the first
```

Module-scope, not per-call: clicking a second edge while a preview is already
open cancels the first (`live?.cancel()`) before starting the new one, rather
than leaving two previews live at once.

## `begin()` — the ghost, and the pointer read

```js split.js
const aim = e => {
	const box = $panel.el.getBoundingClientRect();
	const next = across ? e.clientX - box.left < box.width / 2 : e.clientY - box.top < box.height / 2;
	if (next === before) return;
	before = next;
	mark();
};
```

`$ghost` is placed once, synchronously, inside `$panel.append()`; `aim()`
only ever toggles its `before`/`after` class as the pointer crosses the
midline, so a redraw never has to rebuild the element mid-drag.

## ⚠ Document listeners bind on a `setTimeout`, not synchronously

```js split.js
setTimeout(() => {
	if (!live) return;
	document.addEventListener("pointermove", aim);
	document.addEventListener("click", commit);
	…
});
```

The click that **opened** the preview has not finished bubbling to the
document yet. Bind `commit` on `click` synchronously and that same click
fires it immediately — the preview would commit itself before it had ever
been drawn. The `if (!live) return` guard covers the case where `cancel()`
already ran (a second edge click, or Escape) inside that same zero-delay
window.

## `commit`/`cancel`/`key` — three ways out, one teardown

```js split.js
const done = () => {
	live = null;
	$ghost.el.remove();
	document.removeEventListener("pointermove", aim);
	…
};
const commit = () => { const at = before; done(); item.divide(dir, new Panel(), at); };
```

`commit()` reads `before` into a local (`at`) **before** calling `done()`,
because `done()` is what removes the ghost and its listeners — reading the
flag after teardown would still work here (nothing clears `before` itself),
but the ordering keeps "what was decided" and "cleanup" from interleaving.

## Improvements

1. **`AXIS` and `LOW` are two maps over the same four keys**, and every
   caller that reads one immediately reads the other beside it (`begin()`
   does exactly this). A single `{ l: { dir: "row", before: true }, … }`
   would read as one table instead of two that happen to share keys.
   *(simple, speculative — 76 lines, not worth it yet)*
