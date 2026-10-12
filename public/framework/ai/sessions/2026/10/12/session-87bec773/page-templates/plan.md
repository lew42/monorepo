# Page templates — the plan

The goal, in one line: a small set of robust layouts, each one a class you can render many times with different data, instead of a new broken preview every time.

Brief: [requirements.md](requirements.md) · past work: [past-work.md](past-work.md) · architecture: [core/Page/doc/templates.md](../../../../../../core/Page/doc/templates.md)

## How rendering and binding work today

- **Page renders once.** `Page.render()` (`core/Page/Page.class.js`) builds one `div.page` and caches it in `this.view`; a second call returns the same view. `rerender()` throws it away and builds a new one. So a page cannot appear twice.
- **Item holds the data.** Every value lives in `item.data`; `set({key: value})` writes it and emits `change(key, value, old)` on the whole item (`core/Item/Item.js`).
- **Events come from one mixin.** `core/Events/Events.js` gives `on`, `off`, `emit`, and by default an emit **bubbles** to `parent`. Page turns bubbling off.
- **Views don't listen.** A view is drawn from the values at draw time. To update, something calls `rerender()` (the whole page) or a part redraws itself from a list's events (`PageContent`).
- **Previews are hand-built.** The Figma palette page (`ext/Figma/palette/page.js`) and its siblings each hand-write their layout inside `content()` with filler text. That is the copy-paste the owner wants to stop.

## The decisions

1. **Name: `class Template extends Page`.** ✅ The owner's lean, kept. A template IS a page (it has a url, a title, a demo), plus the power to render many times. *Alternative:* `Layout`; rejected for the reason the owner gave (view, system or widget?), and `Layout` already names a class in this repo.
2. **Render many: a `views` array.** ✅ `Template.render()` draws a fresh view on every call and pushes it onto `this.views` (`this.view` stays the newest one, so Page code that reads `view` still works). An update reaches every view in the array. `drop(view)` removes one and unbinds it. *Alternative:* keep one cached view and clone its DOM; rejected, because cloned DOM has no listeners.
3. **Clone vs extend: both, for different jobs.**
   - **Extend** (`class BigCard extends Template`) makes a new *kind* of layout: its `draw()` is the layout.
   - **Clone** (`card.clone({...})`) makes a new *use* of a layout with its own data. It is `Object.create(template)`, so a clone inherits the template's methods and filler.
   - **The linkage trap, fixed by design.** An `Object.create` child shares everything it doesn't own. Three things would leak, and `clone()` gives each clone its own: `_on` (the event listeners; a listener added to a clone would otherwise land on the template), `views`, and `data`. `data` becomes `Object.create(template.data)`: a clone *reads through* to the template's filler and *writes* only to itself. The template keeps a `clones` list (the record keeping), so a change to the template's own filler can refresh the clones that still inherit it.
   - *Alternative:* `new this.constructor({...})`; it re-runs the whole Page constructor (tracking, naming, children), costs more, and loses the read-through filler.
