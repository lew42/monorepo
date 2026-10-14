# Events architecture — one mixin, `on` / `off` / `emit`, and a parent chain

Events is a small mixin, not a base class: `Events(Base)` returns a subclass that adds `on`, `off` and `emit`. Anything that wants to announce its changes extends it. Entry: [`Events.js`](./../Events.js).

## One mixin, not a base class

**Decided:** `Events` is a function that wraps a base class (`Events(Object)`); there is no `EventEmitter` class to inherit from.
**Why:** core classes already extend `Item`, `Property`, or `Object`; a mixin lets any class gain events without giving up its own parent.
**Instead:** a base `Emitter` class would force a single inheritance chain on every data class.
**Detail:** [`Events.js`](./../Events.js) (the whole mixin, about 30 lines)

## Listeners live in a lazy map

**Decided:** listeners sit in `this._on[event]`, an array per event name, created on the first `on()`.
**Why:** most objects never listen to anything; an eager map per instance would allocate for every item in a large tree.
**Instead:** a `Map` created in the constructor, which every subclass would have to call `super()` for.
**Detail:** [`Events.js`](./../Events.js) `on()`

## Events bubble up a `parent` chain

**Decided:** `emit(event, ...args)` calls this object's listeners, then calls `this.parent?.emit(event, ...args)` with the same name and arguments, while `this.bubbles(event)` is true.
**Why:** a List's `parent` is the Item that owns it, so one listener on a root Item hears every change below it. That is how `Item.Store` records a whole tree with one `"delta"` listener.
**Instead:** each child re-emitting to its owner by hand, which every owner would have to wire.
**Detail:** [`core/List/List.js`](../../List/List.js) (the `"delta"` event)

## `bubbles()` is the boundary hook

**Decided:** `bubbles(event)` returns `true` by default; a class overrides it to stop an event at itself.
**Why:** a boundary must be possible without changing `emit` itself.
**Instead:** a `stopPropagation` flag set per event, which would need clearing and has no owner.
**Detail:** [`Events.js`](./../Events.js) `bubbles()`

⚠ **Code mismatch:** the readme and the `Events.js` comment say `core/Page` overrides `bubbles()` so a page's events stop at the page. No class in `public/framework` overrides it today, so events from a page do reach its parent. The mixin behaves as described; the page boundary described in the readme does not exist yet.

⚠ **Code mismatch:** the readme says `List = Events(Object)` directly. In code `List extends Item` (`core/List/List.js`), and `Item` is `Events(Object)`. The event behaviour is the same; the inheritance line in the readme is wrong.

## Listeners are called with the emitting object as `this`

**Decided:** each listener runs as `fn.call(this, ...args)`, where `this` is the object the event is bubbling through at that moment.
**Why:** `this` must match the callback's contract; it is not the object that first emitted.
**Instead:** always binding to the origin object, which would break a listener that wants to know where it sits in the tree.
**Detail:** [`Events.js`](./../Events.js) `emit()`

## Detail

- [`readme.md`](../readme.md) — what the mixin is and its use.
- [`core/Item/Item.js`](../../Item/Item.js) — `Item = Events(Object)` plus id, data and `set(delta)`.
- [`core/Property/Property.js`](../../Property/Property.js) — `Property extends Events(Object)`.
