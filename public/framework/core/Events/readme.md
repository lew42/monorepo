# Events — `on` / `off` / `emit`, a mixin everything else builds on

A mixin, not a base class: `Events(Object)` is a plain emitter, `Events(List)`
(`core/List/LiveList.js`) is a List that announces every change, and `Item`
(`core/Item/`) is `Events(Object)` plus an id, a data bag and `set(delta)`. Nothing
here is specific to any of them — it is `on`, `off`, `emit`, and one more method,
`bubbles()`, that says whether an event keeps climbing.

## Architecture

```js
const Events = Base => class extends Base {   // ✅ the ONLY mixin in core — everything else is a class
  on(event, fn), off(event, fn)               // listeners live in this._on[event], made on first on()
  emit(event, ...args)                        // my listeners, then this.parent?.emit(...) while bubbles(event)
  bubbles(event)                              // true by default; a class overrides it to be a boundary
}
Item     = Events(Object)                     // core/Item/Item.js
LiveList = Events(List)                       // core/List/LiveList.js — its parent is its owner Item
```

Because a LiveList's `parent` is the Item that owns it, one listener on a root Item hears
every change anywhere below it. That is how `Item.Store` records a whole tree with one
`"delta"` listener.

## Use

```js
import { Events } from "/framework/core/Events/Events.js";

class Thing extends Events(Object) {}

const a = new Thing(), b = new Thing();
b.parent = a;

a.on("ping", msg => console.log("heard:", msg));
b.emit("ping", "hi");   // b has no listener of its own — this reaches a anyway
```

`emit(event, ...args)` calls every listener bound here, THEN — while
`this.bubbles(event)` is true — calls `this.parent?.emit(event, ...args)` with the
exact same arguments. `bubbles()` defaults to `true`; a class overrides it to become
a boundary (`core/Page` will, so a page's own events never leak into its parent's).

## Watch out

- Listeners are plain functions in `this._on[event]`, made lazily on the first
  `on()` call — nothing allocates until something actually listens.
- `emit` calls each listener with `fn.call(this, ...args)`, so `this` inside a
  listener is whatever object the event is bubbling THROUGH at that moment, not
  necessarily the one it started on.

## More

- [`core/List/LiveList.js`](../List/LiveList.js) — the list that uses this to
  announce `add`/`remove`/`move`/`order`, plus one uniform `"delta"` event
  `Item.Store` listens for.
- [`core/Item/Item.js`](../Item/Item.js) — `Item = Events(Object)`.
