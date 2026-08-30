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
  (task 1). Since pg-chrome-polish `from` also mirrors the strip's LOOK, in `ext/grip`;
  this module's own flip is gone.
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

## pg-model — pad/gap floors you can turn off, and the smallest CSS that means hug/fill/fixed

### The two floors are `max()` + one custom property

- **The floor moved out of `items.js` and into a variable the canvas owns.** `styles()` now
  writes `padding: max(<what you typed, or 0px>, var(--pg-pad-floor, 0px))` and, on Flex/Grid,
  `gap: max(…, var(--pg-gap-floor, 0px))`. `.pg-canvas-body` carries `.pg-pad-floor` /
  `.pg-gap-floor` (playground.css), each setting its variable to `0.25em`; toolbar.js's two
  buttons flip them. **Inline style beats every layer**, which is why the floor has to live in
  `styles()` — and a custom property is what lets a class change it anyway. `.pg-canvas-body`
  and not `.pg-viewport`: the viewport is rebuilt by every `paint_canvas()` (canvas.js:59), the
  body never is.
- **Why a toggle at all:** a floor makes 0 unreachable, and the owner needs to see a real 0.
  Measured: with the floor on, a `padding: 0` box computes `3.82px` (0.25em at the canvas's own
  font-size) and a `gap: 0` row separates its two children by the same `3.82px`; with it off,
  both read `0px`. A box that typed `1em` reads `15.28px` in **both** states — `max()` floors,
  it never overrides.
- **Zero layout cost, measured.** Toggling pad off and on again returned all 42 fixture nodes
  to their exact starting rects (0 of 42 drifted), same for gap; the toolbar, both rails, the
  canvas and the canvas body never moved in any of the four toggles. Turning the gap floor off
  moved exactly **one** node — the second child of the one `gap: 0` row — and nothing else.
- ⚠ **`max()` takes lengths.** A bare `0` is a `<number>`, not a `<length>`, and would
  invalidate the whole declaration (silently — the padding would render 0 with the floor ON),
  so `"0"`/`""` is normalised to `0px`. And a **shorthand** (`padding: 1em 2em`) cannot go
  inside a `max()` at all — it is written verbatim instead, which is right anyway: a shorthand
  is never the zero the floor exists to catch.
- **Not persisted, on purpose.** A floor is a viewing aid, like the viewport preset beside it —
  both reset on reload. One less key, one less thing to disagree with the DOM.
- **`gap` left `BOX`'s CSS map.** Block layout draws no gap, so a plain Box now writes no gap
  declaration at all — one fewer inert declaration on every Box, and the *data* still survives
  a `convert()` into a Flex, because it always lived in `data`, never in the CSS.

### The truth table — what CSS already does, and what is left to write

Every cell measured on a 42-node fixture (`pgmm-model`, deleted after) by applying the OLD
declarations and the new ones to the *same* live tree and comparing rects. "—" is the whole
point: the default already does it.

| context (the PARENT) | axis | `hug` | `fill` | `<length>` |
| --- | --- | --- | --- | --- |
| **Flex, MAIN** (width in a row, height in a column) | main | **—** `flex: 0 1 auto` already measures the content | `flex: 1 1 0` | `flex: 0 0 <len>` |
| **Flex, CROSS** | cross | `align-self: flex-start` — **only if** the container's `align` is unset/`stretch` | **—** a flex item already stretches; `align-self: stretch` **only if** the container said otherwise | `<axis>: <len>` |
| **Grid** | width | `justify-self: start` | **—** a grid item already stretches its cell | `width: <len>` |
| **Grid** | height | `align-self: start` | **—** | `height: <len>` |
| **Block** (a Box, or the root) | width | `width: fit-content` | **—** `width: auto` **is** the full line (border-box, no margins) | `width: <len>` |
| **Block** | height | **—** `height: auto` **is** the content | `height: 100%` | `height: <len>` |

Six cells write nothing; a seventh (cross-axis hug under a non-stretch container) writes
nothing too. Three cells that used to write **two** declarations now write one.

- **`align-self` beside a length was always redundant** — `stretch` only ever applies to an
  `auto` cross size, so a box with a definite `height` was never being stretched anyway.
  Proven: `height: 4em` alone and `height: 4em; align-self: flex-start` render the identical
  61.11px box in a row Flex, and the identical grid cell.
