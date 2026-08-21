# playground-design — design `ext/Playground`, a simpler Panel, fresh (read-only pass)

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Opus.
**Length budget:** `design.md` ≤ 150 lines — the schema, the file map, the build order are the
deliverable; prose is the budget you cut first. You design; you do not build.

## You are the fresh eyes

**Do not open anything under `public/framework/ext/Panel/`** — not the readme, not the docs. A
sibling (`panel-insight`) is reading it and writes `../panel-insight/insight.md`; you read that
file ONLY at your last step, if it exists by then, to add a ten-line "§ Borrowed / Avoided" — if
it is absent, land without it and say so. The owner's verdict on Panel: *"a little wonky, kind of
broken, doesn't work as well as it should"* — the one thing this design must not be.

## The ask (owner, verbatim)

> We're going to try and create a simpler version [of ext/Panel] … Let's call this ext/Playground.
> We do need persistence, so use Item/List as the base for the tree items. We'll need "documents"
> and the ability to create a new one (each document gets its own tree, like figma).
> We want different types of Items for our tree. Btw, the tree is the left sidebar, and there should
> be a workspace in the middle, and a properties panel on the right. The column dividers should be
> resizable (i believe there's a "grip" ext).
> Brainstorm different item/layer types. Maybe we need a toolbar to activate/add them.
> I really want to focus on LAYOUT. Flex and Grid. And creating the best UX for exploring how they
> work. This means, we need flex and grid items, we need to be able to add/remove items, etc. And
> maybe we'll want to be able to copy+paste layers as json?
> What I really want, more than anything, is to be able to create reusable layouts, that I can load
> into the playground, see how they respond, put different content in them, etc. Don't worry about
> the content part right now, we'll figure that out later. Focus on the layout part right now.

## Read (the base you design on)

`CLAUDE.md` · `public/framework/readme.md` · `core/Item` (readme, `Item.js`, `doc/envelope.md`) ·
`core/List` · `ext/Saver` (FileSaver — what `/data/*.json` needs from the dev server; production is
static, so say what a static site does) · `ext/grip` · `ext/drawer` · `core/Sidebar` · `ext/Draggable`
(`Sortable`) · `ext/layout` (`words.js` — a layout vocabulary already exists; reuse or say why not) ·
`ext/editor` (another Item user) · `public/framework/styles/` (`framework.css` layers, `layouts.css`) ·
`ui/readme.md`. The sibling `ui-tree` is building `ui.tree(nodes, {indent, onSelect})` with
`nodes = [{icon?, text, href?, open?, children?}]`, `t.update(nodes)`, `t.select(node)` — design
against that API; anything more you need from it (inline rename, drag-reorder in the tree) goes in a
"§ Asks of ui/tree" list. Run the `layout` skill once (three sizing questions) for the shell.

## Decide (one short section each; a table beats a paragraph)

1. **Shell** — tree | workspace | properties, the two grips, column defaults + min widths, what the
   responsive handle is at 400 / 1280 / 3440; a whole-window page under `/framework/ext/Playground/`.
2. **Documents** — `/data/playground/<name>.json` per document + how the list is known (FileSaver
   and a static index? say what the dev server offers); new / open / delete; each a tree root.
3. **Item types (the brainstorm, then the cut)** — every type is an `Item` subclass, registered.
   Brainstorm broadly (frame, flex, grid, box/child, text placeholder, image placeholder, spacer,
   stack, group, layout-reference, viewport …), then name the **three** the MVP ships with and the
   `data` schema of each: for a flex container the five words (direction wrap justify align gap),
   for a grid container (template-columns/rows, areas, auto-flow, gap), for any child (grow shrink
   basis align-self order · column/row span, area), plus `width/height/padding` as a box. The wire
   format IS the copy-paste JSON — say so and show one document.
4. **Workspace** — the tree rendered as REAL flex/grid DOM (the item's data → inline style or a
   class+vars; pick, say why); click-to-select in workspace and tree both (one selection, both show
   it); the selected item's outline + its CSS printed; viewport presets / a width handle so a layout
   is seen responding. What re-renders on change (one listener at the root, per core/List's rule).
5. **Properties** — the control per data key (a segmented control for enums, a number+unit field,
   a text field for templates); writes `data`, the root emits, the workspace and the CSS readout
   repaint. No generic property engine — say the smallest thing.
6. **Toolbar** — add <type> (into the selection, or the root), remove, duplicate, copy JSON,
   paste JSON, save, new document. Where it lives (top of the workspace? the tree's head?).
7. **Reusable layouts** — the owner's "more than anything": named layouts as JSON files
   (`/data/playground/layouts/<name>.json`), a library list, load one into a document (as a
   subtree, as the root?), "see how it responds" = the viewport presets, "put different content" =
   out of scope, but name the one hook that makes it possible later (a slot item type?).
8. **The learning UX** — what makes exploring flex/grid best, in five lines: live CSS readout,
   gap/padding overlays, presets (holy grail, sidebar, card wall …), a "why did it do that" hint?
   Name what ships in the MVP and what waits.
9. **File map** — `ext/Playground/`: `Playground.js`, `items.js`, `properties.js`, `toolbar.js`,
   `documents.js`, `playground.css`, `page.js`, `readme.md`, `doc/` — or fewer; every file ≤ ~150
   lines (the `code` skill's parts-as-static-subclasses style). Class prefix `pg-` (check
   `styles/css-scopes.txt`).
10. **Build order** — 3–5 fenced tasks for Sonnet (each 30–60 min), the first being the MVP that
    opens in a browser: shell + tree + documents + one flex type + add/remove + save. File
    ownership per task; what each proves headless; what the mastermind smoke-tests between them.
11. **Not now** — the honest list (content, keyboard, undo, drag in the workspace, …).

## Deliverable

`public/framework/ai/2026-08-19/playground-design/design.md` + your `task.jsonl`. One ASCII
sketch of the shell is worth fifty lines. Nothing under `public/framework/` outside this dir is
written.

## Fence

Own: this task dir only.
