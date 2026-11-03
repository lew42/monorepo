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

const b = new Badge();
b.plugins.set({ Glow: { enabled: false } });       // THIS instance only — unset follows the class row above
b.overrides;                                       // {Glow: {enabled: false}}: plain data, what a session saves
b.load_overrides({});  b.reset_plugins();           // back to the class state (a plugin whose state is unchanged is not touched)
Badge.make_default(b);                             // "Make default": b's overrides become the class defaults and are saved in Plugin.store
```

[Try it live](/framework/core/Plugin/): the page has a control panel (checkbox, open-a-row settings, sliders, a number you drag).

## Structure

- `Plugin.js` — `class Plugin extends Events(Object)`. Constructor: assign the args, `emit("new")` on the class, then `instantiate()` → `initialize()`. Static `on/off/once/clear/emit` keep class-level listeners; `"new"` walks the class chain, parents first, so a subclass reaches its parents' plugins. Static `use/unuse/available/plugins`. A plugin is anything with `static attach(instance)` (`setup` is still accepted), a plain function, and optionally `detach`, `defaults` (`on` plus config) and `fields` (what a panel draws). Every instance a plugin reaches is tracked (`rec.live`, a `WeakRef`, kept past a `disable()`) and whether it is currently attached is tracked too (`rec.attached`, through `attach_instance`/`detach_instance`) — so `enable()` re-attaches to the still-live ones (a live singleton gets the plugin back without a reload) and never attaches the same instance twice, even across a `use()` → `unuse()` → `use()` cycle on a plugin with no real `detach` to undo the first attach.
- `inst.plugins` — the same shape, per INSTANCE: one row per class-level plugin, `enabled`/`config` unset until that instance overrides them (toggling calls `Plugin#toggle_plugin`, which also remembers the instance's own wish). Unset reads the class row live (`PluginEntry.get_one` falls back to `rec.on` / `rec.config`); the row list stays live too — `Plugin.record()` adds a row to every already-read instance list when the class gains a new plugin afterwards. **An instance's own switch wins:** once an instance has switched a plugin on or off for itself, a later class-wide `enable()`/`disable()` leaves that instance alone (`Plugin.overridden`) — only instances still unset follow the class. Never saved to `Plugin.store` on its own — an instance override is not a class preference. **Config:** an instance row stores only the fields it changed; `get("config")` is the class config with those on top (so a later class change of another field shows through), and `row.own("config")` is just the override. A config change on a live instance detaches then attaches it (`Plugin.rerun_instance`), so a plugin re-reads its config in `attach` and needs no change code; a plugin with no real `detach` is left as it is. A plugin may define `static reconfigure(inst)` to be told just that (no detach, no attach) when something it holds open must not restart. A constructor arg `overrides` is loaded before the plugins attach. A class config change re-runs the live instances that did not override those fields (`reconfigure_live`).
- `inst.overrides`, `inst.load_overrides(obj)`, `inst.reset_plugins()`, `Host.make_default(inst)` — the save/restore side of the per-instance rows. `overrides` is a plain `{Name: {enabled?, config?}}` of what this instance changed (it survives JSON, so a session can store it); `load_overrides` replaces all of them (unlisted plugins go back to the class); `make_default` copies them into the class records and `Plugin.store`, clears the instance's own, and re-runs the other live instances that follow the class (one with its own override on that plugin keeps it).
- `PluginEntry.js` — one row of `Host.plugins` or `inst.plugins`, an `Item` with `name`, `enabled`, `config`. `set_enabled` installs or removes the hook (class row) or calls `toggle_plugin` (instance row); `set_config` saves (class row only); `active` is false when a parent plugin is off; `row.plugins` is the plugin's own list (sub-plugins).
- `Plugin.test.mjs` — 30 tests, `node public/framework/core/Plugin/Plugin.test.mjs`.
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
