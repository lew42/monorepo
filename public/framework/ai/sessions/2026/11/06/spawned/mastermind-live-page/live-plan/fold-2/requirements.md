# Fold step 2: Page takes plugins (`class Page extends Pluggable(Item)`)

Budget: $5. Load the `minion` skill first, then the `code` skill.

## Why

The owner said yes on 2026-11-09 (relayed by voice-app). The plan is at [/live/plan/fold/](/live/plan/fold/); see its card "Plugins: one system, already built". Page has three ways to add a feature today, and none of them can be switched off:

- `Page.use(Ext)`, which pushes onto `Page._ext`, run at `core/Page/Page.class.js:60` (nobody calls it today);
- `page.ext(name)` at `Page.class.js:170`, which imports `./ext/<name>/<name>.js` and runs `Ext.setup(page)`;
- a `{"ext": "Inbox"}` page.jsonl line, which reaches `ext(name)`.

`core/Plugin/Plugin.js` already does all of this with on/off, per class and per instance (`inst.plugins`, `inst.overrides`, `toggle_plugin`, `Host.make_default`). Read [core/Plugin/readme.md](/framework/core/Plugin/readme.md) and `core/Plugin/doc/design-notes.md` first.

## The change

1. **In [Plugin.js](/framework/core/Plugin/Plugin.js), add `export const Pluggable = Base => class extends Base { … }`.** A mixin is a function that takes a base class and returns a subclass, so several can stack on one base.
   - Pluggable carries only the plugin parts: the statics (`use`, `unuse`, `available`, `records`, `record`, `plugins`, `enable`, `disable`, `make_default` and the helpers they need) and the instance parts (`plugins`, `overrides`, `load_overrides`, `reset_plugins`, `toggle_plugin`).
   - `class Plugin extends Pluggable(Events(Object))` keeps today's constructor, so every existing Plugin user is unchanged (`Server/Events.js` is a subclass; find the rest with `git grep -n "core/Plugin/Plugin.js" -- public Server Servex`).
2. ⚠ **Name collisions**, as a checklist:
   - [ ] Run a node script that lists the names [Item](/framework/core/Item/Item.js) and [Page.class.js](/framework/core/Page/Page.class.js) already have (`assign`, `instantiate`, `initialize`, `bubbles`, any static `on`/`emit`). Log the overlap.
   - [ ] `Pluggable` brings none of those names.
   - [ ] Plugin's `this.constructor.emit("new", this)` is replaced by a mixin-only static `plugged(inst)`, which a host calls once per new instance.
3. **In `core/Page/Page.class.js`, write `class Page extends Pluggable(Item)`.** Where `Page._ext.forEach(...)` runs (line 60), announce the new page to the plugin system instead.
   - `Page.use(Ext)` becomes the mixin's `use`. Keep `Page._ext` as a read-only alias (a getter listing the enabled plugins) for old readers.
   - `page.ext(name)` keeps its import, then switches that plugin on **for this page only**: record it on Page as available (off class-wide), then `this.toggle_plugin(rec, true)`. The `{"ext": …}` line goes through `ext(name)` as before.
   - An `Ext` with only `setup(page)` must still work (Plugin's `runner` already accepts `setup`). Check `core/Page/ext/Inbox/Inbox.js`.

## Tests

- `core/Plugin/Plugin.test.mjs`: add a block that makes `class Host extends Pluggable(SomeBase)`, uses a plugin, checks a new instance gets it, switches it off on one instance, and checks `inst.overrides`. Assert after each call.
- A Page block (in an existing Page test, or a new lean `core/Page/Page.plugins.test.mjs`): `Page.use(X)` reaches a new page, `page.ext(name)` turns a plugin on for that page only, and `page.plugins` lists it.
- Run every test under `core/Plugin/`, `core/Page/`, `core/Item/` and `core/Task/` before and after. The same pass/fail counts are required both times (new tests aside); log both counts.

## Docs, in the same commit

- `core/Plugin/readme.md`: add `Pluggable(Base)` to the index and Use.
- `core/Page/readme.md` and the EXTENSIONS sections of `core/Page/doc/jsonl.md`: Page is pluggable, and the three hooks are now plugin rows (aliases kept). Fix the comments at `core/Page/ext/Inbox/Inbox.js:129` and `:144` if they become wrong.

## How

- Work in a worktree: `node Server/worktree-up.mjs fold-2`. Commit by exact path.
- Another worker is changing `core/Item/Item.js` and `core/Item/Store.js` in parallel (fold step 1). **Do not edit those two files.**
- Smoke-test it: `node Server/smoke.mjs <worktree>` must show no FAIL. Then load these in the worktree's own url and confirm they draw with no console error: `/live/`, `/live/plan/fold/`, `/framework/core/Page/`, `/framework/core/Plugin/`, and one page that uses the Inbox ext.
- **Do not merge.** Log the branch, the commits, both test counts and the smoke result as `log` lines on your task, then close it with `close_task` (outcome plus evidence).
- Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash, delete recursively in the main tree, or touch `core/List/` or `Servex/agents/page_tools.js` (another agent is working there).
