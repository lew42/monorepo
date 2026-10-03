# Ext — opt-in addons for the framework: an ext may patch core, vendor a dependency, ship its own CSS; core never imports an ext, and this site opts in once, in `app.js`

## Index
- [AITask](./AITask/) — the AI working log, rendered: one task, a day, the highlights wall, the board — use it to show task logs
- [Ask](./Ask/) — talk to a Claude Code session from the browser (dev server, localhost only)
- **CSSDoc** (`ext/CSSDoc/`, no page yet) — every CSS rule that lands on one element, read live from the CSSOM — use it to see why an element looks as it does
- [Chat](./Chat/) — a chat log that follows new messages only while you are at the bottom
- [DesignTool](./DesignTool/) — measures a layout numerically: what is broken, off or good; no AI at runtime
- [Doc](./Doc/) — document a module as a page (Overview, API, Docs, Files) — use it in a module's `page.js`
- [Draggable](./Draggable/) — grab-and-move for any View; `Sortable` reorders, crosses lists and nests
- [Dropdown](./Dropdown/) — pick one choice from a list; the list opens in the top layer so nothing clips it
- [JSONL](./JSONL/) — append-only `.jsonl` logs replayed into object state — what the task and day logs use
- [Omnibox](./Omnibox/) — moved into core on 2026-09-06; this directory is only a pointer
- [Panel](./Panel/) — chrome for arranging a region: divide, drag, align, fill, persist — for wireframing pages
- [panel2](./panel2/) — header/main/footer chrome you ship: an optional sidebar that becomes a drawer, a resizable split, a dashboard grid
- [Research](./Research/) — a question dug by several minions into append-only files, rendered live with credence per claim
- [Saver](./Saver/) — `save` / `load` / `delete` over one write queue, for anything that persists JSON
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
