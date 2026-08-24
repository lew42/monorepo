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
- **Tree rail moved off `ui.tree` onto `ux/Tree`** (2026-08-21, `ai/2026-08-21/pg-tree/`)
  — byte-compatible swap: `tree(roots, {onSelect})` → `new Tree({nodes: roots, onSelect})`,
  `.select(node)` unchanged (same `(node, fire)` signature). Unblocked `ui.tree`'s removal
  for the sibling task; `Playground.js:170`/`184` are the two call sites.
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

## pg-placeholder — hover `.pg-add` + one toolbar `+`

- **Every `.pg-node` carries its own `.pg-add` ghost**, the LAST real child in flow
  (`canvas.js#Canvas.render`) — every type, not just `Flex`/`Grid` (a plain Box parents
  a child exactly like a container does, so a leaf never needs converting first just to
  grow). `display: none` by default reserves NOTHING (the owner's named failure mode: a
  permanent void at the bottom of a container) — `.pg-node:hover > .pg-add { display:
  block }` (`playground.css`) is the only thing that ever shows it, and CSS already runs
  `:hover` up every ancestor of whatever the pointer is actually over, so hovering a
  nested leaf reveals both its own `+` and every ancestor's, for free, no JS tracking.
  `.pg-node-empty` (`item.items.length === 0`) gets a taller ~2em floor than the bare
  1.5em so a genuinely empty box still has room to find and hover.
- **The click listener branches on `.pg-add` first** (`canvas.js#canvas`, `closest`
  walks up from wherever was actually clicked) — `stopPropagation`, resolve the owning
  node via `closest('[data-id]')`, call `pg.add_to(owner)`, return before the fall-through
  `pg.select()` ever runs. A resize handle's own drag gets the same early-out shape.
- **`add()` factored into `add_to(into, Type=Box)`**, shared by the toolbar (selection-gated
  via `is_container` — into the selection if it's a container, else beside it) and the
  placeholder click (explicit target, ungated: a plain Box can parent same as a
  Flex/Grid). One rule, two entry points, never two implementations to keep in sync.
- **The toolbar's three add buttons (`+FLEX`/`+GRID`/`+BOX`) collapsed to one `+`**
  (`toolbar.js`) → `pg.add(Box)`; type switching moved to the sidebar's own `type`
  toggle (pg-sidebar, below) — creating a Grid is add-then-convert (two gestures) rather
  than one dedicated button, the direct cost of the collapse. **Flex escaped this cost**
  (pg-shift, below) — Grid still pays it; a third held-key combo for Grid was never asked for.
- Proven (`pg-placeholder-01..04.png`): hover/unhover round-trips a container's height
  to the exact same number every time nothing is hovered (245→282→245px) — zero
  permanent reservation; a click lands the new Box at the EXACT (x,y) the ghost it
  replaced sat at, selected; the same single hover on a leaf reveals both its own `+`
  and its parent's simultaneously; a freshly-added empty Box is itself hoverable and
  clickable, proving a plain Box parents sanely too.

## pg-sidebar — minimal, modular right sidebar

- **The wall was the always-visible CHILD fields, not the per-type ones.** `Box`/`Flex`/`Grid`
  already only ever showed their OWN `fields`; the 12-field wall was `CHILD_FIELDS`
  (`grow`/`shrink`/`basis`/`self`/`order`/`colSpan`/`rowSpan`/`area`) drawn unconditionally
  regardless of the parent. Fixed by attaching `childFields` as a static on `Flex`/`Grid`
  (`items.js`) and having `properties.js` read `item.parent?.constructor.childFields` — a
  plain Box's own `fields` is now `[]`, and its parent decides what "in parent" shows, the
  same seam `code` skill §3 already uses for inherited statics. A plain Box with no
  flex/grid parent: **7 fields** (label, type, gap, pad, width, height, bg), proven at
  `pg-sidebar-01-minimal-fields.png`.
- **`gap` moved out of `FLEX`/`GRID`'s CSS maps into `BOX`'s**, alongside the new `bg` key —
  both are shared into every `styles()` the same way `width`/`height`/`padding` already
  were, so a plain Box can pre-set a `gap` (or a `bg`) that survives `convert()` into a
  Flex, and neither is duplicated in a type's own config section (which now shows only
  `direction`/`wrap`/`justify`/`align` for Flex, `columns`/`rows`/`areas`/`flow` for Grid).
