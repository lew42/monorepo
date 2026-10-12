# What ext/Editor is built from, and how it relates to Panel and the playground

![The Editor page: block palette on the left, the canvas in the middle, the layers tree and the inspector on the right, all inside a Panel workspace](/framework/ai/2026-09-23/editor-deps/editor.png)

**Editor is a small page (about 400 lines) that builds almost nothing itself.** It borrows its frame
from Panel, its drag from Draggable, its saving from Saver, and its inspector controls from
ext/layout. It writes three things of its own: the four block types, the undo stack, and the
five painters that fill the regions.

| What you see | Where it comes from |
|---|---|
| The frame: resizable regions, dividers, the `+ · 1 · all · twin` bar | **ext/Panel**: `workspace()` in `Panel/workspace.js`, which builds a `Workspace` (`Panel/Workspace/Workspace.js`) |
| Palette (left): Section, Grid, Card, Text, then undo, redo and delete | `REGIONS.palette` in `Editor/page.js`; the blocks are in `Editor/blocks.js`; the buttons are `btn` from `ext/layout/controls.js` |
| Canvas (middle): the blocks you drag | `node()` and `class Node extends Sortable`, both in `Editor/page.js` (Sortable is `ext/Draggable/Sortable.js`) |
| **The tree of icon items** (top right) | `layers()` in `Editor/page.js`: `doc.walk()` draws one button per block, a folder or notes icon, indented by depth |
| **The inspector with layout controls** (bottom right) | `fields()` in `Editor/page.js`, drawing ext/layout's own controls (`layout.words`, `chips`); `sync()` copies the result back onto the block |
| Saving: two files, one for the document and one for the room | `core/Item` + `ext/Saver` (`FileSaver` on localhost, `LocalStorageSaver` everywhere else) |
| Undo and redo (Ctrl+Z, Ctrl+Shift+Z) | `Editor/History.js`, which saves a snapshot of the whole document |

**Two bugs turned up while I was looking. I fixed neither, because both are outside this task's fence.**
1. **Clicking a block in Editor does not update the tree or the inspector.** Panel's viewport set
   mounts the editor seven times, and six of those copies are hidden. Editor keeps one variable per
   region, so a hidden copy ends up owning the tree and the inspector.
   ([proof](/framework/ai/2026-09-23/editor-deps/editor-click.png))
2. **[Make](/imagine/paging/make/) shows "Page Load Error".** On line 355 of
   `imagine/paging/toolbar.js`, `$dot` is undefined. Line 192 stores a bare element in the map,
   but line 351 reads each entry as `{ $dot, label }`.

**The overlap verdict.** All three share the same foundation: `Item` holds the tree, `Saver` saves it,
and `Sortable` drags it. Four problems are solved two or three separate ways, and each one already
has a most complete version: the **tree** is `ux/Tree`, which Make uses; the **inspector** is
`Panel/properties.js`; **selection** is `Panel/focus.js`; the **workspace** is `Panel/Workspace`.
Editor's own versions are the smallest of each.

**Recommendation (a proposal only).** Make Panel's `Workspace` the spine, since Editor already
runs inside it. Then fold the rest into it, one piece at a time:
- `ux/Tree` replaces Editor's `layers()`, which also gives the tree drag, folding and a keyboard.
- Panel's `properties.js` rail and `focus.js` selection replace `fields()` and Editor's private
  selection.
- `History.js` becomes the one undo for any Item document, so Ctrl+Z works on panels too.

What would stay Editor's own is the block types and the canvas. Fix bug 1 first: every later step
rests on it.