4. **Data binding: `clone({ title: "x", cost: someProperty })`.** ✅ Exactly the owner's shape. Each key is a static value or a `Property`. A static value draws once; a Property draws a text node that updates itself.
5. **A `Property` class.** ✅ Small, `class Property extends Events(Object)`, in `core/Property/`. One object per value: `get()`, `set(v)`, `change(value, old)` only when it really changed, `bind(fn)` that returns its own unbind, no bubbling.
   - **Versus Item's events:** Item emits one `change` for *every* key, so a view showing one field wakes on all of them and must filter by key; listeners are never removed when a view goes away; and emits bubble to the parent by default. A Property wakes only its own listeners, each binding comes with its unbind (called by `drop(view)`), and it never bubbles. That is more object-oriented (the value is an object you can pass around) and it closes the leak.
   - **Passing values to sub-objects** (the owner's earlier Property): not in this slice. Recorded as the next step: a Property holding an object with its own `set()` hands a plain delta down to it.
   - **Same event system, not a second one.** Property uses the same `Events` mixin as Item (`core/Events/Events.js`); it only gives each value its own emitter. Past work found no older `Property` class anywhere in git history ([past-work.md](past-work.md) §3), so this one is new; if the owner's earlier file turns up, compare it then.
   - **`views` is a record, not the update path.** Item chose events over a `views[]` registry ([core/Item/doc/decisions.md](../../../../../../core/Item/doc/decisions.md)). That still holds: updates travel by events; `views` only lists what was drawn, so `drop()` can unbind and `refresh()` can redraw.
   - **No restructuring.** Item keeps its events; Property is opt-in, used only by Template for now. Measure (below) before using it anywhere else.

## Owner notes 2: fallthrough, lazy properties, clone as a delta, tests

Source: [owner-notes-2.md](owner-notes-2.md). These revise decisions 3 and 5.

6. **Anything can become a template.** ✅ `Template` holds no layout of its own. Anything with a `draw()` that proves useful can become one, so the clone and property logic must not depend on BigCard.
7. **Fallthrough through the prototype.** ✅ Each layer is `Object.create` of the layer below, so there can be any number of fallbacks. Each instance has **two maps**, and both fall through:
   - `data`: plain values, `Object.create(source.data)` (as in decision 3).
   - `props`: the live `Property` objects, name → Property, `Object.create(source.props)`. A clone writes its overrides into its own map and never into its prototype's.
   - **Delete falls back.** `clone.unset("cost")` deletes the clone's own key in both maps; the next read finds the parent's value, and that clone's views redraw.
8. **Is each Property cloned? No: it is shared until it is written, then copied.** A clone that doesn't override `cost` reads the parent's Property through the map, so both stay live together. That is correct: it IS the same value. The moment a clone sets `cost`, `set()` sees the key isn't its own, makes a **new own Property** with the new value, and redraws that clone's views so they bind to it. It never calls `set` on the inherited Property, because that would change the parent and every other clone. *Alternative:* copy every Property at clone time; rejected, because it breaks live fallthrough and costs a Property per field per clone.
9. **Lazy: a Property exists only when something is bound.** ✅ A static field stays a plain value in `data` with no events at all. `prop(name)` makes the Property the first time a view binds that field, and it is created on **the layer that owns the value** (found by walking the prototype chain), so a clone's view of an inherited field listens to the parent's value. With a thousand nested objects, only the bound fields pay for listeners. After that, `set(name, v)` on a bound field goes through its Property (only those spans update), and an unbound field is a plain write.
10. **Clone as a delta.** ⬜ Untried, designed only, so it doesn't block the slice. A duplicate button or an alt-drag appends one line to the page's log, `{"content": {"clone": {"from": "<id>", "set": {...}}}}`. The content List's `clone` method copies item `<id>` with `Template`'s rule, applies the overrides, and inserts the copy after the original. Replaying the log rebuilds the same chain, so any item can be changed procedurally. The open question for step 2: saving a clone stores the `from` link plus only its own keys, not a full copy.
11. **Tests.** ✅ The repo already has a test system: plain `node <Module>.test.mjs` files using `node:assert`, beside the module (`core/Item/Item.test.mjs`, `Servex/**/*.test.mjs`). There is no runner and no new dependency. So the map and fallthrough logic lives in a DOM-free `Property.Map` (a static helper class in `Property.js`), tested in node: clone, override, delete-falls-back, a shared Property until written, a lazy Property only on bind, listeners going back to 0 after unbind. The DOM half (spans updating in two views) is checked on the demo page with `check_page` + `eval`.
12. **Batched DOM updates** belong to [perf-system](../perf-system/requirements.md), not here. A Property updates its spans directly; if perf-system adds a frame batcher, `Property` hands its update to it, a one-line change.

## The smallest slice

- `core/Property/Property.js` — the class above, plus `Property.Map` (decisions 7–9), with `Property.test.mjs` beside it (decision 11).
- `core/Page/Template/Template.js` — `class Template extends Page`: `render()`, `views`, `clone()`, `field()`, `show()`, `drop()`, `refresh()`.
- `core/Page/Template/BigCard/BigCard.js` — the Figma palette's big white card (mark, heading, lead, a grid of column cards), as `class BigCard extends Template`.
- `core/Page/Template/page.js` — the demo: one BigCard, two clones with different data, one field (`cost`) bound to a live Property with a button and a tick; each rendered view beside `inspect()` of its live instance; clone B rendered twice to prove `views`.
- **Measure:** views per clone, listeners on the Property before and after `drop()` (should return to 0), and the four widths.

## Coordination

- @mastermind-data-grid: table vs rail as a Template setting — asked, see STATE.md.
- @mastermind-style-system: the card word and colour schemes — BigCard takes a `scheme` later; asked.
- [layout-catalog](../layout-catalog/requirements.md): which layouts become templates next; BigCard is the first.