- **"Write nothing" is argued per case, never assumed** — the flex cross-axis default *is* the
  container's `align-items`. In a row with `align: center`, a `hug` child needs no declaration
  (it is already content-sized) and the old unconditional `align-self: flex-start` was actively
  wrong: it yanked the child to the top of a row its author had asked to centre. Measured: same
  32.25px height either way, y moves 576.50 → 609.03, i.e. into the centre where it belongs.
  The one cell that GAINED a conditional declaration is cross-axis **`fill`** under a
  non-stretch container (`align-self: stretch`, 32.25px → 97.33px).
- **`hug` and "never touched" are now the same thing.** They were not: a child that had never
  been given a `width` wrote nothing, and one whose owner clicked **hug** wrote
  `flex: 0 0 auto` — two identical-looking states with different CSS, exactly the "strange
  state" the ask names. Proven: `r-w-hug` and a control child with no keys at all now render
  the same 30.25 × 97.33 box.
  ⚠ The one behavioural difference this costs: `flex-shrink` is `1` by default, so a hug child
  of an **overcommitted** column shrinks to its `min-height` floor where `flex: 0 0 auto` would
  have overflowed instead (measured: 32.25px → 30.55px, and only when the column is
  overcommitted). That is the CSS default, and it is what every untouched sibling already did.
- **Block-context `fill` height stopped being a no-op.** It used to write nothing and therefore
  did nothing, ever. `height: 100%` fills when the parent has a height to fill and computes to
  `auto` when it does not — so the control is honest in both cases instead of dead in one.
  Measured: a child of a `height: 9em` Box went 32.25px → 127.89px.
- **A length on the flex MAIN axis keeps the `flex: 0 0 <len>` shorthand.** The alternative —
  a plain `width: <len>`, which a flex item with `flex-basis: auto` reads as its main size — is
  also exactly **one** declaration, so the tie breaks on behaviour: the shorthand is what the
  drag handles commit (canvas.js), so committed pixels keep matching the live drag, and it is
  what keeps the owner's `untitled` at delta 0. ⚠ It also keeps the parked collision: a MAIN
  length plus an authored `grow` still fight, and the shorthand still wins (pg-sidebar above,
  readme). **`width: <len>` would resolve that collision** — it collides with none of the five
  child fields — but it changes how `untitled`'s `main` box renders today, so it stays the
  owner's call, exactly as pg-sidebar left it.
- **Regression bar met.** `untitled` — the owner's document — was measured with the old
  declarations and the new ones applied to the same tree: **all 10 nodes, x/y/w/h, delta 0.00**,
  and restoring the new styles landed back on the same numbers. Four of its nodes simply lost
  the redundant `align-self` beside their `height: 6em`.

### The default document is the holy grail

- `seed()` (documents.js) opens on **page → header / body(nav · main · aside) / footer**, seven
  boxes with semantic labels and `bg: var(--surface)` on the page. The ux research measured the
  old seed's lone fixed 10em box costing **8 of 38 gestures** across five canonical layouts —
  every run began by undoing it.