[Full detail below ↓](#detail)

---

<a id="detail"></a>

## 1. Editor, import by import

Files: `page.js` (330 lines), `blocks.js` (38), `History.js` (46), `editor.css`. `page.js` imports:

| Import | What Editor uses it for |
|---|---|
| `/app.js`: `Doc, md, code, div, span, h4, input, icon, View` | `Doc` is the page itself, with Overview, API, Docs and Files tabs; the rest are element factories |
| `core/Item/Item.js` | The document. `Item.open(saver)` loads it; `Item.hydrate()` rebuilds it on undo; `walk()` feeds the layers tree; events bubble up to one autosave listener |
| `ext/Draggable/Sortable.js` | `class Node extends Sortable`, the drag for canvas blocks. A drop is one `item.move()`, and `drop_check` refuses a drop into a different document |
| `ext/Saver/FileSaver.js`, `LocalStorageSaver.js` | `store(path, key)`: `/data/editor.json` (the document) and `/data/editor-panels.json` (the arrangement) |
| `ext/layout/layout.js` | `layout.words.mode / gap / column / pad`: the inspector's rows |
| `ext/layout/controls.js`: `chips, btn` | Toggle chips in the inspector; every button in the palette and the layers tree |
| `ext/Panel/workspace.js`: `workspace, Panel` | The shell. `seed()` builds `palette \| canvas \| layers over properties`, with `status` underneath. `REGIONS` is the workspace's own `T` vocabulary, and every Panel authoring tool is switched off |
| `./History.js` | `act()` snapshots before each edit; `undo()`/`redo()` restore through `swap()` |
| `./blocks.js` | `Block extends Item` and its four subclasses, Section, Grid, Card and Text. Each has a `words` class string; Text also carries `text`. All four are registered with `Item.register` |

The five painters (`marks`, `badge`, `layers`, `properties`, `draw`) are each guarded, so a region
that is closed does not break the rest. **Selection is an id, never an object**, because undo
replaces every object in the tree.

## 2. Panel and the playground

**ext/Panel** (31 files, about 4,600 lines) arranges the screen: it divides, drags, sizes, aligns
and saves regions. `Panel.js` is one `Item` subclass. A panel with children is a split; a panel
without children is a leaf that draws a `template`. `workspace.js` draws the tree, and
`Workspace/` holds the root and adds the bar and the viewport set (`viewports.js`: fill, one, all,
twin). The inspector is `properties.js`, the right-hand rail, which reads the `WORDS` table in
`glyphs.js`. Selection lives in `focus.js`, one per page, announced as the `panel-focus` event.
`flow.js` records every gesture so the scrubber can replay it.

**The playground** (`Panel/playground/page.js`, 87 lines) is a thin, whole-window wrapper around
one `Workspace`. It shows the document named in the url and docks the rail. Its old list of
documents moved into Make's tree on 2026-09-18.

![The Panel overview page: a workspace in document mode, with the rail docked on the right](/framework/ai/2026-09-23/editor-deps/panel.png)
![The playground: one workspace filling the window, with the rail on the right](/framework/ai/2026-09-23/editor-deps/playground.png)

**What Editor uses from Panel:** `workspace()` and so `Workspace` and its viewport set; `Panel`;
`PanelDrag`, which lets you rearrange the regions by their grips; `grip.js`, the dividers;
`size.js`; `paint.js`, which draws a region from `data.template`; and `vocab.js`, which reads
`root.templates`, the hook that lets Editor bring its own five regions.

**What Editor switches off or never reaches:** `tools: { align, zoom, inspect, edges, insert, text,
display }` are all set to `false`. That means no `properties.js` rail, no `split.js` edge targets,
no `insert.js` `+`, and no `text.js`/`persist.js` text editing. It also never uses the global
`templates.js`/`generate.js`/`random.js` vocabulary (its own `REGIONS` and `seed` replace them),
`flow.js` (a `fill` workspace records nothing), `documents.js` (it passes its own saver), or
`repeat.js`.

## 3. The overlaps

| Problem | Editor | Panel | Make / playground | Most complete |
|---|---|---|---|---|
| Tree list | `layers()`: 5 lines; click only; no drag, folding or keys | none as a list (the workspace *is* the tree, drawn as boxes) | `ux/Tree/Tree.js` (604 lines: drag, folding, keyboard, drill-down) | **ux/Tree** |
| Inspector | `fields()`: ext/layout controls that write to the element, then `sync()` copies them to the Item | `properties.js` (458 lines): every word, split and close, item words, template dropdown | Make's `settings.js` (383 lines): its own right pane | **Panel/properties.js** |
| Layout vocabulary | class words (`flex v gap pad`), from ext/layout | data words (`display gap wrap justify cols…`) in `glyphs.js` `WORDS` | the realm's own words in `build/words.js` | Two vocabularies for one job. Panel's saves cleanly as data; ext/layout's is what a page pastes |
| Selection | `sel`, an id inside a closure | `focus.js`, one per page, the `panel-focus` event | Make announces on the same `panel-focus` event | **Panel/focus.js** |
| Workspace | borrows Panel's | `Workspace/` | the playground *is* a Workspace | **Panel/Workspace** |
| Drag and drop | `Node extends Sortable` | `PanelDrag extends Sortable` | `ux/Tree`'s own `TreeDrag` | Editor and Panel share one base; ux/Tree has a second |
| Saving | `Item` + `Saver`, two files | `Item` + `Saver` + `documents.js` (named documents) | Make: `made.js`, a `page.json` per page | Shared foundation; Panel adds names |
| Undo / history | `History.js`: whole-document snapshots, Ctrl+Z | `flow.js`: the same snapshots, recorded for replay, no Ctrl+Z | Make: one-step undo of a page move | The same mechanism, built twice |

## 4. The two bugs, with evidence

**Editor selection.** `viewports()` in `Panel/Workspace/viewports.js` mounts seven boxes of one
root: fill, four devices and two twin panes. Each box runs every region's `draw()`, and each
`draw()` reassigns Editor's single `$canvas`/`$layers`/`$props`. Measured headless: there are 35
`.editor-region` elements and 5 visible. After clicking a visible Text block, the visible inspector
still said "Item — container" and the visible tree still highlighted "Item". Two possible fixes:
let a `Workspace` skip the viewport set (for example `viewports: false`), or keep Editor's painters
per box. Either one touches `ext/Panel` or `ext/Editor`, which are outside this task's fence.

**Make.** `/imagine/paging/make/` renders "Cannot read properties of undefined (reading 'rc')". The
chain is `PagingToolbar.render → sync → toolbar.js:355`. Line 192 does
`this.dots.set(axis, span.c("paging-dot"))`, but line 351 destructures `{ $dot, label }`. The file
has no uncommitted changes, so this is committed code, not someone's edit in progress. This is why
there is no Make screenshot.

## 5. How the screenshots were taken

At first every headless screenshot came out blank. `App` waits for two Google fonts before it
paints anything, and inside headless Chromium on this machine those font requests never finish,
while node fetches them in 165 ms. The probe now hands the fonts over through node, and closes the
dev socket the way `Server/health.mjs` does, so nothing it loads can save a file. With that, the
app boots in about 10 seconds. The same trap will blank any future headless check that does not
have this workaround.
