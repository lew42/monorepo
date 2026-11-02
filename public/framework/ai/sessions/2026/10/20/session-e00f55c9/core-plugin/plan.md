# core/Plugin: plan

Brief: [requirements.md](requirements.md). Findings: [investigation.md](investigation.md). Budget about $15 in total.

## Core API first (the part to approve)

You keep your own API: `A.use(B, C…)`, new instances reach each plugin through the class's `"new"` event. Three additions: `unuse`, `A.plugins`, and one clearer word for `setup`.

```js
// core/Events/Events.js (the mixin stays the one implementation of instance on/off/emit/bubbles)
Events(Base)        // + once(), clear(), on/off already return this

// core/Plugin/Plugin.js
class Plugin extends Events(Object) {
  // ── a class that is PLUGGABLE (anything that extends Plugin, incl. Plugin itself)
  static use(...plugins)      // A.use(B, C): install each, return A. Safe to call twice (same plugin = no-op).
  static unuse(...plugins)    // remove its hooks; live instances are told detach(instance)
  static available(P, opts)   // register P as known but OFF (shows as a switched-off row)
  static get plugins()        // lazy List of entries: costs nothing until read
  static emit("new", inst)    // fired by the constructor, walks the class chain (see Step 2)

  // ── a class that IS a plugin
  static attach(instance)     // was setup(instance): "this plugin attaches to that instance"
  static detach(instance)     // undo of attach; safe before attach
  static defaults = { on: true }   // saved config defaults
  static fields = []          // [{key,label,kind:"toggle|slider|number|text", min,max,step, section}] drives the panel
}

// one row of A.plugins (a core/Item inside a core/List)
class PluginEntry extends Item {   // id, name, on, config, plugins (a List: sub-plugins nest)
  set_on(v)                        // true → A.use(P); false → A.unuse(P). The hooks and the row move together.
}
```

**`setup` → `attach`/`detach`.** The pair reads in one direction (the plugin attaches to the instance) and gives off its mirror. `setup` stays as an accepted alias, so about 30 `Server/plugins/*.js` keep working unchanged; they move over file by file later.

**An entry keeps the exact function it hooked** (the bound `attach`), so `off` finds it. Today's `use()` throws that away.

**Plain function plugins** still work: `A.use(inst => …)` is a plugin with no off (a function has no name to list).

## Files

| File | Change |
|---|---|
| `core/Events/Events.js` | add `once`, `clear`; keep lazy `_on`, chainable returns, `bubbles` |
| `core/Plugin/Plugin.js` | new: class above |
| `core/Plugin/PluginEntry.js` | new: the list row |
| `core/Plugin/Plugin.test.mjs` | new: one lean test (under 1 s) |
| `core/Plugin/readme.md`, `page.js` | new: index + demo page |
| `core/Plugin/doc/design-notes.md`, `doc/investigation.md` | new (item 7 of the brief; the investigation moves in) |
| `Server/Events.js` | becomes a thin `extends Plugin` shim that keeps the server-only constructor work (`assign(...args)`, then `instantiate()` → `initialize()`) so the 17 importers change nothing; repointing them is a later cleanup |
| `Server/readme.md` | one line: the server imports `public/framework/core/Plugin`; if the server becomes its own package, Plugin moves with it |
| `core/Page/Page.class.js:36-50, 152` | NOT touched in this build (see "Improved") |
| `core/readme.md`, `framework/readme.md` | index lines |

Not touched: `Server/plugins/` otherwise, Voice Chat (separate follow-up).

## Steps (each checkable, one commit each, in a worktree)

