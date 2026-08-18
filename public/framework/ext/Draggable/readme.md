# Draggable — grab-and-move for any View; `Sortable` reorders, crosses lists and nests on one code path

## Use
```js
import Sortable from "/framework/ext/Draggable/Sortable.js";
class Card extends Sortable {
	drop_check(target){ return target !== this && !this.item.contains(target.item); }
}
new Card({ view: $node, handle: $bar, $items, item });   // a row, and a box rows land in
new Card({ view: $node, handle: false, $items, item });  // drop site only — nothing to grab
```

## Watch out
- `handle: false`, not `null` — `??=` turns `null` into `this.view` and the column grows a grip. [`doc/decisions.md`](./doc/decisions.md)
- A container's `$items` must sit inside its `view.el`, or hit-testing never finds it. [`doc/decisions.md`](./doc/decisions.md)
- The descendant guard is yours (above); with two trees on one page add `target.item?.root() === this.item.root()`. [`doc/decisions.md`](./doc/decisions.md)
- An empty container needs a `min-height` (`draggable.css` gives one) — no height, no drop surface. [`doc/file/draggable.css.md`](./doc/file/draggable.css.md)
- Nothing real moves mid-drag (ghost + placeholder only), so Escape / `cancel()` commit nothing. [`doc/sortable.md`](./doc/sortable.md)
- A re-render orphans instances harmlessly (WeakMap registry); `destroy()` only when you keep the element. [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/ext/Draggable/) · [`doc/decisions.md`](./doc/decisions.md) — traps in full, deferred edge bands, who subclasses it
- [`doc/sortable.md`](./doc/sortable.md) — what Sortable adds: ghost, placeholder, `locate(e)` → a position
- [`doc/verdicts.md`](./doc/verdicts.md) — pointer capture, `elementsFromPoint`, filter on the dragger, two classes
- `doc/method/`, `doc/property/`, `doc/file/` — per-member notes the overview renders
- Files that matter: `Draggable.js` (grab, hit-test, cancel), `Sortable.js` (locate, item.move), `draggable.css` (ghost, placeholder, min-height)
