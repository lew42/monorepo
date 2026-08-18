# Ext — opt-in addons for the framework: an ext may patch core, vendor a dependency, ship its own CSS; core never imports an ext, and this site opts in once, in `app.js`
## Use
```js
import { md, demo } from "/app.js";  // opted in by app.js — anything else, import its module: "/framework/ext/Panel/Panel.js"
```
## Watch out
- Two exts patching the same core method compose only by import order — nothing detects a second patcher (`html_unsafe` has one today, `highlight`) — [`decisions.md`](./decisions.md)
- `markdown/marked.esm.js` and `highlight/hljs/` are vendored third-party code — a fix goes upstream or in the wrapper (`md.js`, `highlight.js`), not inside them — [`decisions.md`](./decisions.md)
- Before deleting an ext, know who leans on it — a soft lean degrades (`demo` → `highlight`), a hard one throws (`Doc` → `tabs`, `files`) — [`decisions.md`](./decisions.md)
## More — [Overview](/framework/ext/) · [`decisions.md`](./decisions.md): the rule in full, cross-module traps, what's open (`editor` in use? `DesignTool` under `dev/`?)
- [markdown](/framework/ext/markdown/) — `md()`, vendored marked
- [demo](/framework/ext/demo/) — show code, run
- [highlight](/framework/ext/highlight/) — vendored hljs highlighting
- [files](/framework/ext/files/) — file tree panels
- [toc](/framework/ext/toc/) — headings as nav
- [Doc](/framework/ext/Doc/) — module as page
- [tabs](/framework/ext/tabs/) — link bar, panel
- [catalog](/framework/ext/catalog/) — previews as rail
- [layout](/framework/ext/layout/) — toolbar, push drawer
- [drawer](/framework/ext/drawer/) — the right rail
- [depth](/framework/ext/depth/) — 3D scroll scene
- [DesignTool](/framework/ext/DesignTool/) — measures, scores layouts
- [Saver](/framework/ext/Saver/) — document write queue
- [Draggable](/framework/ext/Draggable/) — drag, reorder, nest
- [editor](/framework/ext/editor/) — drag-drop builder prototype
- [Panel](/framework/ext/Panel/) — arrange regions, persist
- [Timeline](/framework/ext/Timeline/) — h/v zoomable timeline
- [AITask](/framework/ext/AITask/) — task log, rendered
- [JSONL](/framework/ext/JSONL/) — append-only log replay
- [Ask](/framework/ext/Ask/) — browser to Claude
- [CSSDoc](/framework/ext/CSSDoc/readme.md) — every rule that lands on one element, read live from the CSSOM (no page of its own yet; it runs on [styles/elements/code](/framework/styles/elements/code/))
