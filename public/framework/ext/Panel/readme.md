# ext/Panel

Chrome for arranging. A **panel** divides, moves, fills, hugs, nests and
hosts — one `Item` subclass, one recursive view, and the persistence, drag
and control stacks that already existed.

```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…in one managed panel."); });   // no saver
panel("clock");                                 // …or any name in the T vocabulary
workspace();                                    // the persisted document
workspace({ saver, templates, seed });          // yours: own file, own T vocabulary
```

## Section vs panel

A **section** is a full-width band of a real page — content, with its own
internal measure and tone. A **panel** is chrome for arranging and
exploring: it can host any section (or experience), frame it, align it,
retint it, split beside it. **Sections are what you ship; panels are how you
wireframe.** The `T` menu is the seam: every section band is available
*inside* a panel, and nothing about the band knows it is in one.

## The shape

- `Panel.js` — `class Panel extends Item`. Items → a split (`data.dir`); no
  items → a leaf that renders `data.template`. Two verbs, `divide()` and
  `close()`; structure changes no other way.
- `workspace.js` — the doors: `panel(seed)` (default export), `workspace(options)`
  (`saver`, `templates`, `seed` — the vocabulary rides the root `Panel`,
  never serialized), and the recursive view.
- `random.js` — what `random` means: `scatter()` rolls an arrangement into a panel
  and **commits** it; `resolve()` sweeps a document for leaves that still say so.
  The vocabulary to draw from is an argument, so it imports nothing of
  `workspace.js` and the two never circle.
- `glyphs.js` — what a panel's **words look like**: the compass of eight arrows and a
  dot that draws the 3×3, `close_fullscreen`/`open_in_full` (inward for hug, outward
  for fill), the `dir` pair, and the tone→token map the swatches and `templates.js`
  both read. Imports View and nothing else, so all three control surfaces may read it
  and none of them circle.
- `toolbar.js` — the bar that floats over a panel: `toolbar(item, $panel, $body, T)`,
  where `T` is `{ names, entries, roll, repaint, sow }` prepared by the call site.
  Every verb sits in one contiguous run that folds behind `more_horiz` when the
  panel is narrower than the row. Also `handle()` (the drag grip) and `place()`.
  Reads nothing of ext/Panel, so the two never circle.
- `grip.js` — the divider between two panels. Zero-width in flow, so the panels
  touch; the seam is a `box-shadow`, the target is a 1.25rem overlay strip, and
  a pill rides the pointer along it. Drag resizes (grow fractions,
  rAF-coalesced); a click under 4px of travel opens `seam.js`'s menu. Also
  `coalesce()`, the rAF pointer-move throttle — nothing to do with dividers, and
  the file's one remaining excess.
- `seam.js` — what a seam offers when a click on it never became a drag: hug or
  fill, one row per neighbour, marked with the way it lies. Built empty and
  filled on the way **open**, so a reopened menu shows the mode the inspector or
  the panel's own bar just wrote. Hug is withheld where that side is a split —
  its grid cell stays blank, so the rows still line up. The two neighbours
  arrive as arguments, so it reads nothing of `grip.js` or `workspace.js` and
  the three never circle.
- `tools.js` — the surfaces that sit ON a panel rather than in its bar: the alignment
  3×3 drawn at the nine places it names, the scrub zoom, and the listener that puts a
  selected panel's words in `ext/drawer`. `TOOLS` is the flag object — every surface is
  on while the vocabulary is being felt out, and hiding one is a word.
- `split.js` — click an edge, get a split preview: half the panel on the side the
  pointer is on, flipping across the midline; left click commits, right click or Escape
  cancels. The edge you pointed at supplies both arguments `divide()` already takes.
- `PanelDrag.js` — `PanelDrag extends Sortable`: drag, drop, and the edge zones. **Alt at
  drop** lands a live duplicate instead of moving the original.
- `panel.css` / `toolbar.css` / `grip.css` — structure only. **`templates.css`
  is the sanctioned exception**: a template's look *is* its payload, so it ships
  one.
- `templates.js` — `name → { icon, tone?, draw($body, panel) }`. `draw` runs
  with the captor already on `$body`. `generate.js` is the one entry big enough
  to have earned its own file — and the only one that also runs the other way,
  translating a seed into real panels.
- `properties.js` — the inspector: one panel drawing the **focused** panel's
  words as live controls. A `T` entry's payload, like `generate.js`, and the
  second one big enough to earn a file. [doc/focus.md](./doc/focus.md).

