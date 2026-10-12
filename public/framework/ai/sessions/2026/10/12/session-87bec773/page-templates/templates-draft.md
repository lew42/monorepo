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
| `Template extends Page` | `core/Page/Template/Template.js` | A page that renders many times: `views`, `clone(data)`, `field(name)`, `show(name)`, `drop(view)`, `refresh()`. |
| `BigCard extends Template` | `core/Page/Template/BigCard/BigCard.js` | The first template: the Figma palette's big white card — a mark, a heading, a lead line and a grid of column cards. |

What composes what: a template's `data` holds plain values and `Property` objects side by side. A view holds the unbind functions of the Properties it drew.

## Extend or clone

- **Extend** to make a new kind of layout: `class Pricing extends Template { draw(){ … } }`.
- **Clone** to use a layout with your own data: `template.clone({ title: "x", cost: prop })`. A clone is `Object.create(template)`; it reads the template's filler until you give it its own value.
- **What a clone owns** (so nothing leaks between linked objects): its event listeners (`_on`), its `views`, and its `data`, which is `Object.create(template.data)` — reads fall through to the template, writes stay on the clone. The template lists its `clones`.

## The binding flow

1. `clone({ cost: prop })` stores the Property in the clone's `data`.
2. `render()` calls the subclass's `draw()`; `draw()` asks `this.show("cost")`.
3. `show()` sees a Property, draws a text span, and calls `prop.bind(...)`; the unbind is filed on the view being drawn.
4. `prop.set("$1.25")` emits `change`; every bound span (in every view) updates its own text. Nothing else redraws.
5. A static value changed with `clone.set({ heading: "…" })` redraws that clone's views (`refresh()`), since a plain value has nobody listening.
6. `drop(view)` runs the view's unbinds and removes it from `views`, so the Property's listener count goes back down.

## Why Property and not Item's events

Item emits one `change` for every key, so a view of one field wakes on all of them; listeners are never removed when a view goes away; and Events bubble to the parent by default. A Property wakes only the views of its own value, each binding carries its own unbind, and it never bubbles. Item is unchanged: Property is opt-in.

## Watch out

- A template's own `render()` never caches: each call is a new view. Code that wants one view keeps the one it got.
- Never `Object.create` a template by hand: `clone()` is what gives the copy its own listeners, views and data.
