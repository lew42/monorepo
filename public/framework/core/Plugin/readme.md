# Plugin — a class that takes plugins, and the class every plugin may extend

**What goes here:** the one plugin system for the framework. **Next door:** [Events](../Events/) (instance on/off/emit, which Plugin builds on), [Item](../Item/) and [List](../List/) (what a row of `Host.plugins` is).

## Use

```js
import { Plugin } from "/framework/core/Plugin/Plugin.js";

class Badge extends Plugin {}
class Glow { static attach(badge){ badge.el.style.boxShadow = "0 0 18px currentColor"; } static detach(badge){ badge.el.style.boxShadow = ""; } }

Badge.use(Glow);                     // every NEW Badge reaches Glow.attach(badge), after its args are assigned
Badge.unuse(Glow);                   // the hook is gone; live badges are told Glow.detach(badge)
Badge.available(Glow);               // known but off: shows as a switched-off row
Badge.plugins.set({ Glow: { enabled: false } });   // the list is live; what the item tool sends works too
```

[Try it live](/framework/core/Plugin/): the page has a control panel (checkbox, open-a-row settings, sliders, a number you drag).

## Structure

- `Plugin.js` — `class Plugin extends Events(Object)`. Constructor: assign the args, `emit("new")` on the class, then `instantiate()` → `initialize()`. Static `on/off/once/clear/emit` keep class-level listeners; `"new"` walks the class chain, parents first, so a subclass reaches its parents' plugins. Static `use/unuse/available/plugins`. A plugin is anything with `static attach(instance)` (`setup` is still accepted), a plain function, and optionally `detach`, `defaults` (`on` plus config) and `fields` (what a panel draws).
- `PluginEntry.js` — one row of `Host.plugins`, an `Item` with `name`, `enabled`, `config`. `set_enabled` installs or removes the hook; `set_config` saves; `active` is false when a parent plugin is off; `row.plugins` is the plugin's own list (sub-plugins).
- `Plugin.test.mjs` — 12 tests, `node public/framework/core/Plugin/Plugin.test.mjs`.
- Saved state: `Plugin.store` (a `Map` in node; the page swaps in localStorage), key `plugin.<Host>.<Plugin>` = `{on, config}`. Only a change made through a row is saved.
- `Server/Events.js` is now a two-line subclass of `Plugin`, so the server's classes (`Server`, `Socket`, `Servex/*`) are all pluggable and keep their import.

## Watch out

- The row key is `enabled`, not `on`: `Item.set` reads a bare key that names a method (`Events.on`) as a call.
- The class-level `"new"` event now reaches parents' listeners; the old `Server/Events` reached only the exact class.
- `Page.use(Ext)` (core/Page) is the older page-only list and still works. Use `Plugin.use` for anything new.
- Item and List do **not** extend Plugin (a measured cost per `new Item`, see [doc/design-notes.md](./doc/design-notes.md)).

## More

- [doc/design-notes.md](./doc/design-notes.md) — events vs extension vs mixins, ordering, cost, debugging, names considered.
- [doc/investigation.md](./doc/investigation.md) — what existed before this, and who used it.