`data` keys: `dir`, `template`, `align`, `tone`, `mode`, `grow`, `seed`, `display`,
`mirror`. Nothing
else is persisted — instance state (`parent`, `saver`, `draw`, `templates`,
**`focus`** and **`depth`**) never serializes. `depth` is the layout roll's max
nesting, read off the root by `sow()`: a roll *parameter*, not a property of any
panel, and the tree it makes is its own address the moment it exists.

## Templates — the T vocabulary

Twenty-eight entries: eight scenes sized in container-query units from a phone
sliver to 3440, one adapter per section band in `styles/sections/` (lazily
imported, tinted by the panel's tone), three pieces of page furniture (`rail`,
`toc`, `brand`) that exist because the translator needed them, and `space`,
which **generates** a layout
instead of showing one — `gen(seed)` from `styles/layouts/space/gen.js` writes a
whole page as spec text, and a seed is an address, so it is the only thing kept
(`panel.data.seed`): [doc/generator.md](./doc/generator.md). The sizing rules
(and the trap that already cost a real bug — a scene measuring 0px in a real
panel) are worth reading before adding a twenty-ninth:
[doc/templates.md](./doc/templates.md).

The twenty-eighth is `properties`, which reads the workspace rather than drawing
one: the **focused** panel's template, tone, alignment and sizing as live
controls, every chip the same `item.set()` the bar makes. Two of them side by
side track the same panel, because an inspector is a panel —
[doc/focus.md](./doc/focus.md).

## Decisions

- **`divide(dir)` is one verb, not two** — it reads whether its parent already runs that
  way, so a second click on the same icon gives you a third column with no separate "add a
  column" concept. **`split(dir)` is the else-branch, named** (2026-08-16): always become a
  container, whatever the parent runs. The two were one verb only for as long as nothing
  could ask for the *inside* — dropping a panel in the MIDDLE of another one is exactly
  that, and it must not become a sibling just because the parent happened to run that way.
- **The middle of a leaf is a drop target now.** Edge → beside it (`divide`), middle →
  inside it (`split`), and the two previews must never read alike: the edge shows a half,
  the middle shows an inset frame. ⚠ A **leaf** only — a split already is a container, and
  the middle of one means its row.
- **`T` types on whatever you are pointing at, and grows a line if there is none.** A scene
  or a clock matches no prose, and a shortcut that does nothing three times out of four is
  broken rather than scoped. ⚠ Every text edit here is **DOM, not `data`** — a template
  redraw takes it, because a panel's body belongs to its template until `data` learns to
  carry copy. `contenteditable="plaintext-only"`, or a paste brings its own markup into a
  layout you are arranging.
- **The insert `+` offers INTERIOR gaps only, as a stub at the head of the seam.** Full
  height, it covered the grip for the seam's whole length and the resize handle could never
  appear; at the two outer gaps it sat exactly where the edge-click split lives and hid a
  better gesture behind a worse one. Now the grip keeps all but `--insert-run` of every
  seam, and an edge means one thing.
- **Defaults live on `Panel.defaults`, read through `get()`** — not copied
  into every node's `data` — so a saved document only ever holds what
  somebody actually chose, and a changed default can still reach documents
  already on disk.
- **`"random"` is a verb that commits**, not a template: picking it from `T`
  rolls and *writes* a sub-arrangement, so a reload comes back to the same
  roll rather than a fresh one.
- **Drop-near-an-edge is tested before the normal drop target**, because the
  normal resolver always finds the *enclosing split* over a leaf and an edge
  zone checked after it could never fire.
- **A failed load never seeds.** `workspace()` only rolls and saves a fresh
  document when `Saver.load()` resolves `null` — a genuinely absent file. A
  failed read (`Saver.load()` rejects) renders an inline error instead, so a
  dev-server hiccup can never seed over, then save over, a real layout.
- **The bar is an overlay, and only the innermost one lights.** It is absolutely
  positioned over the top of the panel, so content is the same size bar or no
  bar — and `.panel:hover:not(:has(.panel:hover))` stands an ancestor down for
  the panel under the pointer, which is then reached through the divider it
  alone owns.
- **Every control is a transparent icon square, and one rule draws all of them**
  (2026-08-16). No border, no background until hovered, a `--prim` tint for the value
  the panel wears — so an idle bar is icons on the content and nothing else. The box is
  `toolbar.css`'s `.panel-workspace .panel .panel-btn`; `grip.css` and `templates.css`
  each carried a near-identical copy before, which is three places for one look to
  drift, and `.panel-props-btn` is gone as a class. **A button reads its own content**
  for its shape — `:has(> .icon, > .panel-swatch)` squares it, so ext/editor's region
  *names*, the one vocabulary here that ships no pictures, stay word-shaped with no
  flag and no second class. A tone's picture is the colour itself.
