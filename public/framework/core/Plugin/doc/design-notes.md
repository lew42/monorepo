# Plugin: design notes

## Events, extension or mixins
- **Events (what this is).** A plugin hooks a class's `"new"` event and changes the instance from outside. Adding or removing one is one `use`/`unuse`; nothing in the host's source changes.
- **Extension (subclassing).** Clear, but one chain: a class cannot take "Glow" and "Frame" independently or switch either off at run time.
- **Mixins.** Composes the same way, but is fixed when the class is written; there is no off switch and no list to show.
- Plugins never override a host method. If a plugin needs to change a method it should be a subclass, not a plugin.

## Order
Parents' plugins run before the subclass's; within one class, in `use` order. There is no `before_`/`after_` split, on purpose: none of the plugins so far (the demo, the server's sockets, the Voice Chat features) needs to run before another one or at a different point than "after the args are assigned". Order is `use` order. When a plugin really needs the earlier slot, add a second class event (`"before_new"`) emitted ahead of `"new"` in the constructor, and a `before_attach` word; nothing else changes.

## Cost (measured with a 1e6-instance loop, node 24)
- `new Item()` now: about 1.38 µs. Adding a class-level `emit("new")` walk with no listeners: about 1.75 µs (+0.37 µs, +27%). With one listener the cost is the listener.
- The owner's own line applies: a game with millions of objects should hard-code its calls, not hang them on an event. A plugin is for the few classes that really are extended from outside. Even the empty `emit("new")` walk is not free.
- Decision: Item and List do **not** extend Plugin. An Item is created in the thousands during a replay, and nothing needs a plugin on it. A class that wants plugins extends Plugin; the Item system is unchanged.
- Every attached instance is tracked (WeakRef), not only one whose plugin defines its own `detach`: `attach_instance` always adds to `rec.live`/`rec.attached`, so a class-wide `enable()` can re-attach to instances a `disable()` left tracked, and a per-instance switch has something to read. The measurement above predates this and has not been re-measured since; treat the 1e6-instance figures as the old-tracking cost, not today's.

## Debugging risk
A plugin that runs on every new instance is invisible at the call site. Use it only where a class really is extended from outside (sockets, servers, pages), not for ordinary options. `Host.plugins` and `Plugin.hosts` list what is installed.

## Which plugin system
**Current (fold-2, 2026-11-09):** `Page` is migrated. `class Page extends Pluggable(Item)` ([Page.class.js](../../Page/Page.class.js)) — `Page.use(Ext)` and `page.ext(name)` (a `{"ext": "Name"}` line) are the same `Pluggable` mechanism every other pluggable class uses, with a per-page on/off instead of only a class-wide one. `core/Page/ext/Inbox` needed no change: it only ever answers the same `setup(page)` call, however it is reached.

Before fold-2, `Page.use(Ext)` → `Ext.setup(page)` was a bespoke page-only list, global to `Page`, with no off switch and no per-instance list — kept below for history, wording unchanged: "Use `core/Plugin` (`Host.use(plugin)`, `attach`/`detach`) for anything new. `Page.use(Ext)` → `Ext.setup(page)` is the older page-only list and is left alone: it is global to `Page`, has no off switch and no list, and is still used by the page extensions (`core/Page/ext/Inbox`). Moving Page onto Plugin is a follow-up, not part of this build (a Page is an Item, which does not extend Plugin)."

## Not done
- The item tool cannot address `Host.plugins`: the list lives in memory and has no path. `.set({Glow: {enabled: false}})` in code works, and the rows are Items, so a page that mounts `Host.plugins` at a path would give the item tool a handle. Not built.
- Voice Chat moving onto core/Plugin is its own task (filed on the session).
- The investigation ran without Haiku scouts or a web search (prior art is from memory), and the "copy methods onto a prototype" utility the brief mentioned was not found.

## Choices
- Row key `enabled`, not `on` (the plan said `on`): `Item.set` treats a bare key named like a method as a call, and `on` is `Events.on`. Alternative: `Item.bare_calls = false` (a global change).
- `Page.use` is migrated (fold-2, 2026-11-09): see "Which plugin system".
- Names considered: `Plugin` (kept, the owner's), `Extension`, `Addon`.
