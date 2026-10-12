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
   - **No restructuring.** Item keeps its events; Property is opt-in, used only by Template for now. Measure (below) before using it anywhere else.

## The smallest slice

- `core/Property/Property.js` — the class above.
- `core/Page/Template/Template.js` — `class Template extends Page`: `render()`, `views`, `clone()`, `field()`, `show()`, `drop()`, `refresh()`.
- `core/Page/Template/BigCard/BigCard.js` — the Figma palette's big white card (mark, heading, lead, a grid of column cards), as `class BigCard extends Template`.
- `core/Page/Template/page.js` — the demo: one BigCard, two clones with different data, one field (`cost`) bound to a live Property with a button and a tick; each rendered view beside `inspect()` of its live instance; clone B rendered twice to prove `views`.
- **Measure:** views per clone, listeners on the Property before and after `drop()` (should return to 0), and the four widths.

## Coordination

- @mastermind-data-grid: table vs rail as a Template setting — asked, see STATE.md.
- @mastermind-style-system: the card word and colour schemes — BigCard takes a `scheme` later; asked.
- [layout-catalog](../layout-catalog/requirements.md): which layouts become templates next; BigCard is the first.