1. **Measure first (no code merged).** A node script times 1e6 `new Item()` with and without a class-level `emit("new")`. Output goes in `doc/design-notes.md`. *Check:* the script prints both numbers. *Decides item 4:* Item/List extend Plugin only if the extra cost is a few percent and Plugin is a couple of short methods. The default is NO, with the number written down.
2. **Events:** add `once/clear`; add `Plugin` with static events that walk the class chain (a subclass instance reaches its parents' `"new"` listeners, **a behaviour change**: list affected classes first with `grep "extends (Socket|SocketServer|Server)"`). *Check:* `Plugin.test.mjs`: use, unuse, attach on new, detach on off, subclass reaches parent plugin, plugin `off` while an instance is live.
3. **Server:** repoint `Server/Events.js`. *Check:* run all `Server/*.test.mjs`, start the dev server in the worktree, load `/framework/`, and both sockets (LiveReload, Files) still work. Restart of the real server is done by vscode-mastermind after the merge.
4. **`A.plugins` List + config:** lazy getter, `PluginEntry`, `available()`, saved config (one `Property`/`Item` store per class, key `plugin.<Class>.<name>`), nested plugins. *Check:* test: toggle through the item tool (`item({path, delta:{on:false}})`) removes the hook; toggle on re-installs; sub-plugin off follows its parent off.
5. **Demo page** (the look, below). Reuse first: `ui/accordion` (twirl-down), `ui/section` (groups), `ui/field`, `ui/controls`, the sliders in `ext/Panel/properties.js`, `ui/scale`. Only the scrub-number input is likely new (pointer-drag horizontally changes the value; also keyboard arrows). *Check:* the headless browser shots at 400, 1200, 1920, 3440; no console errors; toggling a checkbox changes the live preview.
6. **Design-notes doc** (brief item 7): events vs extension vs mixins; no method override; `before_<name>` / `after_<name>` ordering; performance; debugging risks; use plugins only where needed.
7. **Index everything:** readmes, `core/readme.md`, `framework/readme.md`, session record (`Server/ReadmeOrphans.mjs` prints nothing for core/Plugin).

## The look (approve this first)

No screenshot yet: nothing is built, and a made-up one would be a claim. The wireframe below is the contract; Step 5's first commit is a real screenshot of it, before the rest of the page is built.

```
┌ Plugin ────────────────────────────────────────────┐
│ ```js  Socket.use(Highlight, ThinkingCue)  ```      │  ← code snippet
├────────────────────────────────────────────────────┤
│ Control panel (live)                                │
│ ☑ ▸ Highlight                                       │
│     ┌ Appearance ──────────────┐                    │
│     │ Opacity  ──●────── 0.6   │  slider            │
│     │ Delay    ‹ 250 ms ›      │  scrub: drag/swipe │
│     └──────────────────────────┘                    │
│ ☐ ▸ ThinkingCue   (off: not installed)              │
│ ☑ ▾ Tap to pause                                    │
│       ☑ ▸ sub-plugin                                │
├────────────────────────────────────────────────────┤
│ Result: preview that reacts to the switches         │
└────────────────────────────────────────────────────┘
```
Mobile (400): same list, one column; rows ≥44 px tall; the scrub field uses the whole row width as its drag area. Desktop: panel left, snippet and result right.

## Proof that it works
- `node public/framework/core/Plugin/Plugin.test.mjs` passes; all `Server/*.test.mjs` pass before and after.
- Measured Item cost in `doc/design-notes.md`.
- Dev server loads the site and sockets in the worktree; shots at four widths linked from the readme.
- The page works by touch (headless run with a touch-emulated drag on the scrub field).
- The Plugin page also lists the live plugin-using classes and their `plugins` (the rule: show the class and its live instances); the demo panel is that list.

## Improved (the improve-plan step, 2026-11-02)
1. **Dropped the `Page.use` migration.** The plan said `Page.use` becomes the inherited `use`, but Page is an Item, and Item extends only `Events(Object)`; Step 1 defaults to "Item does not extend Plugin", so Page would have no `use` to inherit. Also `Page.class.js:152` loads `{"ext": ...}` from `page.jsonl` and calls `Ext.setup?.(page)` per page, a second path the plan missed. `Page.use(` has no callers outside comments (grep). Not needed by the brief; revisit only if Step 1 says Item may extend Plugin.
2. **The `Server/Events.js` shim must keep `assign`/`instantiate`/`initialize`**, the constructor behaviour the 17 importers rely on; the investigation noted them, the plan's "thin shim" did not. Deleting and repointing is deferred.
3. **Added the live-instances proof** (the brief's standing rule: a page shows the class and its live instances).
4. No steps removed: the plan is already the smallest path to the brief's items; PluginEntry and nesting are asked for.

## Does the plan cover your words? (brief, item by item)
1. One Events class, not two, merged in `public/`, written in the Server readme → **yes**: mixin stays the one implementation; `Server/Events.js` becomes a shim or goes; Server readme line. *Caveat:* it ends as the mixin plus Plugin, not literally one class (see investigation).
2. `class Plugin` extends Events, `A.use(B, C…)`, `"new"` event, clearer than `setup` → **yes**: `attach`/`detach`, `setup` kept as alias.
3. Lazy `A.plugins` List, off un-uses and on re-installs, `available()` shows off, per-plugin saved config, nesting, item-tool config → **yes**: Steps 4.
4. Maybe Item/List extend Plugin, measure first → **yes**: Step 1 decides, default no.
5. Server plugins use core Plugin, `Server/plugins/` otherwise stays → **yes**: through the alias, no edits there.
6. Demo with snippet, live panel, checkbox, expandos, sliders, scrubbable numbers, sections, mobile; check existing controls first → **yes**: Step 5 lists what to reuse first.
7. Design-notes doc, all six points → **yes**: Step 6.
8. Voice Chat port is a separate follow-up → **yes**, not in this build.

## Risks and the alternative chosen
- Subclass "new" propagation changes server behaviour: Step 2 lists the classes first. Alternative: keep exact-class-only and add `inherit: true`; chosen: propagate, because exact-only is a bug.
- Page is left alone (see "Improved"); migrating it waits on the Item-extends-Plugin decision.
- Scrub input is the only likely new control; if `ui/controls` has one, reuse.
- `Server restart` after the merge: vscode-mastermind.
