# Plugin: design notes

## Events, extension or mixins
- **Events (what this is).** A plugin hooks a class's `"new"` event and changes the instance from outside. Adding or removing one is one `use`/`unuse`; nothing in the host's source changes.
- **Extension (subclassing).** Clear, but one chain: a class cannot take "Glow" and "Frame" independently or switch either off at run time.
- **Mixins.** Composes the same way, but is fixed when the class is written; there is no off switch and no list to show.
- Plugins never override a host method. If a plugin needs to change a method it should be a subclass, not a plugin.

## Order
Parents' plugins run before the subclass's; within one class, in `use` order. There is no `before_`/`after_` split: one `attach`, run after the constructor assigned its args and before `initialize()`.

## Cost (measured with a 1e6-instance loop, node 24)
- `new Item()` now: about 1.38 µs. Adding a class-level `emit("new")` walk with no listeners: about 1.75 µs (+0.37 µs, +27%). With one listener the cost is the listener.
- Decision: Item and List do **not** extend Plugin. An Item is created in the thousands during a replay, and nothing needs a plugin on it. A class that wants plugins extends Plugin; the Item system is unchanged.
- Live instances are tracked (WeakRef) only for a plugin that defines its own `detach`, so a plugin with no undo costs nothing per instance.

## Debugging risk
A plugin that runs on every new instance is invisible at the call site. Use it only where a class really is extended from outside (sockets, servers, pages), not for ordinary options. `Host.plugins` and `Plugin.hosts` list what is installed.

## Choices
- Row key `enabled`, not `on` (the plan said `on`): `Item.set` treats a bare key named like a method as a call, and `on` is `Events.on`. Alternative: `Item.bare_calls = false` (a global change).
- `Page.use` is not migrated (the plan's Improved section): no callers.
- Names considered: `Plugin` (kept, the owner's), `Extension`, `Addon`.