- **Nothing in the seed declares a height** (the owner, 2026-08-29): the page is a plain
  **Box** — no flex, no height — so the document hugs like any div and grows as content does.
  The first cut of this seed was a `Flex` column at `height: 24em`, reasoned as "a column of
  indeterminate height hands out no free space, so `fill` teaches nothing" — true, but it made
  every new document open on a fixed height, the exact non-default the sizing audit exists to
  avoid. The lesson moved instead of dying: the page carries `gap: 1em` that a Box draws
  nothing with — flip its type to FLEX and the gap appears (gap survives `convert()`,
  items.js's own rule). The only size words left are the layout: rails at `10em`/`8em`,
  `main` on `fill`.
- `.pg-canvas-body` gained `background: var(--wash)` — a white page on a white canvas is a
  background you cannot see, and showing you one is the seed's whole job.
- `set_viewport()` now calls `position_handles()` directly. canvas.js's ResizeObserver already
  covered it; the code that moved the geometry saying so is the honest version.

## pg-edges — the edge is the insert affordance

The ux research's own rule, adopted whole:

> **An edge inserts a sibling on that side. If the parent doesn't already flow that way, the
> parent is made to — converted if the node stands alone, wrapping just this node if it has
> siblings that must stay put.**

Everything the owner asked for falls out of it, so none of it is a separate concept:
sibling-before/after is *which* edge; row-vs-column is which **pair** of edges, so direction is
never its own gesture again; wrap-into-row/column is the same click when the parent flows the
other way. `child` is the one target that is **not** an edge.

- **The proposal's "delete the in-flow `.pg-add`" was rejected.** The blocky reserved-space `+`
  is the deliberate child-add affordance in a stack and it already measures 0px of shift; the
  edges add what it cannot. Five targets on one node, one meaning each — all five verified
  reachable by `elementFromPoint` on a single `.pg-stack`.
- **The strip is the click target, not the chip.** A 12px band down a whole edge is a target you
  hit without aiming; the chip is only the picture of what the click will do. Two reveal steps
  (faint band on node hover, solid band + `+` on strip hover) is what keeps four simultaneous
  affordances readable.
- **Strips live INSIDE the node's own box.** Straddling the border would have been prettier, and
  a 6px overhang on the outermost node would push `.pg-canvas-body`'s `overflow: auto` into a
  scrollbar — the 0px-shift promise broken by the long way round.
- **A Grid parent always wraps, never converts.** `flow_of()` answers `null` for a Grid: its
  template is authored information, and no click is worth throwing a `grid-template-columns`
  away. A Box answers `"column"` — block flow already stacks, so an edge-insert into one costs
  no conversion at all.
- **The wrapper takes over the node's own slot** (its `width`/`height` words), which is what
  makes "siblings' rects unmoved" true rather than hoped for. Measured on `L | M | R`: after
  wrapping `M`, `L` (530,111 150×90) and `R` (828,111 120×90) are byte-identical. ⚠ The node
  keeps its own words too, so wrapping a `width: 10em` box puts two 10em boxes in a 10em slot
  and flex shrinks them; the alternative (clearing the node's word) was rejected as magic.
- **The clicked node stays selected** — wave 1's `add_to` rule. The edge you just used is still
  lit and still under the pointer, so the next click is the same click.
- **`batch()`.** A wrap is four list mutations, each firing `add`/`remove` → `repaint()` → a
  save. More than an optimisation: during a wrap the clicked node is detached for exactly one
  statement, and a repaint in that instant would draw a document with the selection missing.

### The gap handle is a click as well as a drag

A press that never travels **5px** inserts between the pair it flanks; past 5px it is a drag and
stays one. A click commits *nothing* — both flanks are re-stamped from their own data first, so
an idle `pointermove`'s provisional inline `flex` can never be mistaken for a `grow` you meant.
Driven both ways: click → three bands; drag +70px → 201/201 becomes 268/134, `grow` 2.07/1, child
count unchanged. **Grid gap handles stay drag-only** — a grid's DOM-adjacent children are not
track-adjacent, the same bound `grid_resize_handles` already documents.

### What the compaction actually bought

- Toolbar dropped `{}` / `paste` / `⧉` / `✕`. `⧉`/`✕` are chips on the selected node's own
  chrome — the target belongs where your pointer already is. `copy`/`paste` stay as methods with
  no button; keyboard verbs for them are parked.
- `duplicate()` now lands **beside** the original instead of through `paste()`'s into-or-beside
  rule. That rule was right for the toolbar verb it was written for; a chip sitting *on* a Flex
  that duplicates *into* it reads as a bug. The chip is the only caller left.
- Sidebar dropped the `order` / `shrink` / `basis` **fields**. The keys and their declarations
  stay — a Box carrying all three still renders `flex-grow: 1; flex-shrink: 2; flex-basis: 10em;
  order: 3`, verified — and the resize commit still writes `basis: 0`.
- ⚠ **The proposal's arithmetic on the sidebar height was wrong.** Deleting those three moved
  `align` — the control it measured off-screen at 900px — by exactly **0px**, because all three
  sit *below* it. What moved it was density: `0.75em` → `0.5em` between fields and in sections,
  and a smaller seg button. `align` went 956 → **842**. The full column still scrolls
  (`scrollHeight` 1247 → 1108 against a 850 client) and always will while a readout lives at the
  bottom; `overflow: auto` reaches it. The real fix is the parked item below.

### Two traps this wave paid for

- **An in-flow `.pg-add` must stay `static`.** Giving it `position: relative; z-index: 2` makes
  it paint above every positioned sibling — and a block-level `+` is **full width**, so on an
  empty Box it covered the whole top edge and `elementFromPoint` on both chips returned
  `.pg-add`. Static hands the 12px outer ring to the strips and the corner to the chips, and
  keeps the middle, which is the child-add target.
- **A handle's orientation is baked into its class at render time.** Flipping `direction` left
  the strips lying across the wrong axis until something else happened to repaint — the readme's
  own "Left" item, harmless while a handle only resized, and not harmless once a stale handle is
  a stale *insert* target. `apply_change` now redraws the canvas for `direction`/`wrap` and
  re-lights the selection, deliberately leaving the properties column (and the attribution
  below) alone.

### The readout names what moved

`apply_change(key)` diffs the node's previous `style` attribute against its new one; whatever
reads differently wears `.pg-decl-new`, and the key that did it is named underneath. **No
key → CSS-property table exists**, so nothing can drift out of sync with `items.js`. The third
branch is the interesting one: plenty of words write no declaration at all, and saying
`label — writes no CSS here` out loud is the lesson — silence would read as a broken control.

⚠ Five controls (`type`, `width`, `height`, `pad`, `bg`) rebuild the whole column right after
writing, which wiped the attribution of the very change that triggered it. The last change is
held on the instance and replayed by the first paint.

### Grid pre-fills its template

Choosing `grid` writes `1fr 1fr` into `columns`, visibly. A Grid still costs two gestures — a
template is information, not a click — but the second is now an edit of a real value already on
screen and already drawn, instead of finding an empty field and inventing the syntax. It never
overwrites a template the document already had.

### Parked for the owner

**Axis chips on the edges** (the proposal's §Learnability item 2): a selected Flex carrying its
`direction`/`justify` chip on its own main-axis edge and `align` on the cross — you learn which
axis a property owns by where its control sits. It is also the only thing that brings the whole
properties column inside 900px, since it removes the two tallest fields. Also parked: keyboard
verbs for `copy`/`paste`, and insert-between on Grid gap handles.

## pg-chrome-polish — a rail that does not resize, and a grip on the edge it drags

### The right rail's OUTER width was never the problem

The owner: *"the right sidebar needs a fixed size, it shouldn't grow/shrink when switching
selection (which causes the viewport area to resize)."* Reproduced before anything was
changed, and the first answer was no: `.pg-properties` is
`flex: 0 0 clamp(13em, var(--pg-props, 18em), 34em)` — grow **and** shrink at 0, so its width
cannot depend on its content by construction. Measured across every selection at 1280 (7
nodes) and 3440 (47 nodes), under six conditions — default, a persisted `--pg-props` of
500px, one clamped low, the dev rail open, a 1280 viewport preset, both floors off —
`.pg-properties`, `.pg-canvas`, `.pg-viewport` and `.pg-tree` each held **one value, to the
third decimal**. Touching the width mechanism would have been fixing blind.

What *does* move is the box inside it. `.pg-properties-body` is `overflow: auto`, and the
field count is selection-dependent: a Box is 7–9 fields and fits, a Flex is 11 and a Grid 13
and they do not. So the scrollbar toggles on exactly the Box↔Flex/Grid switch the owner
named, and wherever a scrollbar occupies layout space — every desktop Chrome or Edge on
Windows at default settings — it takes ~15px of content width with it and reflows the column.

```css
.pg-properties-body { …; scrollbar-gutter: stable; }
```

⚠ **Headless cannot see this bug.** Chromium 151 reports `offsetWidth - clientWidth === 0`
on a scrolling box — overlay scrollbars — and so does `channel: "chrome"` launched with
`--disable-features=OverlayScrollbar,FluentOverlayScrollbar`. A probe that only measures
headless will call this stable and be wrong. What headless *can* show is the toggle itself
(`scrollHeight > clientHeight` flipping with selection) and the gutter being reserved after
the fix (inner width 270 → 255 at 1280, 323 → 308 at 3440 — Chromium reserves the 15px even
under overlay scrollbars).

The cost is honest: 15px of the column, permanently, in every browser. The rail is
drag-resizable, so it is recoverable, and a fixed size is what was asked for.

### The grip's flip moved into `ext/grip`

`playground.css` used to carry `.pg-tree .grip { inset-inline-end: 0 }` — flipping the strip
for the start-docked tree column while the lit `::before` inside it stayed anchored the other
way, so the line drew **10px short of the tree/canvas boundary it drags**. That was the
owner's "the grip is offset in a strange way".

Fixed at the cause: `grip({ from: "start" })` now stamps `.grip-start` and `ext/grip` mirrors
strip and line together. The override here is **deleted** — a consumer states which edge it
docks on and compensates for nothing else. Verified 0.00px off the boundary, both rails still
dragging ±100px exactly. Record: [`ext/grip/doc/decisions.md`](/framework/ext/grip/doc/decisions.md).