- **A trigger that shows a value has to be able to restate it.** `pop()` built its
  label once, and `change` deliberately never redraws a bar — so the template trigger
  disagreed with what the panel held from the first pick until a reload (measured:
  `history` where the body drew `clock`). `$pop.says(label)` is the one-line seam, and
  the size trigger, which shows hug-or-fill the same way, uses it too.
- **The chrome is faint, and the bar's own box does not hit-test** (2026-08-16). No
  background, no blur, no rule under it: a tinted strip across the top of every panel reads
  as part of the design rather than as a tool. What replaces it is restraint — the icons sit
  at `opacity: 0.3` and come up under the pointer. ⚠ Only what is *drawn* in the bar
  hit-tests, because an invisible full-width strip was eating the clicks meant for the edge
  target beneath it. The original trap still holds and is why that lives on the reveal rule
  rather than a blanket `*`: a bar at `opacity: 0` still hit-tests, and in a nest the
  invisible ancestor sits over the panel you are pointing at.
- **The 3×3 is an overlay on the body, not a popover behind a trigger.** A grid cell **is**
  its placement: each button's alignment inside its own cell is the code it carries, so
  nothing computes a position and the grid's padding is what holds a corner arrow off the
  corner. The container never hit-tests; only the nine buttons do.
- **A shared edge is divided by BAND, not by z-order.** The grip's target straddles a seam
  by `0.625rem` either way, and measured, it won three of four edges while the bar's own
  centred button won the fourth — a click on an edge reached nothing at all. Dragging a seam
  to resize and clicking an edge to split are both worth keeping, so the outer `0.7rem`
  stays the grip's, the split strip starts after it, and the top strip starts below the bar.
- **A live duplicate is an id, and only content is shared.** `data.mirror` holds the
  master's id — a plain string, so it round-trips through the saver untouched — and
  `Panel.get`/`set` delegate for `Panel.shared` (`template`, `tone`, `align`, `display`,
  `seed`). `grow`, `mode` and `dir` stay local, because those answer questions about a
  *slot*: a copy dropped in a narrow column is still that column's width. A literal shared
  `Item` is impossible and was never a candidate — `parent` is a single scalar and `views`
  is one entry per item, so one panel cannot have two mounts. Sharing the `data` object
  instead dies at `toJSON`, which writes it inline per item, so a reload would silently
  produce two independent copies.
- **Popovers, not selects.** Template, tone and alignment each open a grid whose
  column count is one token (the browse grid alone reflows below 12em — see the
  pickers decision); a vocabulary that ships icons is browsed by picture
  and six wide, one of names two wide. The template trigger *is* the current
  template's icon, so a panel says what it holds.
