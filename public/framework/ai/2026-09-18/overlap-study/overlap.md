# Overlap study — the framework vs the imagine stuff

One page, read top to bottom. The screen below is the whole story; the table under it
is where every number in that story comes from, and any line count can be re-checked
with `wc -l` on the file named beside it.

## The one-screen version

**Nine concepts were checked** (the ones named in the brief, no more): drag, rails and
sidebars, stages and workspaces, persistence, cards and previews, toolbars, trees and
lists, CSS, and navigation. **Two of the nine turned out to already be fixed** — drag and
trees/lists were both quietly consolidated onto one real implementation in the last
day or two, and this study found no work left to do there. **One (toolbars) was never
actually a duplicate** — the framework's own `ui/toolbar` page says outright "there is
no `ui.toolbar()`", so there is nothing to merge. That leaves **four concepts with real,
fixable duplication**, plus the two cross-cutting departments the owner named directly
(CSS, navigation), which are audited below rather than "fixed" in one move.

**Three of the four are genuine duplicates — two things doing the same job** (the
files in these three rows of the table add up to about 4,400 lines total, though most
of that is legitimate one-off content sitting beside the small part that actually
repeats): the resize handle on the left rail is written twice, once in `Sidebar.js`
and once in `Shell.js`; three different classes (`Page.Store`, `Sidebar.Store`,
`ext/Saver`'s `LocalStorageSaver`) each reinvent "read and write one JSON blob in
localStorage"; and a 644-line hand-built card wall at `/layouts/browse/` duplicates
the 216-line `browse()` the framework already has. **The fourth is a concentration,
not a duplicate:** `imagine/paging/paging.css` is one file, 1,272 lines long, carrying
131 of the site's 1,894 hand-typed spacing numbers by itself — 1.7 times more than the
next-worst file — so it is where the "CSS department" cleanup the owner asked for
would show up fastest.

**The top five merges** (full detail as `decision` lines in `task.jsonl`):

1. **Finish wiring `core/Sidebar` to `ux/Tree` everywhere.** This is already 90% done —
   a sibling task landed it in `Sidebar.js` an hour before this study ran. What's left
   is 10 one-line edits (`pages: [...]` → `root: this`) at the call sites that still
   pass a flat list instead of a live page. Complexity **S**. Lines removed: **0** (this
   is a reach fix, not a cleanup) — but it is the single most direct answer to "we need
   a few core navigation systems working."
2. **Wire `ux/Filter` into `core/Sidebar`.** The filter/toggle component the owner asked
   for already exists (151 lines, `ux/Filter/Filter.js` + `FilterChips.js`) and is used
   by **zero** production pages today. Complexity **M**. Lines removed: **0** (new
   composition) — this activates code that is already paid for and sitting idle.
3. **One shared resize-rail helper**, used by `Sidebar.grab()` and `Shell.grab()`
   instead of two 18-line copies of the same pointer-capture gesture. Complexity **S**.
   Lines removed: **~30**.
4. **One shared localStorage store**, used by `Page.Store`, `Sidebar.Store`, and
   `ext/Saver/LocalStorageSaver` instead of three. Complexity **S**. Lines removed:
   **~20–25**.
5. **`layouts/browse/page.js` calls `this.browse()`** instead of hand-rolling its own
   644-line card wall and 297-line stylesheet — the exact same merge was already done
   once before, at `core/Layout/page.js` (2026-09-06, "used to be a near-copy of
   `browse()`... they are options on `browse()` now"). Complexity **M** (the 99 items
   here come from a JSON catalogue, not live page children, so this needs the same
   adapter `core/Layout/page.js` already built — read that file first). Lines removed:
   **~300–400**, mostly the card-grid and tier-strip logic; the verdict prose and
   picture-vs-wireframe labelling are unique to this page and stay.

**Two numbers that must agree:** 36 implementations are named across the 9 rows below
(the CSS row is a census, not a list of implementations, so it is not counted here);
36 files were opened and their actual content read for this study, not just found by
`find`/`grep` — a file only earns a spot in a row's "implementations" cell once its
real code has been seen, which is how `imagine/page.js`'s "rail" turned out to already
be `columns()` + `previews()` in disguise, and `ui/tree/tree.js` turned out to be CSS
with no JS left in it at all.

**The navigation sentence, as asked:** the one system to make the site's core is the
left sidebar with a tree in it — `core/Sidebar` consuming `ux/Tree` is already real code
as of an hour ago, it is the only rail on the site that is persistent, resizable,
deep, *and* already reused at all 11 top-level sections, and it just needs `ux/Filter`
wired in to deliver the "filters or toggles" half of the owner's own sentence; the
crumb strip and the tabs stay exactly as they are — a crumb trail for "where am I
inside a browsing session" (columns rows, deep folders) and tabs for "which of these
five fixed views" (a module's OVERVIEW/DOCS/FILES) are jobs the tree does not do and
should not try to; and `/imagine/` becomes the site's lab bench rather than a
second framework — its job stops being "build a new rail/store/card/tree" and starts
being "prove a new page in one afternoon out of the pieces `core/`, `ext/`, and `ux/`
already carry," the way `imagine/gallery/` and `imagine/page.js` already quietly do
today.

---

## The table

| Concept | Implementations (file — JS lines / CSS lines) | Keep, and why | Merges into it | Complexity | What breaks (rg counts) |
|---|---|---|---|---|---|
| **Drag** *(already merged — no action)* | `ext/Draggable/Draggable.js` — 100/— · `ext/Draggable/Sortable.js` — 88/— · `ext/Draggable/draggable.css` — —/30 · `ext/Panel/PanelDrag.js` — 148/— (extends `Sortable`) · `ux/Tree/TreeDrag.js` — 30/— (compat shim over `Tree.Drag extends Sortable`) · `imagine/team/page.js`'s `Chip` (extends `Draggable` directly) | `ext/Draggable`'s `Draggable`/`Sortable` pair. Every other file is a genuine subclass adding domain rules (Panel's three-target edge-drop, Tree's grip-only handle, the kanban chip's lane logic), not a second copy of pointer-capture/ghost/placeholder logic. | Nothing — this is the finished state. `TreeDrag.js`'s own comment dates the merge: "drag is `new Tree({ drag: true })` now (2026-09-17)". | — | `Draggable.js` imported by 5 files; `Sortable.js` by 3 (`ux/Tree`, `ext/editor`, `ext/Panel`) |
| **Rails and sidebars** | `core/Sidebar/Sidebar.js` — 247/256 · `layouts/shell/Shell.js` — 171/475 · `imagine/page.js` — 148/— (its "rail" is `columns()`+`previews()` plus 2 lines for a group heading — not a real duplicate) · `imagine/paging/rail.js` — 109/— (tile data) + `imagine/paging/paging.js` — 314/— (draws it) · `ext/AITask/dashboard.js` — 335/— (its `rail()` is a status digest, a different job, not site navigation) | `core/Sidebar` for the site's own navigation — it is the only one that is a real tree, resizable, remembered, and reused at all 11 top-level sections. `imagine/paging`'s rail stays separate on purpose: a fixed tile grid for one app realm, "it never moves and it never changes," genuinely different behaviour from a nav tree. | `Shell.js`'s `grab()` (resize-drag) is a byte-for-byte re-write of `Sidebar.js`'s `grab()` — both pointer-capture, both a double-click reset, different class prefixes only. That's the one real merge here. | S (the grab merge) | `new Sidebar(` — 11 call sites; `hides-nav` (the site's own top nav, hidden wherever a Sidebar shows instead) — 11 sites, matching exactly |
| **Stages and workspaces** | `ext/demo/stage.js`+`stage.css`+`pane.js` — 314/153 · `ext/Panel/Workspace/` (`Workspace.js`, `documents.js`, `viewports.js`, `workspace.css`) + `ext/Panel/workspace.js` — 610/71 · `imagine/paging/stage.js` — 1008/— (a **false cognate** — it reads a `page.json` and draws layout "words"; it is a content renderer, not resizable workspace chrome, despite the name) | Both real workspaces already share what should be shared: `ext/demo/pane.js`'s own doc comment says its `simulate`/`watch` pair "compose... into a fixed device frame — `ext/Panel/Workspace`'s viewports — which is why those two are exported." | Nothing further recommended. Forcing `imagine/paging/stage.js` toward either one would be merging two things that only share a name. | — | `demo.stage(`/`from "…stage.js"` — 62 references; `Panel/Workspace` — 10 importers |
| **Persistence** | `core/Page/Page.class.js`'s `Page.Store` — ~40 lines, embedded · `core/Sidebar/Sidebar.js`'s `Sidebar.Store` — ~13 lines, embedded (counted in the rails row above, not twice) · `ext/Saver/Saver.js`+`FileSaver.js`+`LocalStorageSaver.js`+`MemorySaver.js` — 46+56+36+24 = 162/— · `imagine/paging/make/made.js`'s `Store`/`FileStore` — 308/— (built ON `FileSaver`, good composition, not a duplicate) · `core/Item/Item.js` — 118/— (consumes a `.saver` via `ext/Saver`'s shape, not a duplicate) | `ext/Saver` for anything that saves to a file or waits on a write queue — it already has three backends and `Item`, `Panel/Workspace`, `DevBar` and Make all build on it correctly. | `Page.Store` and `Sidebar.Store` do NOT build on `ext/Saver` — each hand-rolls its own "JSON.parse/stringify a localStorage key with try/catch and a private-mode fallback," which is exactly what `LocalStorageSaver` already is, just with a different calling shape (`get`/`patch` vs `load`/`write`). | S | `.store()` call sites — 17 files; `LocalStorageSaver`/`FileSaver`/`Saver.js`/`MemorySaver` imports — 10 files |
| **Cards and previews** | `Page.class.js`'s `preview_card()` — ~10 lines (the base primitive: a link, a label, an optional thumb) · `ext/catalog/catalog.js`+`.css` — 84/199 · `ext/catalog/browse.js`+`.css` — 216/73 · `layouts/browse/page.js`+`browse.css` — 644/297 (hand-rolled, does **not** call `browse()`) · `ext/AITask/card.js` — 144/— (task-specific fields — who/what/duration — not a duplicate) · `imagine/gallery/page.js` — 41/— (**already** calls `this.previews()` correctly — not a duplicate, despite being named in the brief) | `preview_card()`/`previews()` as the one card primitive (144 call sites); `catalog()` (29 sites) and `browse()` (a handful) as the two ways to wrap it in chrome — a persistent rail, or a filterable wall. | `layouts/browse/page.js`'s card grid and tier strip are a second, independent implementation of exactly what `browse()`'s bands + facets already do. The same merge was done once before at `core/Layout/page.js` (2026-09-06) — read that file's own comment first. | M (its ~99 items come from a JSON catalogue, not live page children — `browse()` today assumes children; the adapter pattern to copy already exists at `core/Layout/page.js`) | `this.browse(` — 7 real call sites (only `core/Layout/page.js` in production); `this.catalog(` — 29; `this.previews(` — 144 |
| **Toolbars and control rows** *(not a real duplicate)* | `ui/toolbar/page.js` — 116/— (a **doc page**, not code — it states "there is no `ui.toolbar()`. A bar is `pad flex wrap gap v-center` on a surface") · `imagine/paging/toolbar.js` — 368/— (bespoke, driven by the realm's own seven-word vocabulary) | Neither "implementation" competes with the other — one is a pattern doc, the other is one realm's dropdown bar. | Nothing recommended. | — | — |
| **Trees and lists** *(already merged — no action)* | `ux/Tree/` (`Tree.js`, `TreeDrag.js`, `TreeKeys.js`, `Tree.css`) — 616/60 · `ui/tree/tree.js` — 54/— (its JS factory retired 2026-08-21 and is now **CSS only**, kept just so `ux/Tree` can import its stylesheet) · `imagine/design/lists/page.js` — 524/124 (a comparison **lab** of six list UI shapes, one active minion task as of this study — not a duplicate component, and not meant to become one until a shape wins) | `ux/Tree` — it is what `core/Sidebar` and `layouts/shell/Shell.js` both already build their rails on. | Nothing left — `ui/tree/tree.js`'s own comment records the day its function retired: "The `tree()` function itself retired the same day, once its last caller (`ext/Playground`) moved to `ux/Tree`." | — | `ux/Tree/Tree.js` imported by 6 files (`Shell.js`, `ux/Filter`, a nesting study, Make's tree/real, `Sidebar.js`) |
| **CSS** | 175 `.css` files site-wide (104 under `framework/`, 46 under `imagine/`, 10 under `layouts/`, 15 elsewhere) · the 2026-09-17 spacing census counted 1,894 spacing declarations, of which 1,064 are "raw" (not the `--size`/token system) | The token/clamp standard shipped 2026-09-06 (`957 renames, the old names gone`, per the commit log) and the prefix registry (`styles/css-scopes.txt`) are already the site's one system — nothing new needs inventing. | `imagine/paging/paging.css` (1,272 lines total, 131 spacing declarations, 100 of them raw — 1.7× the next-worst file) and its sibling `imagine/paging/make/make.css` (33 declarations, 28 raw) are where the debt is concentrated; `core/Page/generator/generator.css` (75/47) and `imagine/blogx/blogx.css` (59/34) are next. | L (this is one realm's CSS, not a shared component — it is a cleanup, not a merge) | — |
| **Navigation** | `this.crumbs()` (core, one ~7-line definition) · `this.tabs()`/`.vertical` (`ext/tabs/tabs.js`+`tabs.css` — 84/303) · `this.columns()` (core, one definition) · `previews()`/`catalog()`/`browse()` (see the cards row, not re-counted here) · `ext/toc` (`toc.js`+`page.js`+`toc.css` — 176/69) · `core/Search`'s Omnibox (`Omnibox.js`+`Search.js`+`tags.js`+`page.js`+`Search.css` — 846/185) · `app.js`'s own top-level `.nav`, built once | Each mechanism already has exactly one implementation — the overlap here is in the JOB, not the code: several mechanisms all answer "where can I go / where am I," and three of them are not actually live for a visitor today. | Three real, verified findings, not opinions: `ext/toc`'s own CSS excludes `.standard` (`toc.css`: `.pages > .page:not(.standard):has(> .toc)`), so the sticky "on this page" rail is invisible on all 23 of its call sites. The Omnibox's own file comment says it now "lives on ONE page now, not the whole site" (`core/Search/page.js`'s own demo) since 2026-09-06, when a site-wide box was found breaking other pages — so it is not a second, parallel site nav today, just a demo of one. And `app.js`'s built-in top nav is hidden by `hides-nav` on all 11 top-level sections that exist, so it currently has no page left that shows it. | S (delete or fix `toc`'s selector; delete the dead nav bar; leave the Omnibox demoed until someone decides it should be site-wide again) | `toc(` — 23 call sites, 0 visible; `hides-nav` — 11 sites (all of them) |

*Line counts are `wc -l` on the file named; call-site counts are `rg -c`/`rg -l` on the pattern named, run against a live, actively-edited repo on 2026-09-18 — a sibling task landed a Sidebar rewrite while this study was in progress, and the "already merged" verdicts above reflect that.*

---

## What this study did not try to change

Nothing — this is a read-only report. The five merges above are logged as `decision`
lines in this task's `task.jsonl` with `"status": "open"` for whoever picks each one up.
