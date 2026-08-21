# Decisions — one entry per choice that shaped this module

Origin story: [design.md](/framework/ai/2026-08-19/playground-design/design.md) (the
spec) and [`../panel-insight/insight.md`](/framework/ai/2026-08-19/panel-insight/insight.md)
(what `ext/Panel` taught, ahead of this module — written without it, by design).

- **Data IS the CSS.** `item.styles()` (`items.js`) reads `data` straight into a
  declaration list, verbatim strings, `""`/absent means "skip it". No translation layer,
  so nothing can drift between what's saved and what's drawn.
- **One listener at the root; `change` repaints nothing.** `add`/`remove` redraw
  everything; a control's `item.set()` bubbles to `change`, which writes ONE live node's
  `style` attribute and refreshes the readout text — never rebuilds the DOM the
  properties panel is holding (`ext/editor`'s own scar, task 2).
- **Selection is an id, never a node.** A reload hydrates a NEW tree; every held object
  is detached. `select()`/`mark()` always re-resolve through `doc.find(id)`.
- **Index-as-document.** `/data/playground/index.json` is itself an `Item` tree because
  `Server/plugins/Directory.js:21` ignores every `.json` — a saved document never
  reaches `directory.json`, and a static host has no listing at all (task 1).
- **`grip` gained `from: "start"`** (3 lines) — the tree rail docks at the shell's
  START; the default measures `parent.right - clientX`, right for an END-docked rail
  (task 1).
- **Properties has no engine.** Each `Item` subclass declares `static fields`;
  `properties.js` only knows three controls (`seg`/`text`/`num`) and reads/writes
  `item.get`/`set` (task 2).
- **The add rule:** into the selection if it's a container, else beside it
  (`is_container`, `Playground.js`) — one rule for `add`/`paste`/`duplicate` alike.
- **The properties column is its own DOM**, never the shared `ext/drawer` rail — two
  writers blanked it in `ext/Panel` (`panel-insight/insight.md` §Avoid,
  `properties.js:150`); Playground's rail has exactly one owner.
- **The clean-seed rule.** A blank canvas is never truly blank — `seed()`
  (`documents.js`) always writes one `Flex` with two `Box`es, the same shape as
  design §3's own example, so a fresh document and the reset default never disagree
  (task 4).

## Task 5

- **The toolbar spans the shell**, not just the canvas column (design §1's sketch).
  `.pg-frame` (`flex v flex-1`) is `.page`'s one child; toolbar on top, `.pg-shell`
  below. Proved: `scrollWidth === clientWidth` on `.pg-toolbar` at 1280.
- **A theme rule can outspecify a component class in the same `@layer`.**
  `.theme-lew42 :is(button, .btn)` (0.7em/1.4em padding, specificity 0,2,0) beat both
  `.pg-btn` and `.pg-seg-btn` (0,1,0) — same `theme` layer as `playground.css`, so it's
  ordinary specificity, not the layer-order trap. Fixed with a two-class selector
  (`.pg-toolbar button.pg-btn`, `.pg-properties-body button.pg-seg-btn`) rather than
  editing the shared theme file. The `.gap` utility can't be beaten this way — it's in
  `@layer util`, which outranks `theme` outright — so `.pg-toolbar` sets `gap` directly
  and drops the utility class instead.
- **`canvas.js` split off `Playground.js`** (294 → 279 lines; canvas.js 45 new): `class
  Canvas` (render), the `canvas(pg)` builder (`.pg-canvas` + the click-to-select
  listener) and `paint_canvas(pg)`. `set_viewport` stayed in `Playground.js` — it also
  repaints `toolbar.js`'s preset buttons, and importing `toolbar.js` from `canvas.js`
  while `toolbar.js` needs `set_viewport` back would cycle (`code` skill §7).
- **page.js is now a `Doc`** (`notes: "schema decisions"`, `files:` the module's own
  list) so these two files are declared, not just present. **Left, not fixed:** a `Doc`
  page whose `render()` fully overrides the shell (this one — "a tool, not a content
  page") never calls `this.tabs()`, so `core/Router`'s nested-mount CSS
  (`.active-ancestor:has(.page.active-page)`, `core/Page/Page.css:8`) never finds a
  child `.page` inside it — `/doc/`, `/files/`, `/overview/` resolve correctly at the
  router level (title changes, `content()` runs) but render nothing visible. Outside
  this task's fence (`core/Router`/`core/Page`); `doc/schema.md` and `doc/decisions.md`
  stay reachable meanwhile as plain files — link them directly.
