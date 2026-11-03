# Ext — opt-in addons for the framework: an ext may patch core, vendor a dependency, ship its own CSS; core never imports an ext, and this site opts in once, in `app.js`

**What goes here, and what goes in `ai/`:** an ext is an opt-in addon any page can use. A module that exists only to run, show or feed an AI agent or model lives in [`ai/`](../ai/readme.md) instead (rule at its top; census: [module-homes.md](../ai/doc/module-homes.md)). Ask, Refine, Research, Collab and Session are strictly AI and are proposed to move there next.

## Index
- [AITask](./AITask/) — moved to [ai/AITask](../ai/AITask/) on 2026-10-13; this folder is a pointer
- [Ask](./Ask/) — talk to a Claude Code session from the browser (dev server, localhost only)
- **CSSDoc** (`ext/CSSDoc/`, no page yet) — every CSS rule that lands on one element, read live from the CSSOM — use it to see why an element looks as it does
- [Chat](./Chat/) — a chat log that follows new messages only while you are at the bottom
- [DesignTool](./DesignTool/) — measures a layout numerically: what is broken, off or good; no AI at runtime
- [Doc](./Doc/) — document a module as a page (Overview, API, Docs, Files) — use it in a module's `page.js`
- [Figma](./Figma/) — tracked Figma files as JSONL + screenshots, browsed as previews, designs rebuilt as pages
- [Draggable](./Draggable/) — grab-and-move for any View; `Sortable` reorders, crosses lists and nests
- [Dropdown](./Dropdown/) — pick one choice from a list; the list opens in the top layer so nothing clips it
- [JSONL](./JSONL/) — append-only `.jsonl` logs replayed into object state — what the task and day logs use
- [Omnibox](./Omnibox/) — moved into core on 2026-09-06; this directory is only a pointer
- [Panel](./Panel/) — chrome for arranging a region: divide, drag, align, fill, persist — for wireframing pages
- [panel2](./panel2/) — header/main/footer chrome you ship: an optional sidebar that becomes a drawer, a resizable split, a dashboard grid
- [Research](./Research/) — a question dug by several minions into append-only files, rendered live with credence per claim
- [Saver](./Saver/) — `save` / `load` / `delete` over one write queue, for anything that persists JSON
- [Query](./Query/) — ask node for just the rows a page shows: a query as JSON over in-memory sources (dev server)
- [Shots](./Shots/) — screenshot a page at its widths, diff each round against the last, judge with a click — the dev bar's Screenshots tab and `/framework/ext/Shots/` share one view
- [Timeline](./Timeline/) — horizontal or vertical timeline for dated items
- [catalog](./catalog/) — `catalog()` rail and `browse()` wall of `previews()` — use it for an index page
- [demo](./demo/) — show the code and run it from one source — the site's example mechanism
- [depth](./depth/) — turn a page into a 3D scene: layers drift on scroll and lean with the pointer
- [drawer](./drawer/) — the right rail beside the page; it pushes the page, never covers it
- [editor](./editor/) — drag-and-drop block builder prototype — a page you visit, not a module you import
- [files](./files/) — a tree of real files on disk, with the one you clicked shown beside it
- [grip](./grip/) — a rail's resize edge (strip plus a pill on the pointer), shared by drawer, DevBar and Sidebar
- [highlight](./highlight/) — syntax highlighting on the `code` factory
- [layout](./layout/) — a toolbar over anything, and a right-hand drawer that pushes the page
- [markdown](./markdown/) — `md()` for prose and `md.file()` for a whole `.md`
- [sprawl](./sprawl/) — a wall of big sections that balances its own columns by real height, first used by `/framework/`
- [System](./System/) — a generic container for anything we keep in order: files, rules, `check()`, `report()`; one instance per module
- [tabs](./tabs/) — a bar of links and the panel its children mount into
- [toc](./toc/) — this page's own headings as a right-hand nav

## Use
```js
import { md, demo } from "/app.js";  // opted in by app.js — anything else, import its module: "/framework/ext/Panel/Panel.js"
```
## Watch out
- Two exts patching the same core method compose only by import order — nothing detects a second patcher (`html_unsafe` has one today, `highlight`) — [`decisions.md`](./decisions.md)
- `markdown/marked.esm.js` and `highlight/hljs/` are vendored third-party code — a fix goes upstream or in the wrapper (`md.js`, `highlight.js`), not inside them — [`decisions.md`](./decisions.md)
- Before deleting an ext, know who leans on it — a soft lean degrades (`demo` → `highlight`), a hard one throws (`Doc` → `tabs`, `files`) — [`decisions.md`](./decisions.md)
## More — [Overview](/framework/ext/) · [`decisions.md`](./decisions.md): the rule in full, cross-module traps, what's open (`editor` in use? `DesignTool` under `dev/`?)

## Also here (readme audit, 2026-10-13)
- [Classify](./Classify/) — light overlay that outlines layout classes
- [Collab](./Collab/) — mastermind members move through phases to a vote, as a live object
- [DataGrid](./DataGrid/) — a grid for records: table or card rail, a setting not a class
- [ErrorLog](./ErrorLog/) — UI errors logged, one line per session
- [filesystem](./filesystem/) — file and directory objects: FsFile, Dir, links
- [Mention](./Mention/) — #Page and @owner icons and words in written content
- [Refine](./Refine/) — prompt refinement: raw to clean to cards with flags
- [Session](./Session/) — voice session started by the ✦ press, fast and smart assistants
