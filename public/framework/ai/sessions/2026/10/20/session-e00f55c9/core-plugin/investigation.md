# core/Plugin: investigation (pass 1, 2026-11-02)

Brief: [requirements.md](requirements.md). Marks: **checked** = read in the code this pass; **guess** = not verified.
Pass 1 was done by the investigator reading the files directly (about 10 small files); no scouts were needed. Pass 2 leads are at the end.

## Ranked questions

1. **Can the two Events become one class?** They are not the same kind of thing (see below). This decides everything else.
2. **Does Item/List extending Plugin cost anything?** Item already `extends Events(Object)`, so the answer depends on question 1.
3. **What replaces `setup(instance)`?** (left hand / right hand naming)
4. **Where does `A.plugins` (a List) get its state, and how does off un-use?** `Server/Events.js` keeps no record of what was used: `use()` only calls `on("new", fn.bind(...))` and returns, so there is nothing to remove.
5. **Which UI controls exist for the demo?**

## What exists

### Server/Events.js: a base class (checked, 114 lines)
- `class Events`: constructor sets `this.events = {}`, `assign(...args)`, emits the static `"new"` with the instance, then `instantiate()` → `initialize()`.
- Instance `on/off/once/emit/clear`; static copies of the same, on a per-class `_events` (`Object.hasOwn`, so each subclass has its own).
- **Bug (checked):** `static emit` runs only `this.events["new"]` of the exact class. A subclass's `"new"` does not reach a parent's listeners. The code comment says "this isn't inheritance friendly". So `Socket.use(X)` fires only for `Socket` itself, not for subclasses.
- `static use(plugin)`: a plain arrow function → `on("new", fn)`; else an object/class with `setup` → `on("new", plugin.setup.bind(plugin))`; else a console warning. Returns the class, so it chains. It can take only one plugin per call.
- `static setup(instance)` default only logs.
- Users (checked): 17 files import it (Server.js, three SocketServer files, and 13 files in `Servex/`). Static `.use(` callers: `Server/run.js:39-49` (`DevSocket.Socket.use(Runtime, Ask, CardAnswer, Start, Tab, AISessionSub, QueryServer, Tail, Append, Files, DatedFiles)`), `DevSocket.js:6` (`DevSocket.use(LiveReload)`), two `Files*.test.mjs`. About 30 `Server/plugins/*.js` classes define `static setup(server|socket)`, usually `new X(server)`.

### core/Events/Events.js: a mixin function (checked, 32 lines)
- `Events = (Base = Object) => class extends Base`: `on/off/emit/bubbles`, listeners in lazy `this._on`. `emit` bubbles to `this.parent` while `bubbles(event)`. No `once`, no `clear`, no static events, no `"new"`.
- Users (checked): `Item extends Events(Object)` (`Item.js:69`), so List and Page and Task all inherit it; `Outbox.js`, `Property.js`; `lab/LiveView`.
- Readme says `Events(Object)` is a plain emitter (`core/Events/readme.md:6-15`).

### Page.use (checked, `Page.class.js:36-37, 45`)
- `static _ext = []; static use(Ext){ Page._ext.push(Ext); return Page; }`, and the constructor runs `Page._ext.forEach(Ext => Ext.setup?.(this))`. It is one global list on `Page`, not per class, and it has no off. Comment says nobody calls it by default (**guess**: no callers; a grep for `Page.use(` was not run).

### A mixin utility (the brief says "find it")
- Not found in the first pass. `Events` itself is the framework's mixin pattern (`Base => class extends Base`). **guess**: the "copy methods onto a prototype" utility is in `util/` or `research/` code only. Pass 2.

### UI controls (partly checked)
- `ui/controls/` (readme, `controls.css`, `study/`, `doc/`), `ui/field/`, `ui/scale/scale.js`, `ui/accordion`, `ui/section` all exist. `ext/Panel/properties.js` already builds property rows with `dropdown`, and the `ext/Panel` toolbar has sliders (grep hits for "slider|scrub" in 12 files: `ext/Panel/*`, `ext/layout/*`, `ext/depth/depth.js`, `ui/words/page.js`). No scrubbable number input confirmed. **guess**: Panel's properties region is the closest thing to reuse; the plugin panel should borrow its row shape rather than build a new one.
- The Voice Chat gear panel (`ux/Dictate/VoiceChat/Features.js` on the paused branch) already renders toggles per plugin from `static fields`. It is the first thing to generalize.

### Paused dictate-plugins plan (checked, [../dictate-plugins/plan.md](../dictate-plugins/plan.md))
Seven needs from core/Plugin: hosts that do not import the registry; live `stop()` undoing `start()`; `static defaults` (with `on`) and `static fields`; one saved store plus a not-saved override (URL param); fit inside an existing panel; an off plugin still gets one `stop()` when its host arrives; wrapping existing classes with `start()/stop()` is enough.

## The central finding: the two Events do not merge cleanly

| | Server/Events.js | core/Events/Events.js |
|---|---|---|
| Shape | base class | `Events(Base)` mixin |
| Static class events | yes (`"new"`) | none |
| `once`, `clear` | yes | no |
| Bubbling to `.parent` | no | yes |
| Listener store | `this.events = {}` made in the constructor | `this._on`, lazy |
| Return value of `on/off` | undefined | `this` (chainable) |

