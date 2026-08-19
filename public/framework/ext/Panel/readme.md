# Panel — chrome for arranging: divide, drag, align, fill and persist any region; for wireframing pages, not shipping them

## Use
```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…in one managed panel."); });   // no saver
panel("clock");                                 // …or any name in the T vocabulary
workspace();                                    // the persisted document
workspace({ mode: "document" });                // …opened as a scrolling stack of sections (the site's own pages do)
workspace({ saver, templates, seed });          // yours: own file, own T vocabulary

item.set("display", "grid").set("cols", 3);     // the words: dir gap wrap justify items · cols dense
root.set("mode", "document");                   // …the ROOT's word: one screen, or a scrolling document
panel(structure("docs"));                       // …or one of nine presets, as panels

scrubber($ws);                                  // ./flow.js — the strip that replays what you built
```

## Watch out
- A body's arrangement is `--panel-tracks`, never `--panel-cols` — that name is already the pickers' own column count, and a custom property written on a body inherits into anything drawn in it: [doc/words.md](./doc/words.md)
- Every shipped `T` entry wraps its drawing in one div, so the display words have one child to arrange — `cells` is the exception: [doc/words.md](./doc/words.md)
- `root.toJSON()` is not a snapshot — its `data` and its children are the LIVE ones, so a step recorded from it rewrites itself on the next `set()`: [doc/flow.md](./doc/flow.md)
- `insert.js`'s `+` sits over a seam at `z-index: 5` and eats the drag — a nested column split's bar covers the middle of the outer seam: [doc/flow.md](./doc/flow.md)
- Anything `view()` binds must hand back a disposer — a teardown that waits to detect its own death leaks observers by the thousand: [doc/decisions.md](./doc/decisions.md)
- `container-type` measures a box as if it were empty — hug *declares* `--panel-hug`, it never measures: [doc/templates.md](./doc/templates.md)
- `mode: document` makes a split below *append* a section — and a section never grows with its content, in any mode: [doc/words.md](./doc/words.md)
- Never add a `panel.js` beside `Panel.js` — case-insensitive NTFS folds them into one file: [doc/decisions.md](./doc/decisions.md)
- A headless probe that clicks a picker rewrites `/data/panels.json` over the dev socket, past `page.route()` — block with `page.routeWebSocket`: [doc/decisions.md](./doc/decisions.md)
- Material Icons is a ligature font — a name it lacks renders as the word, ~400px wide; measure before adding to `glyphs.js`: [doc/decisions.md](./doc/decisions.md)
- `paint()` blanks silently on an unknown template name; `T` and `generate.js` both write them, so ship both in one commit: [doc/generator.md](./doc/generator.md)
- Five surfaces drawn on one body share a z-index budget and two "innermost wins" idioms: [doc/overlays.md](./doc/overlays.md)
- Three live mounts share one document (`/`, `/full/`, a task page) — the last writer wins: [doc/decisions.md](./doc/decisions.md)

## More
- [/framework/ext/Panel/](/framework/ext/Panel/) — the page; [`/full/`](/framework/ext/Panel/full/) is the same workspace filling the window
- [`doc/decisions.md`](./doc/decisions.md) — every verdict, trap and open item, with measurements, and the readme as it stood before 2026-08-17
- [`doc/words.md`](./doc/words.md) — the `WORDS` table both control surfaces read, how a word lands on a body, how to add one
- [`doc/flow.md`](./doc/flow.md) — every gesture is a step you can replay; why snapshots and not diffs, and what a step costs
- [`doc/templates.md`](./doc/templates.md) — sizing a `T` entry; [`doc/generator.md`](./doc/generator.md) — `space` draws a layout, `structure(seed)` builds it from panels
- [`doc/focus.md`](./doc/focus.md) — selection and the `properties` inspector; [`doc/overlays.md`](./doc/overlays.md) — the five body surfaces
- `doc/file/`, `doc/method/`, `doc/property/` — one note per file, verb and property, rendered on the page
- Files that matter: `Panel.js` (verbs, mirrors, defaults), `workspace.js` (the two doors, the redraw, the recursive `view()`), `templates.js` (the `T` vocabulary), `size.js` (per-axis fill/hug/fixed)
- `workspace.js`'s four neighbours, each read by it and none reading it back: `vocab.js` (what a document was opened with — its templates, its tool flags), `focus.js` (the selection), `overlays.js` (the live chrome on a body, and the disposers that release it), `paint.js` (one panel's own DOM)
- Consumers: [`ext/editor`](/framework/ext/editor/) shell, [`/framework/`](/framework/) clock, [`space/compose`](/framework/styles/layouts/space/compose/) rolls
