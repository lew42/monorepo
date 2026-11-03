# Workspace — holds a Panel root; documents as files; a bar above it

## Use
```js
import { workspace } from "/framework/ext/Panel/workspace.js";
import Workspace from "/framework/ext/Panel/Workspace/Workspace.js";

workspace(options);                       // the thin door — unchanged, every caller
const ws = new Workspace(options);        // saver templates tools seed mode flow height center
ws.mount();                               // another box, the SAME root — N viewports = N views of ONE root
ws.mode = "document";                     // reads/writes root.data.mode
ws.vp.set("all");                         // fill · one · all · twin — the viewport SET, ./viewports.js

import { list, create, open, remove } from "./documents.js";
await create();                           // mints untitled, untitled-2… → /data/panels/<name>.json
```

## Watch out
- `Workspace` HOLDS a `Panel` root — it never `extends` it, or `toJSON()` would write bar chrome into the document file: [doc/decisions.md](./doc/decisions.md)
- Two SEPARATE `Workspace`s on one file still race (each loads its own copy) — one root, one `Workspace`, `mount()` again for a second view: [doc/decisions.md](./doc/decisions.md)
- `flow` defaults to `true` only for `mode: document` — `ext/editor`/`ext/files`/`space/compose` pass no mode and get no recorder, unless they ask: [doc/decisions.md](./doc/decisions.md)
- `default` is `/data/panels.json`, unmoved — every other document is `/data/panels/<name>.json`; `directory.json` never sees any of them: [doc/documents.md](./doc/documents.md)
- All seven viewport boxes (fill + four device frames + two twin panes) mount ONCE — `mount()` only grows `$roots[]`, there is no `unmount`, so a mode switch shows/hides rather than rebuilds: [doc/viewports.md](./doc/viewports.md)
- `pane()`'s `flex: width/height 1 0` only means WIDTH as a direct child of a row — nest it in a column wrapper and `twin`'s two panes stop landing on one height: [doc/viewports.md](./doc/viewports.md)

## More
- [`doc/decisions.md`](./doc/decisions.md) — holds-not-extends, the `$roots[]` seam, the flow default, what is still open
- [`doc/documents.md`](./doc/documents.md) — the file layout, the index, why not `directory.json`
- [`doc/viewports.md`](./doc/viewports.md) — fill/one/all/twin, Fit vs 100%, the dial and the readout
- Files: `Workspace.js` (the class, the bar), `documents.js` (list/open/create/remove), `viewports.js` (the viewport set), `workspace.css`
- Parent: [`ext/Panel`](../) — `workspace()`'s door lives in `../workspace.js`, which is the one file that imports this one back
- Whole-window home: [`../playground/`](../playground/) — a document, its viewport set, the drawer as the responsive handle
