# Object — one default view for any object: a row you can open, live

`view(x)` draws any object (an Item, a List, a class, a plain object, an array) as one row: the class's icon, the id, the class name as a small label, and counts ("3 items"). Click it open and it shows the object's data by type: a string or number is written out, an object it owns opens the same way, and a reference (its `parent`, a store) says where it points; a click on a reference flashes every view of its target. It is live: a change redraws only the row it touched. **See it:** [watch a tree being built](/framework/core/Item/watch/).

## Index

- [DefaultView.js](./DefaultView.js) — `class DefaultView extends View`, and `view(thing, opts)`, the one call
- [DefaultView.test.js](./DefaultView.test.js) — its one core test, in a browser (16 checks); the result shows on the [watch page](/framework/core/Item/watch/)
- [InstanceTree.js](./InstanceTree.js) — the whole running site as a live tree of pages; each opens its `view()` ([doc](doc/instance-tree.md), [page](/framework/ux/Content/Object/instance-tree/))
- [Object.js](./Object.js), [Inspect.js](./Inspect.js) — ⚠ deprecated (2026-10-28): `object()` and `inspect()` draw the default view, open one level
- [doc/default-view.md](doc/default-view.md) — what the view reads, how it stays live, and why one view replaced three

## Use

```js
import { view } from "/framework/ux/Content/Object/DefaultView.js";

view(item)                                   // closed: one row
view(item, { open: 3 })                      // three levels open from the start
view(obj, { properties: "title state" })     // only these rows, in this order
view(Page, { open: 1 })                      // a class: its fields, then its own methods
```

A class may carry `static icon = "material-symbol-name"` (else `"data_object"`), `static shown` (rows first) and `static hidden` (rows never shown). A class with its own look declares `static View`, a View that takes `subject`; `view()` picks it, nested rows always use the default.

## Watch out

- **Live means an emitter.** The view listens to the object's `"delta"` event (an Item, a List, anything with `on()`); a plain object draws once.
- **Every view of an object is in `item.views`** (core/Item/Item.js; a WeakMap for other emitters). A view whose element has left the page drops out on the next change, so a view built and never attached stays listed.
- **Built outside a render, pass `capture: false`**, or the view lands in whatever is capturing at that moment (the page body).
- `item.view` (singular, core/Item) is a class's own view (`PageText.View`, `Task.View`), not this one.
- `List.render()` drawing each member through its own view is not built: `core/List/List.js` belongs to the data backbone build. `view(list)` already does it.

## More

- [Live demo of this module](/framework/ux/Content/Object/) · two live trees: [the Page object](/framework/ux/Content/Object/page/), [the App object](/framework/ux/Content/Object/app/)
- [doc/census.md](doc/census.md) — which classes are worth a view (2026-10 walk)
- [code/objects](/framework/code/objects/) — the rule: every class ships a view of its state
