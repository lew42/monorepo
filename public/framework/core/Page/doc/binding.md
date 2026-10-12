# Binding — draw a value once, and it keeps itself up to date

**Binding** means a view on screen is tied to the data it shows. When the data changes, the view changes with it, and nobody has to remember to redraw it by hand. That is the cure for stale data: you change the value, every place that shows it follows.

```js
import { Property } from "/framework/core/Property/Property.js";

const cost = new Property("$0.00");                     // one live value
const card = new BigCard().clone({ heading: "Spend", cost });
card.render();                                          // a view that shows cost
cost.set("$1.25");                                      // that view updates itself
```

Live demo: [Templates](/framework/core/Page/Template/). The classes: [templates.md](templates.md). Source of every decision below: [owner notes 3](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/owner-notes-3.md).

## The answers, one line each

| Question | Decision |
|---|---|
| 1. How does a view subscribe, and unsubscribe? | Events (`on` / `off`), made lazily. Every binding returns its own unbind; the view keeps them and `drop()` / `dispose()` run them. |
| 2. Is a clone linked or a copy? | Both. `clone()` is linked, `copy()` is a hard copy. Each property can be overridden, reset with `unset(name)`, and `overrides()` lists them. |
| 3. When is a value a Property? | Only when something shows it live. Plain values stay plain; a record that is already an `Item` can use its own `change` event. |
| 4. `Field extends Property`? | Designed below, not built yet: no screen needs a control bound to a field today. |
| 5. Lists? | Already live: a `List` announces adds and removes. A list field in a template is the next step, designed below. |
| 6. Paths and `={expr}`? | Later. The design is recorded below. |