A server class `extends Events` and needs the constructor's `"new"` emit. Item needs the mixin form with a lazy store, because it extends other bases and is created in large numbers. Forcing one shape means either the client class gets a constructor (a cost for every Item) or the server loses the `"new"` emit.

**Proposed shape (guess, to test in the plan):** keep the mixin as the one implementation of instance `on/off/emit/bubbles`, add `once/clear` and chainable returns, and move the static class events plus `use()` into a second small mixin or into `Plugin` itself. Then `Server/Events.js` becomes `export default class Events extends Plugin(Object)`-style shim (or is deleted, with the 17 importers pointed at core). The server imports from `public/framework/core/`, which the brief accepts; write it in `Server/readme.md`.

## Class sketches (guess, for the plan to settle)

```
Events(Base)                         // core/Events: on/off/once/clear/emit/bubbles, lazy _on
class Plugin extends Events(Object)  // core/Plugin
  static use(...P)                   // A.use(B, C): installs each; returns A
  static unuse(P)                    // removes hooks; live instances let go
  static get plugins()               // lazy List (core/List), one entry per plugin, with .on
  static available(P)                // register a plugin class as known but off
  static defaults / fields           // config, from the dictate plan
  attach(instance)  ← renamed setup? // called per new instance
  detach(instance)                   // undo of attach
```
- Entry in `plugins`: an Item with `id`, `on`, `config`, and child `plugins` (sub-plugins nest because an entry may itself be a host).
- Reuse `core/List` + `core/Item` for the plugins list: the item tool then configures it for free (**guess**; the item tool walks `item({path, delta})` into children).
- Item/List extending Plugin: Item already carries Events; Plugin would add static `_events`/`_plugins` fields on the class (not per instance) and a `"new"` emit in the constructor. The per-instance cost is one `emit` call that does a lookup on the class; **measure, do not guess** (plan step: node script creating 1e6 Items with and without).

## Names for `setup` (the owner asked for one)
Options: `attach(instance)` / `detach(instance)` (the plugin attaches to the instance; pairs with live off); `install(instance)`; `plug(instance)` / `unplug(instance)`; `apply`; `init`. Prior art: webpack/tapable `apply(compiler)`, Vue `install(app)`, Fastify `register`, Express `use`, Vite `configureServer`, Rollup `buildStart` hooks. **Recommendation:** `attach` / `detach`, keep `setup` as an accepted alias so the ~30 server plugins do not all change at once. (A server plugin's `static setup(server)` also receives a *host* instance, so "setup(host)" is not wrong, just ambiguous about direction.)

## Prior art (not searched on the web this pass; from memory, **guess**)
- tapable (webpack): hooks as named objects, `before`/`stage` options, sync/async/bail/waterfall variants. The `before_<name>` / `after_<name>` idea in the brief is what Webpack calls `before`.
- Fastify plugin encapsulation: nested contexts, the model for sub-plugins.
- Vue `app.use(plugin)`: one call, `install`, deduped by identity. Closest match to `A.use(B, C)`.
- Eclipse/VS Code activation events: plugins that register available but off.
Pass 2: one WebSearch to confirm tapable's `before` option and Vue's dedupe; then cite.

## Risks
1. **Inheritance of `"new"`:** today a subclass of `Socket` does not run `Socket.use(...)` plugins. Fixing it changes behavior for any server class with subclasses. Run the server tests (`Server/*.test.mjs`) and note which classes are subclassed (**guess**: `Socket` ← `DevSocket.Socket`).
2. **Restart needed:** the server must restart after the merge (brief says vscode-mastermind does it).
3. **Double fire:** `Page._ext` and `Page.use` coexist with a new `Plugin.use`; `Page.use` must become the same call or be removed.
4. **Event debugging:** a hook that throws inside `"new"` aborts construction; decide whether `emit` isolates errors.
5. **Cost on Item:** every Item and List is created in volume; adding any work to the constructor must be measured.
6. **`on/off` return values differ** (undefined vs `this`); chaining is only additive, so safe.
7. **Un-use of bound functions:** `Server/Events.js` binds, so `off` cannot find the listener. Plugin must keep the exact bound function per entry.

## Pass 2 leads (most useful first)
1. Measure the Item constructor cost with a `"new"` emit (node script, 1e6 Items).
2. Find which server classes are subclassed (`grep "extends (Socket|SocketServer|Server)"`) to scope the inheritance change.
3. Read `ux/Dictate/VoiceChat/Features.js` on the `worktree/dictate-plugins` branch: it is a working toggle-and-config UI to generalize.
4. Read `ui/controls/readme.md` and `ext/Panel/properties.js` for a slider or scrub row to reuse.
5. One web search for prior art; list alternative names in the design-notes doc.
6. Find the "mixin utility" the brief mentions (not in the first sweep).

Lasting findings belong in `core/Plugin/doc/` once the plan makes the folder: this file moves there as `doc/investigation.md` at execute, linked from `core/Plugin/readme.md`.