- **Type toggles CONVERT the node** (`Playground.js#convert`) — same id (so `this.selected`
  never has to be reassigned: the clone answers to the SAME id the old instance did), data
  shallow-copied across, children moved onto the new instance via `[...item.items]` before
  the old parent link is touched (`List.append` re-adopts each kid). A non-root swap rides
  the existing `add`/`remove` tree events straight to a repaint (same rule `add_to` already
  uses); the root has no parent to fire through, so `convert()` repaints explicitly and
  re-`listen()`s onto the new `this.doc`. Proven round-trip flex→auto→flex→grid on a
  3-child node, child count unchanged throughout, `pg-sidebar-02-type-convert-grid.png`.
- **hug/fill/fixed reads the PARENT's context** (`items.js#size_decls`) — MAIN axis carries
  the flex shorthand, CROSS axis carries `align-self`, same split `ext/Panel/size.css`
  already drew. Two real limits, not bugs, both reproduced live:
  - **`fill` needs free space to grow into.** A row whose OTHER children are already
    fixed-and-non-shrinking (`flex: 0 0 <len>`) can overflow before the filling child gets
    anything — `aside` in the seeded `holy-grail` layout (`nav`+`main` both fixed 12em in a
    ~386px row) stayed pinned at its hug floor on `fill`. Not fought; proven instead on a
    fresh, uncrowded row (`pg-sidebar-03-hug-fill-row.png`, 23px → 378px).
  - **`fill`-height outside a definite-height parent is a no-op** — a Flex column with no
    height of its own (`footer`'s parent `holy-grail`) sizes to its children's content, so
    there is never leftover space to hand out; `footer` held at its hug height (30px) on
    both `hug` and `fill` clicks. Matches `size.css`'s own opening comment exactly. Proven
    the OTHER way too — a column given an explicit `height` (our own `fixed` state, `20em`)
    lets its child's `fill` really grow, `pg-sidebar-04-hug-fill-column.png`, 30px → 254px.
  - **A stored length and `grow` collide on the MAIN axis.** `holy-grail`'s `main` box
    carries both `width: 12em` (now "fixed", `flex: 0 0 12em`) and `grow: 1` (`flex-grow: 1`,
    from the "in parent" section) — `common()` writes the CHILD `flex-grow` decl BEFORE
    `size_decls`'s `flex` shorthand, so the shorthand's implicit `grow: 0` wins. Pre-existing
    data, not introduced by this task; noted here rather than silently "fixed" by reordering
    (reordering would just flip which one wins, not remove the conflict — the owner's call).
- **Pad calibration lives in `styles()` alone** (`items.js#pad_decl`) — `data.padding` never
  changes; `""`/absent/`"0"` all render `0.25em` so parent-child separation stays visible,
  and the field's own quick-add button writes a real `"1em"`. Proven: `getComputedStyle`
  read `3.76px` (0.25em at this canvas's own font-size) unset, `15.04px` after one click on
  "1em" — `pg-sidebar-05-pad-bg.png`.
- **`bg` is a closed set of theme tokens**, not a colour picker (`properties.js#BG_TOKENS`) —
  `var(--surface|--tint|--wash|--bg|--sidebar-bg|--prim|--line)` plus "none", read straight
  off `lew42.css`. The dropdown's `icon` is a function (`ext/Dropdown`'s own supported form,
  same as `ext/Panel`'s `glyph()`) drawing a `.pg-swatch` in the token's own colour. Proven:
  picking "tint" set `background-color` to `rgb(248, 248, 248)` — exactly `--tint`'s light value.
- **Four controls break "change never repaints"** on purpose: the type toggle, both axis
  controls (a `fixed` choice reveals a length input — a real DOM shape change) and `bg`
  (`ext/Dropdown` never self-updates its trigger, same as `toolbar.js`'s own doc/insert
  dropdowns already have to rebuild after a pick). Each calls `pg.paint_properties()` after
  `item.set()` — cheap for a ~10-field panel, and the only way those four can ever be right.
- **Cut nothing** — `bg`, `areas`, and the `fixed` length inputs all shipped; the brief's own
  cut order (bg → grid extras → fixed inputs) was never needed.

## pg-resize — drag handles between split columns

- **`position: absolute` is the whole trick.** A handle is an extra child of the Flex's own
  `.pg-node` div; being out of flow, it is excluded from BOTH the flex layout AND its
  parent's own auto-size — "reserves zero flow space" holds by construction, proven by
  comparing sibling rects with handles present vs. `display:none` in the SAME live DOM
  (`pg-resize-01-grow-drag.png`'s fixture, `noFlowSpaceImpact: true`, 219.171875px on both
  sides either way). No negative-margin gap cancellation needed.
- **One code path for row and column** — `resize_handles()`/`position_handles()`
  (`canvas.js`) read `direction` once and pick the axis; column handles (`cursor:
  row-resize`) fell out for free, item 4 was never a separate effort.
- **Grow commit clears `width` on BOTH flanks, not just `hug` ones.** `items.js#common()`
  writes the CHILD `flex-grow`/`flex-basis` decls BEFORE `size_decls`'s own main-axis
  `flex` shorthand — a leftover `hug` (`flex: 0 0 auto`) or `fill` (`flex: 1 1 0`) always
  wins the cascade and resets our custom grow straight back to its own implicit value
  (the exact shorthand-collision this file's own "stored length + grow collide" entry
  already named, just for `basis`/`grow` too). The fix, entirely inside canvas.js's own
  commit: `set('width','')` (nothing left for size_decls to write) + `set('basis','0')`
  + `set('grow', px_i/min_px)` — CHILD longhands only, so ours are the only main-axis
  declarations left standing. `items.js`'s decl order was NOT reordered (a prior task
  already declined that fix generally — "flips which one wins, not removes the
  conflict"); this works around it locally instead.
- **Fixed-sidebar mode writes the length directly**, touches nothing else — proven exact:
  `nav` 200px + `main:fill`, drag +80 → rect `dw:+80/-80`, data `nav.width:"280px"`,
  `main.data` byte-for-byte unchanged (`pg-resize-02-fixed-sidebar.png`). Both fixed →
  the first (left/top) flank moves; an edge-aware "nearer" reading was considered and cut
  as unproven, unrequested complexity for an edge case the brief itself only mentions once.
- **A pre-existing `min-width: 1.5em` floor on `.pg-node` skews an UNEQUAL grow ratio's
  re-rendered pixels**, found while proving (a): a 359px/59px live drag commits to
  `grow: 6.08/1` exactly per the brief's `px_i/min_px` formula, but re-rendering that
  ratio at `flex-basis:0` settles at ~370/69, not ~377/62 — CSS's "resolve flexible
  lengths" step clamps each item's hypothetical size to its min-width FIRST, and only
  distributes free space after, so a floor shared identically by both sides no longer
  cancels out once their grow weights differ. `fill` (always an equal 1:1 split, `items.js`)
  never showed this — a symmetric floor doesn't skew a symmetric ratio. Not fixed here
  (`.pg-node`'s CSS is shared chrome, outside this task's fence); the LIVE drag still
  tracks the pointer exactly 1:1 (`pg-resize-01-grow-drag.png`'s move step: `dw` exactly
  `+150`/`-150`), and the committed ratio is the mathematically correct encoding of that
  drag — only the final re-render's absolute pixels carry the pre-existing floor's usual
  rounding, same as it would for any other unequal flex-grow pair in this codebase.
- **Hovering a handle also hovers its parent `.pg-node`**, which reveals that node's own
  in-flow `.pg-add` (not absolutely positioned) — visible in the wild during every drag,
  cosmetic only (the placeholder shrinks the row by its own few px while the mouse is
  over it, same as it already does for ANY hover inside a populated Flex row, handle or
  not). Proofs that need a hover-free reading move the pointer away first.
- **Seam:** `Playground.js#apply_change` imports `position_handles` from `canvas.js` and
  calls it after every style write (2 lines) — the one place ANY data change (a drag
  commit, or a properties-panel edit to width/grow/direction) can shift a flex row's own
  gap geometry, so it is the one place to keep handles in sync. `properties.js` untouched.
- **Cut:** Grid (brief's own priority order, item 5) — no handle-to-template-track
  mapping exists yet, a different mechanism entirely. Also cut, both undocumented by any
  proof and low-value: wrapped flex rows (adjacent DOM children can land on different
  visual rows; the gap-midpoint math assumes a single row/column) and live re-orientation
  of an existing handle when `direction` toggles mid-session without a repaint (the
  handle keeps its old cursor/axis class until the next full repaint — a `change`, not a
  DOM rebuild, per `properties.js`'s own "four controls break 'change never repaints'"
  exception list, which `direction` was never added to).

## pg-save — a dead dev server must never lose work

- **`documents.js` races `Socket.ready` against a 2s timeout ONCE, top-level, at import**
  (`export const local = dev && !await Promise.race([...])`, `documents.js:17`). Baseline
  bug: `FileSaver.write()` awaits `Socket.ready` with no timeout, so "New Document" hung
  forever with the dev server down — a `Promise.race` bounds it, and every save for the rest
  of the session reads the cached verdict, never the live socket again. The cost: the whole
  module graph (so the whole page) pauses up to ~2s on import whenever the race times out —
  accepted on purpose, proven bounded (`pg-save/` proof b, `since_nav_ms` ≈ 2.2s, not forever).
- **Fallback key is `playground:<slug>.local`, distinct from the real `playground:<slug>`**
  (`doc_saver`, `documents.js:30`) — never collides, never silently overwrites a document a
  reconnected session might still want. `StampedLocal` (a 2-line `LocalStorageSaver`
  subclass) is the only thing that stamps `saved_at` — only the fallback needs one: in this
  single-writer tool, a `.local` key can only exist because THIS session outraced the
  server, so the server's own copy is provably older whenever it's missing a timestamp.
- **`reconcile(slug, saver)` (`documents.js:96`) is newest-wins, nothing-deleted**, called
  from `open()` only when the race found the server up. `saver` is injectable — the eval
  proof (`pg-save/` proof d) drives it with a fabricated newer local copy and an older fake
  "server" copy with no live server at all, and asserts: fallback loaded, written through
  (`saver.save`), the superseded copy parked at `playground:<slug>.superseded.<its own
  saved_at>`, one `console.log` line, and the `.local` key removed only after a successful
  park + write-through (never before — a crash mid-reconcile leaves the fallback intact).
- **The pip is `toolbar.js`'s own `span.c("pg-toolbar-group", "● saving locally")`**
  (`toolbar.js:36`), reusing the shared group class; `color` is one inline style since
  `playground.css` was a sibling task's file this task couldn't touch — logged here rather
  than filed as a real finding, since the CSS itself is one throwaway line.
- **Cut:** stamping `FileSaver`'s own writes (so the server file always carries a
  `saved_at`) — the single-writer reasoning above makes it unnecessary for correctness, and
  every normal `Item.save()` round-trip drops unknown JSON keys anyway (`Item.toJSON()`
  never round-trips `saved_at`), so it would only have survived one write regardless.

## pg-shift — Shift-click + adds a Flex

- **Explicit beats magic, no auto-convert.** `e.shiftKey` alone picks `Flex` over the
  default `Box` — read straight off the native click event both add entry points already
  receive, one ternary each: the canvas's own `.pg-add` click (`canvas.js:40`,
  `pg.add_to(owner, e.shiftKey ? Flex : Box)`) and the toolbar `+` (`toolbar.js:22`,
  `pg.add(e.shiftKey ? Flex : Box)`). Same rule, same two entry points `add_to`'s own
  pg-placeholder comment already named — nothing else changed, `add_to(into, Type=Box)`
  already took a `Type`.
- **Long-press for touch: cut.** No touch handler exists on either `+` today, and a
  timed-hold gesture is new state (a timer, a cancel-on-move) for a feature this brief
  only wanted "if cheap and provable headless" — a proven boundary (nothing shipped) beat
  a maybe.
- **The strict holy-grail recount (nested wrapper, not the seeded root — apples-to-apples
  with `../pg-hero/`'s own baseline-9 and its "strict" 10 without the modifier): 8
  structural gestures + 1 resize drag = 9**, tying the old UI's 9 while adding a resize
  feature it never had. Shift-add removes exactly the "add-then-convert" tax pg-hero's
  strict count paid twice (the shell wrapper, the row) — 2 gestures saved, landing at
  8 vs strict-no-shift's 10. Root itself was never touched (1 kid throughout, the shell
  alone) — driven headless with a REAL held `Shift` (`page.keyboard.down("Shift")`
  bracketing a coordinate `down`/`up`, `pg-shift-drive.mjs`'s two new verbs), never
  eval-dispatched. Proof: `ai/2026-08-21/pg-shift/` pngs + this task's `task.jsonl`.

## pg-geometry — grid handles, the min-width floor skew (re-measured), wrapped flex

Resolves the three items pg-resize parked, in the brief's own priority order.

- **Grid columns/rows got handles** (`grid_resize_handles()`, `canvas.js`) — dragging
  writes `item.set("columns"/"rows", …)` straight (data IS the CSS), never an inline
  style left standing. A track's live px is read off the CONTAINER's own computed
  `grid-template-columns`/`-rows` (the browser already resolved `fr`), not sibling
  rects — a spanning or multi-row child breaks DOM-adjacency, tracks never do; the
  same reasoning drives `position_grid_handle()`. **Only two authored shapes are
  unambiguous enough to drag**: every track a literal length, or every track `fr`
  (`grid_track_mode`) — `auto`, `minmax()`, `repeat()`, mixed units get NO handles,
  bound rather than guessed. Proven (`pg-geometry-1-grid.png`): a 3×`100px` grid,
  drag handle 0 by +100px → committed `columns: "200px 23px 100px"` and the rendered
  rects (200/23/100) agree exactly; a sibling `auto 1fr` grid drew zero handles.
  Rows fell out free (same code, `isCol` picks the axis) — not separately proven,
  same risk class as the proven column case.
- **The same drag discovered length-mode grid tracks ALSO hit `.pg-node`'s min-width
  floor** (committing `8px` first rendered at ~22.5px, overflowing its own track) —
  fixed by clamping the drag itself to a live-read floor (`floor_px`, shared with the
  Flex fix below) instead of the old flat `HANDLE_MIN=8`; re-verified after the fix,
  committed `23px` and the rendered rect now agree exactly (same png).
- **The `.pg-node` min-width floor skew (pg-resize) — re-measured, formula kept
  as-is.** Diagnosed the RULE: CSS's "resolve flexible lengths" step does NOT
  proportionally split "space above the floor" — a frozen (floored) flank hands
  the FULL remainder to the other side, not a floor-adjusted share. A floor-aware
  "ratio the excess above each floor" formula was built and measured against the
  brief's own extreme-drag test: it reproduced the live-drag pixels **worse**, not
  better, than the plain `px_i/min_px` formula already shipped (total error 42px vs
  20px at at a ~10:1 drag) — a real closed-form fix would mean replicating the
  browser's own iterative freeze-and-redistribute algorithm in JS, more machinery
  than this tool's "committed rects ≈ live rects" is worth. **Kept the existing
  formula; shipped the one piece that IS simply correct**: the drag clamp now reads
  `.pg-node`'s live min-width (`floor_px`) instead of the old flat `HANDLE_MIN=8`,
  so a flank's tracked JS value can never claim a size smaller than the floor will
  actually render (proven: an extreme drag's right flank stops at exactly
  `22.546875px`, the CSS floor, not the old 8px). **Isolated measurement** (same
  hover state on both sides, so the separate `.pg-add`-hover-reclaims-space quirk
  above doesn't contaminate the reading): a ~10:1 drag (400.3px/40.3px live) commits
  and re-renders to 392.5px/48.1px — a ~7.8px swap, matching this entry's original
  "a few px" characterization. `pg-geometry-2-floor.png` is the live extreme drag
  mid-gesture. **Boundary, not a bug**: this is a property of flexbox's own
  algorithm once a shared floor and an unequal grow ratio combine, not something
  `canvas.js` can silently paper over — documented here and in `readme.md`.
- **Wrapped Flex gets no handles** (`resize_handles()` returns early on
  `item.get("wrap") === "wrap"`) — a wrapped row's adjacent DOM children can land on
  different visual lines, so the flanking-pair math (assumes one row/column) would
  pair the wrong boxes. Row-line clustering (group by `offsetTop`) is a real fix but
  a second geometry model on top of this one; disabling is the brief's own fallback
  and provably right where a wrong pairing is not. Proven (`pg-geometry-3-wrap.png`):
  a 5-child wrapped row (3+2 across two lines) drew zero `.pg-resize-handle`s while
  a plain 2-child row alongside it drew one — the wrap check, not a regression,
  is what's gating it.
