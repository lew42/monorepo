# Plugins demo — a page is a tree of plugins, toggleable

**What it shows:** [/live/demos/plugins/](/live/demos/plugins/) is the MVP for the owner's idea ([/live/plan/plugins/](/live/plan/plugins/)): "every page is just a collection of plugins, and plugins can have plugins… a tree of plugins… toggleable." One box (`DemoPage`, a [core/Plugin](/framework/core/Plugin/) host) with three plugins; a tree panel beside it with a checkbox per plugin, nested for a plugin's own plugin. A switch is saved, so it survives a reload.

## Files

- `DemoPage.js` — `class DemoPage extends Plugin`, the host. Its one box element (`inst.el`) is what the plugins change.
- `Border.js`, `Wide.js` — plain plugins: `static attach(inst)` / `static detach(inst)` on the box.
- `Badge.js` — a plugin that is **also** pluggable (`Badge.use(Count)`, a plugin of a plugin). `Badge.attach(inst)` draws the badge element, then makes a real `new Badge({el})` to hold it, so Badge's own plugins attach the normal way.
- `Count.js` — Badge's own plugin: writes a number onto the badge.
- `page.js` — the page: the box, the tree panel (one row per `demo.plugins`, nested rows from `row.plugins`), a Reset button, and the "what you just did" code block.
- `page.jsonl` — **not** a routing file (this page is a `page.js` page): one plain data file, the single source of truth for the saved switch. One line, `{"overrides": {...}}`, the plain object `demo.overrides` gives.
- `DemoPage.test.mjs` — the core test (`node public/live/demos/plugins/DemoPage.test.mjs`).

## How the switch is saved

A checkbox calls `row.set({enabled})`, which flips the plugin on the live box; then the page calls `RecordWriter.post(FILE_URL, {lines: [{overrides: demo.overrides}]})` (`core/Item/RecordWriter.js`) to append one line to this page's own `page.jsonl`. On load, `page.js` reads that file (`JSONL`, `ext/JSONL/JSONL.js`) for the last `overrides` line and passes it to `new DemoPage({overrides})` before the first draw. The same file is kept live (`jsonl.live(...)`): a line the item tool writes there reaches every open tab too, so it redraws with no reload.

## Watch out

- `Badge` is a plugin of `DemoPage` AND a `Plugin` host of its own; its sub-plugin (`Count`) attaches to the real `new Badge({el})` instance `Badge.attach` makes internally, not to the `DemoPage` instance.
- The sub-plugin's checkbox toggles the CLASS-level row (`Badge.enable`/`disable`), not a per-`DemoPage`-instance override — there is one `Count` setting shared by every demo box, which is enough for this MVP.

## More

- [core/Plugin](/framework/core/Plugin/) — the system this demo shows: `Host.use`, `inst.plugins`, `inst.overrides`.
- [/live/demos/](/live/demos/) — every demo on this page.
