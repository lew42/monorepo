# core/Plugin: one plugin system for every class, with a toggle-and-configure UI

Run as a **build process** (`core/Task/processes/BuildProcess.js`): investigate → plan → improve the plan → approve → execute → index → review → merge. The point of running it this way is to try the planning process the owner asked for.

**The owner (2026-11-02, about 14:50, dictated; verbatim in the tab's prompt log; essence below).**

## What exists (each one checked in the code)
- **`Server/Events.js`.** It has per-instance `on/off/emit` and a class-level (static) event set. `static use(plugin)` hooks the class's `"new"` event: a plain function is called for each new instance, or else the plugin's `setup(instance)` is.
- **`public/framework/core/Events/Events.js`.** The client framework's own Events: per-instance `on/off/emit/bubbles`. It is similar to the server's, but not the same.
- **`core/Page/Page.class.js:39`.** It has `Page.use(Ext)` → `Ext.setup(page)`.
- **A mixin utility.** It copies one class's methods onto another's prototype (in the framework; find it).
- **`mastermind-dictate-plugins`'s plan** for Voice Chat, now paused: [../dictate-plugins/plan.md](../dictate-plugins/plan.md). It has a census of all 29 settings, the 5 features with no switch, and what Voice Chat needs.

## What the owner wants
1. **One Events class, not two.**
   - Merge `Server/Events.js` into `core/Events/Events.js`. The client needs it, so it lives in `public/`, and the server imports it from there.
   - Write that dependency down in the Server readme. If the server ever moves to its own package, Events moves with it.
2. **`class Plugin`, in `core/Plugin/`.** The owner first said "Pluggable", then settled on **Plugin**: "it's both a plugin and it's pluggable".
   - It extends Events, and keeps the owner's API: `A.use(B, C…)`, where a class uses one or more plugin classes.
   - New instances are tracked through the class's `"new"` event, and each plugin gets the new instance.
   - **Lean on that API, don't invent a better one.** The one thing to rethink is `setup`'s name. It is "left hand, right hand: who's setting up who?" Propose a clearer word, or keep it and say why.
3. **A plugins List beside the hooks.**
   - `A.plugins` is a lazy getter, so it costs nothing until it's read. It's a `List` (core/Item), kept in step with the hooks.
   - Turning a plugin off un-uses it: it removes itself, its hooks come off, and live instances let go of it. Turning it back on re-installs it.
   - A plugin class can register itself as available before it's on, so the list shows it switched off.
   - Each plugin has its own saved config. Plugins can nest (sub-plugins).
   - An agent can configure it all through the item tool, since it's a List.
4. **Maybe Item and List extend Plugin.** Only if Plugin really is "a couple of short methods". Measure the cost per instance before you decide.
5. **The server's plugins use core Plugin,** so there's one system. `Server/plugins/` stays as it is otherwise.
6. **A demo on the Plugin page:**
   - a code snippet, with a live preview of its control panel;
   - a checkbox per plugin to turn it on and off;
   - expandos that twirl down to each plugin's settings;
   - fields: sliders, numeric inputs you can scrub (drag or swipe to change), and sections that group fields;
   - mobile-friendly.

   Check what UI controls the framework already has before you build any.
7. **A design-notes doc** in `core/Plugin/doc/`:
   - **Events versus extension versus mixins.** Extension is a single chain, so many small toggles don't fit it.
   - **Plugins never override methods,** because two plugins would collide. They hook events instead.
   - **Ordering:** add `before_<name>` / `after_<name>` hooks where needed, not numeric priorities ("a management nightmare").
   - **Performance:** plugins are for prototyping and configurable systems, not hot paths. They're only paid on `"new"`, but a game with millions of objects should hard-code its calls.
   - **The debugging risks** of event-driven code.
   - **Use plugins only where they're needed,** not everywhere: no full surgery to make every base class work stripped down.
8. **Then Voice Chat:** its gear-panel features become Plugin users. That is the paused dictate-plugins plan, ported onto core/Plugin; it's a separate follow-up task, not this build.

## How to run each step (the owner's process)
- **Investigate in passes.**
  - Pass 1 maps what's there: who uses each Events and each `use()`, and whether it works.
  - Pass 2 chases only the most useful leads.
  - Search the web for prior art (plugin and hook systems, the tapable/before-after pattern), and list alternative names.
  - Use **Haiku scouts** for the reading (the week is at 83% of pace). Keep each one under 60k tokens, and give it file paths, not pasted code.
- **Write findings into the module's own docs** (`core/Plugin/doc/*.md`, linked from `core/Plugin/readme.md`), not into chat. Agents pass each other file and line references, never pasted code.
- **The plan** names the core API first. The owner approves it by reading `plan.md`. vscode-mastermind is the creator and approves on the owner's behalf, unless the owner speaks first.

**Fences:** worktree, commit by path; no `python -`. Never edit `Server/Events.js` callers without running the server's tests. The server needs a restart after the merge; vscode-mastermind does it. **Budget:** about $15 across all steps.
