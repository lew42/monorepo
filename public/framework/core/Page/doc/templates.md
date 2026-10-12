# Templates — one layout, rendered many times, bound to live data

A **template** is a page that knows one layout and can draw it as many times as you like, each time with its own data. Instead of hand-building another preview with filler text, you take a template and hand it your values.

```js
import { BigCard } from "/framework/core/Page/Template/BigCard/BigCard.js";
import { Property } from "/framework/core/Property/Property.js";

const cost = new Property("$0.00");
const card = new BigCard().clone({ heading: "Spend", lead: "Live from the log.", cost });
card.render();          // a view; render() again for a second view
cost.set("$1.25");      // every view of this card updates, no rerender
```

Live demo: [Templates](/framework/core/Page/Template/). Plan and decisions: [plan.md](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/plan.md).

## The classes

| Class | File | Job |
|---|---|---|
| `Property extends Events(Object)` | `core/Property/Property.js` | One live value: `get()`, `set(v)`, a `change` event, `bind(fn)` that returns its own unbind. Never bubbles. |
| `Template extends Page` | `core/Page/Template/Template.js` | A page that renders many times: `views`, `clone(data)`, `show(name)`, `set` / `unset`, `drop(view)`, `refresh()`. |
| `BigCard extends Template` | `core/Page/Template/BigCard/BigCard.js` | The first template: the Figma palette's big white card — a mark, a heading, a lead line and a grid of column cards. |

What composes what: a template's `map` holds plain values (`data`) and `Property` objects (`props`) side by side. A view holds the unbind functions of the Properties it drew.

## Extend or clone

- **Extend** to make a new kind of layout: `class Pricing extends Template { draw(){ … } }`.
- **Clone** to use a layout with your own data: `template.clone({ title: "x", cost: prop })`. A clone is `Object.create(template)`; it reads the template's filler until you give it its own value.
- **What a clone owns** (so nothing leaks between linked objects): its event listeners (`_on`), its `views`, and its `map`, a `Property.Map` layered on the template's — reads fall through to the template, writes stay on the clone. The template lists its `clones`.

## The binding flow

1. `clone({ cost: prop })` fills the clone's own map layer. A `Property` goes in `props`, a plain value in `data`; both maps fall through to the layer below (`Property.Map`).
2. `render()` calls `draw()`; `draw()` asks `this.show("cost")`.
3. `show()` asks the map for the field's Property (`prop(name)`, made lazily on the layer that owns the value), draws a span and binds it; the unbind is filed on the view being drawn.
4. `prop.set("$1.25")` emits `change`; every bound span, in every view of every clone that reads through to it, updates its own text. Nothing else redraws.
5. `clone.set("cost", v)` on a value the clone inherits as a Property makes a new own Property (a "rebind") and redraws that clone's views; it never sets the parent's. A plain value is written and redrawn (`refresh()`), also in clones that inherit it. `unset(name)` deletes the clone's own key, so reads fall back, and redraws.
6. `drop(view)` runs the view's unbinds and removes it, so the listener count goes back down.

## Why Property and not Item's events

Item emits one `change` for every key, so a view of one field wakes on all of them; listeners are never removed when a view goes away; and Events bubble to the parent by default. A Property wakes only the views of its own value, each binding carries its own unbind, and it never bubbles. Item is unchanged: Property is opt-in.

## Watch out

- A template's own `render()` never caches: each call is a new view. Code that wants one view keeps the one it got.
- Never `Object.create` a template by hand: `clone()` is what gives the copy its own listeners, views and data.
