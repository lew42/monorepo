# Panel — chrome for arranging: divide, drag, align, fill and persist any region; for wireframing pages, not shipping them

## Use
```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…in one managed panel."); });   // no saver
panel("clock");                                 // …or any name in the T vocabulary
workspace();                                    // the persisted document
workspace({ saver, templates, seed });          // yours: own file, own T vocabulary
```

## Watch out
- Anything `view()` binds must hand back a disposer — a teardown that waits to detect its own death leaks observers by the thousand: [doc/decisions.md](./doc/decisions.md)
- `container-type` measures a box as if it were empty — hug *declares* `--panel-hug`, it never measures: [doc/templates.md](./doc/templates.md)
- Never add a `panel.js` beside `Panel.js` — case-insensitive NTFS folds them into one file: [doc/decisions.md](./doc/decisions.md)
- A headless probe that clicks a picker rewrites `/data/panels.json` over the dev socket, past `page.route()` — block with `page.routeWebSocket`: [doc/decisions.md](./doc/decisions.md)
- Material Icons is a ligature font — a name it lacks renders as the word, ~400px wide; measure before adding to `glyphs.js`: [doc/decisions.md](./doc/decisions.md)
- `paint()` blanks silently on an unknown template name; `T` and `generate.js` both write them, so ship both in one commit: [doc/generator.md](./doc/generator.md)
- Five surfaces drawn on one body share a z-index budget and two "innermost wins" idioms: [doc/overlays.md](./doc/overlays.md)
- Three live mounts share one document (`/`, `/full/`, a task page) — the last writer wins: [doc/decisions.md](./doc/decisions.md)

## More
- [/framework/ext/Panel/](/framework/ext/Panel/) — the page; [`/full/`](/framework/ext/Panel/full/) is the same workspace filling the window
- [`doc/decisions.md`](./doc/decisions.md) — every verdict, trap and open item, with measurements, and the readme as it stood before 2026-08-17
- [`doc/templates.md`](./doc/templates.md) — sizing a `T` entry; [`doc/generator.md`](./doc/generator.md) — `space` draws a layout, `structure(seed)` builds it from panels
- [`doc/focus.md`](./doc/focus.md) — selection and the `properties` inspector; [`doc/overlays.md`](./doc/overlays.md) — the five body surfaces
- `doc/file/`, `doc/method/`, `doc/property/` — one note per file, verb and property, rendered on the page
- Files that matter: `Panel.js` (verbs, mirrors, defaults), `workspace.js` (the two doors, the redraw, the recursive `view()`), `templates.js` (the `T` vocabulary), `size.js` (per-axis fill/hug/fixed)
- `workspace.js`'s four neighbours, each read by it and none reading it back: `vocab.js` (what a document was opened with — its templates, its tool flags), `focus.js` (the selection), `overlays.js` (the live chrome on a body, and the disposers that release it), `paint.js` (one panel's own DOM)
- Consumers: [`ext/editor`](/framework/ext/editor/) shell, [`/framework/`](/framework/) clock, [`space/compose`](/framework/styles/layouts/space/compose/) rolls