The measurements behind 3 are in [Measured](#measured).

## 1. Subscribing and unsubscribing

**Decision: events, with an unbind for every binding.** A `Property` is an `Events(Object)` ([core/Events/Events.js](../../Events/Events.js)). `prop.bind(fn)` calls `fn` now and on every change, and returns the function that undoes it.

```js
const off = cost.bind(v => span.text(v));   // listen
off();                                      // stop listening
```

**The lazy gate is already there.** `Events.on()` makes the `_on` object the first time something listens (`this._on ??= {}`), so an object nobody listens to has none. A template clone used to get an empty `_on = {}` at birth; it now gets `null`, which hides the template's listeners from it but still allocates nothing until the clone's first `on()`.

**Who unbinds what, and when:**

| When | Who | What happens |
|---|---|---|
| A view is drawn | `Template.show(name)` | binds a span and files the unbind on that view (`view.unbinds`) |
| A view is redrawn | `Template.refresh()` | the old view's unbinds run, the new view binds again |
| A view is removed | `Template.drop(view)` | runs its unbinds, removes the element |
| A clone dies | `Template.dispose()` | disposes its own clones first (they read through it), drops every view, leaves its template's `clones` list |

After a drop, the listener count is back to exactly 0 ([Measured](#measured), every strategy).

**Alternative: let garbage collection unbind.** JavaScript has no destructor. A `WeakRef` or `FinalizationRegistry` fires whenever the collector feels like it, so a dead view would keep receiving updates until then, and a test could never prove it is gone. Rejected: unbinding is explicit and countable.

**Watch out:** an element removed from the page some other way (not through `drop`) keeps its listeners until its clone is disposed. Remove template views with `drop(view)`.

## 2. Linked clones and hard copies

**Decision: both, chosen per use, and granular per property.**

```js
const a = card.clone({ heading: "Mine" });   // linked: reads the card for everything else
const b = card.copy({ heading: "Mine" });    // hard copy: owns every value, no link back
a.unset("heading");                          // reset: a reads the card's heading again
a.overrides();                               // ["heading", …]: what a changes, own names only
a.overrides("columns.0.");                   // the same, for one section
```

- **Linked** (`clone`): each clone is a layer over its template (`Property.Map`). Reading a name it does not own falls through to the layer below, so a change to the template reaches every clone that has not overridden it, at any depth.
- **Override** a property by setting it on the clone; it never writes the template's value.
- **Reset** with `unset(name)`: the clone's own value is deleted, and the next read finds the template's again. Every view that reads through that clone redraws.
- **Visible:** `overrides(prefix)` lists what this layer owns. Sections are name prefixes (BigCard names its columns `columns.0.title`), so one call answers per property and per section.
- **Hard copy** (`copy`): every value the template can see, copied as plain values onto one layer with no parent. Later template changes never reach it, and it is not in the template's `clones` list.

**Alternative: one "linked" flag per clone.** Rejected: override plus `unset` already gives linking per property, which is finer than a flag per clone.

**Bug found and fixed while writing this** ([Template.test.mjs](../Template/Template.test.mjs)): when a middle clone overrode or reset a value, its own clones kept showing the old one. `set` and `unset` now call `redraw(name)`, which refreshes every clone, at any depth, that still reads that name through this one (`inheritors(name)`).

### The kinds of property

A short list, so a property's kind says which control edits it (see [4](#4-field-extends-property)):

| Kind | Holds | Edited with |
|---|---|---|
| `text` | a string | a text input |
| `number` | a number | a number input or a slider |
| `flag` | true or false | a checkbox |
| `choice` | one of a fixed list | a select |
| `css` | a CSS value (a colour, a size, a scheme word) | a colour or size picker |
| `item` | a nested object with its own `set()` | its own editor |
| `list` | a `List` of items | a list editor |

CSS properties are one kind among the seven, not a separate system.

## 3. A Property only where it pays

**Decision: values are plain until something shows them live.** `Property.Map.prop(name)` makes the `Property` the first time a view binds that name, on the layer that owns the value. A field nobody shows has no Property and no listeners. A record that is already an `Item` (a session, a task, a message) can bind with its own `change` event instead.

| Use | When |
|---|---|
| A plain value | It is drawn once and never changes while shown (most fields: 7 of 10 in the measurement). |
| A `Property` | The value is shown live, shared by many clones, or passed around as a thing of its own (a cost meter). |
| `Item`'s `change` | The data is already an Item that saves itself; one listener per view, filtered by key. |

**Alternative: a Property for every value.** Measured below: 10,000 listeners and 2.4 to 2.6 times the memory of the lazy way, for the same update speed. Rejected.

**Does `Item.set` emit a change per property name?** It emits one `change(key, value, old)` for every key, on the whole Item. That is enough, and the measurement shows it is cheap: at 1,000 rows, waking every row for a change nobody shows cost 0.03 ms. So no `BindableItem` class. The cost to watch is that this listener must be removed by hand; file its `off` in the view's `unbinds` the same way `show()` does.

### Measured

A 1,000-row grid, each row a clone with 10 cells, 3 of them live, one of those (`unit`) shared by every row. Four ways: **re-render** (no binding: redraw everything on any change), **every** (a Property per cell), **lazy** (the slice: a Property only for the 3 live cells), **item** (one `Item` per row, one `change` listener per row). Headless Chromium, real spans in a CSS grid, layout forced after each step, median of 3 runs:

| | create | update the shared value | change a value nobody shows | listeners | listeners after drop | JS heap |
|---|---|---|---|---|---|---|
| re-render | 41 ms | 38 ms | 36 ms | 0 | 0 | 0.5 MB |
| every | 46 ms | 7.9 ms | 0 ms | 10,000 | 0 | 3.2 MB |
| **lazy** | 44 ms | 8.1 ms | 0 ms | 3,000 | 0 | 1.3 MB |
| item | 46 ms | 4.4 ms | 0.03 ms | 2,000 | 0 | 1.0 MB |

Node, fake cells (the cost of the binding alone): lazy 2.4 MB and 0.02 ms an update; every 6.3 MB; item 2.4 MB; re-render 0.9 MB and 0.22 ms.

What it says, plainly:
- **Binding beats redrawing** by about 5 times per update, and a change nobody shows costs nothing instead of a full redraw (36 ms is two frames at 60 fps).
- **Lazy beats a Property per cell** on memory (2.4x less) at the same speed. That is decision 3.
- **Item's `change` is as good as lazy Properties here.** Its update was faster in the browser (4.4 ms against 8.1 ms; the cause is not yet known, the node run shows no gap). So binding to an Item record needs no Property at all.
- **Every strategy unbinds to exactly 0.**

Run it yourself: `node public/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/binding/measure.mjs` ([bench.mjs](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/binding/bench.mjs), the last output in [results.txt](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/binding/results.txt)).

## 4. `Field extends Property`

**Design: a Property that knows what it is and how to edit it.**

```js
class Field extends Property {
	constructor(value, { name, kind = "text", owner }){ … }   // kind: one of the seven above
	control(){ … }                                          // the input that edits it, bound both ways
}
```

- `page.clone({ name: value })` assigns any field or property, as today.
- A value that is `instanceof Property` (a `Field` included) means "bind live"; a plain value means "draw once". That rule already holds in `Property.Map.assign()`.

**Decision: not built yet.** No screen today needs a control bound to a field. The first editor that does (the page CMS's properties panel) builds `Field` in `core/Property/`. *Alternative:* build it now; rejected, a class with no caller gets its API wrong.

**Binding to an object's value without a Property object.** Three syntaxes, side by side:

| Syntax | Reads as | Verdict |
|---|---|---|
| `clone({ cost: prop })` | "this value, live" | ✅ today |
| `clone({ cost: Property.of(item, "cost") })` | "item's cost, live" | ✅ recommended next: a Property that mirrors one key of an Item and writes back through `item.set`, so the Item still saves its delta |
| `clone({ cost: [item, "cost"] })` | unclear: a pair, or an array value? | ❌ |

`Property.of` must listen to the Item only while it has listeners of its own, or it leaks; that rule is why it is not a one-liner. Not built in this slice.

**Watch out:** `Item.set(key, v)` hands `v` to a value that has its own `set()`. So a `Property` stored inside an Item's data swallows the write, and the Item emits no `change` and no `delta`, so nothing is saved. Keep Properties beside Items, never inside their data.

## 5. Lists

A `List` already announces every add and remove ([core/List](../../List/)), and items save themselves as deltas in JSONL (their own file, or embedded in `page.jsonl`). A session, task or message on screen is an Item with data; its template binds to that data with `change` (above).

**Next step, designed only:** a list field in a template, `this.list("rows", row => …)`, that draws one part per item and listens to the List's `add` and `remove`, the way `PageContent` already does for a page's parts. Not in this slice.

## 6. Paths and expressions (later)

Recorded now, built later:

- **Paths.** Hover any value to see its JavaScript path (`page.content.k2.title`) in a tooltip, so you know where it lives and how to reference it.
- **`={path}`** in the UI binds a field to another value: a Property bound to a Property, no hand wiring.
- **`={ any JS expression }`** computes a value from others (a condition, any logic). Underneath it is a callback between bound values: when any value it reads changes, it runs again and sets its own Property.
- A UI control bound to a property is `Field.control()` (4); one property bound to another is `={path}`.