- **The row folds; it never wraps and never scrolls.** Below the width the row
  needs (19em of the bar's own em, ~236px), the whole contiguous run of verbs
  becomes one `more_horiz` popover — `display: contents` above that width, so a
  wide bar is the row it always was, measured x for x. Scrolling was the other
  candidate and is disqualified outright: `overflow-x: auto` computes `overflow-y`
  to `auto` as well, which clips every picker out of existence. Only a **leaf**
  builds a fold; a split's three buttons fit at any width worth pointing at.
- **A control surface says so, and the body reserves the bar.** The bar is an
  overlay that lights on *hover* — which for a template whose top edge holds
  controls is exactly when its first row is in use. `.panel-controls` on the drawn
  payload; `panel.css` pads the body by `--panel-bar-h`, the same token the bar is
  *sized* by, so the reserve cannot drift from the thing it clears. The inspector's
  private `2.4em` is gone. The fork: the bar could instead stand down over such a
  payload and reveal only near the top strip — rejected, because that needs JS
  pointer tracking and makes an already-invisible overlay harder to find, where the
  reserve is one class and one token.
- **A split holds its axis at every width.** `dir` is the user's answer, not the
  viewport's — a workspace is a document somebody arranged and saved. Every
  responsive-split mechanism either makes the DOM the truth about axis instead
  of the data (breaking every axis reader), grows a second sizing currency, or
  buys breakpoints with permanent API surface. An embedded workspace that must
  fit a phone is scaled by `ext/demo`'s stage; per-width fidelity, if ever
  wanted, is `structure(seed, width)` chosen at roll time. Reasoning and the
  rejected candidates:
  [reflow proposal](/framework/ai/2026-08-15/reflow-proposal/doc/reflow.md).
- **A declared extent is capped by the slot, never by the panel.** `--panel-hug` is
  a promise a 200px workspace cannot keep, so both uses read
  `min(var(--panel-hug), 100cq…)` where the `cq` is `.panel-workspace` or
  `.panel-items` — the two boxes sized from above. Reading `.panel` instead is the
  self-measuring loop the token exists to escape. Nearest container wins, so a hug
  in a split caps against its own row and a root leaf against the workspace.
- **The pickers are told apart by kind, not by a column count.** Six pictures stop
  fitting around 148px and the fix is fewer columns — but `--panel-cols` also draws
  the alignment picker, and a 3×3 that auto-fills is no longer a picture of nine
  placements. `toolbar.js` marks the browse-by-picture grid `panel-browse` — a
  shelf, reflowable — and `toolbar.css` auto-fits only that one, nested inside the
  fold because `auto-fit` counts columns against the fold's `100cqi` cap. Zero new
  API on templates: the mark is a reading of the vocabulary, like the six-or-two
  beside it.
- **ext/Panel depends on ext/layout for nothing at all** — not even `btn()`. One
  line used to wire ext/layout's bar into every leaf; it floated in a corner the
  templates were using and brought `region()` click-selection and a
  `.flex`/`.grid` util-layer landmine with it.
- **The seam is a shadow, not a box.** A 0.5px spread around a zero-width flex
  item is a 1px line — so panels sit at a measured 0px, and one declaration
  draws both the vertical and the horizontal divider with no axis to branch on.
- **The grip's menu flips `mode`, and nothing else** — the same
  `item.set("mode", …)` the panel's own bar toggles, one row per neighbour. No
  second sizing channel, no override chain.
- **Hug declares an extent; it does not measure one.** A `cq` scene has no
  content size to give, so a hugging panel takes `--panel-hug` (16em) on the
  axis its split runs and keeps the size containment a filling panel gets —
  a hugged scene is the same drawing, smaller. A hugging panel holding real
  content (a band, a `panel(fn)` drawing) still measures its own block axis,
  so `hero` hugged in a column is its own 288.7px, exactly as before.
- **A generated layout arrives two ways, and only one keeps its seed.** `space`
  draws a *picture* and stores `data.seed`, because the seed is its whole state.
  `structure(seed)` translates the same spec into real panels and stores
  nothing — once a layout is a tree, the tree is the address, and a stored seed
  would be a lie the moment you drag a band out of it.
- **One share is 8em.** A spec sizes a track two ways (`flex-1`, `--basis:15em`)
  and `Panel` has one currency (`grow`), so both convert against a single
  constant: fluid claims eight shares, fixed claims its own measure, unclaimed
  takes one. That last is what makes a topbar a band rather than a hairline.
- **The layout roll is a third structure verb, on every bar.** It sits beside
  `divide`, outside the `if ($body)` leaf test, so a split is no longer a bar
  with two buttons on it. It is handed in through `T` like `roll` and `repaint`,
  so `toolbar.js` still imports nothing of ext/Panel, and withheld from a
  workspace running its own vocabulary — the predicate that withholds `random`.
- **A panel's properties live in a panel.** `properties` is a `T` entry, not a
  docked rail: a workspace already gives layering, resizing, dragging and
  persistence, which are the four things a rail would have to grow API for. The
  `ext/layout` drawer stays exactly what it is — the *selected element's* words
  on an ordinary page. Candidates A–D:
  [sidebar strategy](/framework/ai/2026-08-15/panel-ui-overhaul/doc/sidebar-strategy.md).
- **Focus is a selection, so it is an id on the root and never saved.** It rides
  the root panel beside `templates`, clears when its panel leaves the tree, and
  is taken by a click on a panel's own bar or body — never by a grip, because
  pointer capture retargets the click at the end of a resize and a drag is not a
  selection. **Escape drops it**, and so does a `panel-unfocus` event on the
  document; a click on the focused panel does not, because the same test answers
  to a click anywhere in its body and using a panel would be how you deselected
  it.
- **A selection is announced on the document** (`panel-focus`, detail = the
  panel or `null`), because an `Item` event only reaches something holding the
  root. `dev/DevBar`'s layout tab listens and measures the focused panel instead
  of the page. Two event names and the `.panel.focus` class are the whole
  contract — no import in either direction, and nothing here knows who listens.
  [doc/focus.md](./doc/focus.md).
- **An entry that reads focus never takes it.** `focus: true` is one flag on a
  `T` entry, the same shape as `tone: true`; an inspector that focused itself
  would be holding controls that edit the surface you are clicking. Its own
  words stay on its own bar. The ring is drawn only in a workspace that holds an
  inspector (`:has(.panel-props)`), so nothing else on the site gained a mark.

Full reasoning, alternatives considered, and what's still open:
[doc/decisions.md](./doc/decisions.md).

## What will bite you

- **`Panel.js` and `panel.js` can't coexist on Windows in the same
  directory** — case-insensitive NTFS folds the two into one file, and the
  2026-08-14 rename proved it live (the old `panel.js` widget file was
  destroyed mid-rename). The split into `workspace.js` + `PanelDrag.js` is
  the permanent fix — never reintroduce a file called `panel.js` here.
- **The drag handle is the grip, never the bar.** A bar-wide handle makes
  `pointerdown` on every button start a drag, and the drag's own
  `preventDefault` eats the click meant for it. The grip's own
  `setPointerCapture` then retargets the ensuing `click` to the grip, so
  anything interactive *inside* the grip — its hug/fill menu — must be excluded
  from `pointerdown` by hand, or every button in it is silently dead.
- **Material Icons is a ligature font, and intrinsic sizing sees the word.** A
  name the font does not carry (`deployed_code` was one; `position_top_right`
  measures **432px**) renders as literal text and sizes every column of the popover
  grid. `.panel-workspace .icon` is clamped to `1em` — the whole workspace, not the bar
  alone, because the inspector and a seam's menu draw the same vocabulary and blow out
  the same way. **Measure a name against the loaded font before adding it to
  `glyphs.js`**: a glyph is 24px at 24px, a miss is the width of the word.
- **A headless probe that clicks a picker rewrites `/data/panels.json`** — the real
  document, which is gitignored, so there is nothing to `git checkout`. Worse,
  `FileSaver` saves over the **dev socket** (`socket.async_rpc("write", …)`), not over
  HTTP, so Playwright's `page.route()` cannot see the write and a probe that looks
  blocked is not. `await page.routeWebSocket(/.*/, () => {})` is the block that works.
- **`.panel-props-set` uses `auto` tracks, never `1fr`.** The buttons are a fixed
  square now, and a fixed item in a `1fr` track leaves the rest of the track as gap —
  the align 3×3 spread itself across a 40em inspector with 1000px between its corners
  and stopped being a picture of nine placements.
- **A theme styles every `button`.** `.theme-lew42 :is(button, .btn)` is 0-2-0
  and pads to `0.7em/1.4em` — right for READ GUIDE, four times too wide for a
  1em icon. `.panel > .panel-bar .panel-btn` is three classes on purpose and
  reclaims the box only; the small-caps voice stays the theme's.
- **`container-type` measures the box as if it were EMPTY.** That is what
  collapsed hug: in a shrink-to-fit context a contained body reports 0, so a
  hugged panel was 0px wide for *every* template (517.8 → 0, measured), and
  `cqh` in an inline-size container fell back to the viewport and drew a
  900px column hug. The extent has to be declared, never measured —
  `--panel-hug`, on `.panel-workspace` beside `--panel-height`.
  The boxes that can safely be query containers are the ones sized from ABOVE: the
  **bar** (`inset-inline: 0` sizes it from the panel), and the **workspace** and a
  split's **items** box (a declared height, then `flex: 1 1 0` down) — those two are
  what the cap measures against. `.panel` can never be one — hugging makes it
  `flex: 0 0 auto`, and it would measure 0.
- **Three guards hold up live duplicates, and each is a real failure mode.** `get()` falls
  back to `?? this`, so a **closed master** leaves an ordinary panel holding what it last
  had rather than breaking every copy that pointed at it. `mirror()` collapses a
  mirror-of-a-mirror to the original **at creation**, so the cycle that would hang `get()`
  cannot be built. And the root's `change` listener only ever calls `repaint()`, which
  redraws DOM and never calls `set()` — the moment it did, every write would echo.
- **⚠ `change` does not carry the item that raised it.** `Item.emit` passes
  `key, value, old` and nothing else, so a root listener cannot tell *which* panel changed.
  That is why the mirror listener repaints every mirror on any change: with tens of panels
  that is far cheaper than growing an event signature four other listeners already read.
- **`paint()` blanks silently on an unknown template name**, and there are now
  two writers of those names: the `T` menu and `generate.js`'s `PANELS` map. A
  furniture template must land in the same commit-unit as the translator that
  emits it.
- **`hug` on a split collapses it to 0px.** A hugging parent measures children
  that size themselves from it, and the result is a panel with no box left to
  point at — measured, with 0-height grips. All three doors withhold it now: the
  bar (the button sits inside `if ($body)`), the inspector (`mode` is a leaf's
  row), and `seam.js`'s menu, which keeps hug's grid cell blank beside a
  split and still offers `fill` on both sides.
- **A panel body centres what it is handed, and centred overflow spills out of
  *both* ends** — the near end is not in the scrollable region at all, so no
  scrolling reaches it (measured: a control surface's first row 124.8px above its
  own panel). `.panel-body` reads the picker's tokens `safe`
  (`align-content: safe var(--panel-y, center)`, same on `justify-items`), which
  degrades to `start` on exactly the axis that stopped fitting; take that keyword
  off and every overflowing template loses its first rows again. `templates.css`'s
  local `align-content: start` for `.panel-props` went with it — one mechanism,
  not two.

## Who uses this

- **[`ext/editor`](/framework/ext/editor/)** imports `workspace` and `Panel`
  directly and builds its five-region shell from them — the *same* class,
  tree, drag and persistence stack, with its own regions as the `T`
  vocabulary instead of the site's section bands. Not a parallel
  mechanism: `workspace({ saver, templates: REGIONS, seed })`, three keys,
  one call.
- **[`/framework/`](/framework/)**, the framework landing page, imports the
  default `panel(seed)` door to embed a single live `"clock"` leaf as a demo
  band on the homepage.
- **[`styles/layouts/space/compose/`](/framework/styles/layouts/space/compose/)**
  mounts `panel(structure(seed, depth))` and sets `root.depth`, so every bar's
  layout roll rerolls one section at the depth that page is showing. It is the
  only consumer of `structure()`, and the reason `sow()` takes a depth at all.
- Declared as a routable page: `ext/page.js`'s `children:` list includes
  `Panel`, which is what puts this module at `/framework/ext/Panel/`.

## Open

- **The chrome's phase 2 is designed and waiting on three calls** — per-axis sizing
  (`w`/`h` replacing one `mode`), self-alignment against the parent, `display` on a
  body, cursor-tracking edge strips, and `split()` beside `divide()` for the
  inside-vs-outside question `divide()` currently answers by reading the parent.
  Why alignment does not actually conflict, why `position` on a panel is undefined,
  and the flex-vs-grid decision underneath a symmetric 3×3:
  [panel chrome phase 2](/framework/ai/2026-08-16/panel-icon-buttons/).
- **Three live mounts share one document, not the two originally recorded**
  (`/framework/ext/Panel/`, its `/full/` route, and the 2026-08-13 task
  page) — `Page` caches views, so visiting any two leaves the last writer
  winning. A shared-document registry is the fix if it bites.
- **A slot narrower than 16em still cannot give two hugs 16em each.** The single
  case closed: both extents read `min(--panel-hug, 100cq…)` against the nearest
  slot box (`.panel-workspace` or a split's `.panel-items`), so a 200px workspace
  holds a 200px hug with nothing past the edge and roomy widths are unmoved to the
  pixel. But each panel caps at the *whole* slot rather than its share, so two hugs
  in a 200px row are 200px each and the row scrolls to 400 (it was 496.6). Sharing
  needs a shrink factor on `.panel.hug` **and** a cap of slot ÷ hugs, which is a
  second sizing currency beside `grow` — for an arrangement nobody has asked for.
- **Where a panel's properties live is answered** — a `properties` region in the
  `T` vocabulary ([doc/focus.md](./doc/focus.md)) — but `ext/editor` has not
  adopted it: its own properties region is still hand-rolled from `ext/layout`'s
  word registry, inspecting the selected *block*, which is a different subject
  to a panel. Nothing here touches it; its five regions carry no `focus: true`,
  so no panel in it takes focus and no ring is drawn.
  Its **collision** with the bar is answered: `.panel-controls` is one class on
  whatever a template draws, and the three editor regions whose top edge holds
  controls — palette, layers, properties — now wear it (overlap measured 0),
  while the canvas abstains because it is the document and the status strip
  because a badge is read with the pointer somewhere else.
- **The inspector offers no `grow`.** Sizing is still the grip's alone, which
  keeps one sizing channel — worth reopening only if seams prove hard to hit.

Full ledger with severities and file:line: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).
