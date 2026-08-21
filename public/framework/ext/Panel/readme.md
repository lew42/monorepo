# Panel — chrome for arranging: divide, drag, align, fill and persist any region; for wireframing pages, not shipping them

## Use
```js
import panel, { workspace } from "/framework/ext/Panel/workspace.js";

panel(() => { h3("Anything"); p("…in one managed panel."); });   // no saver
panel("clock");                                 // …or any name in the T vocabulary
workspace();                                    // the persisted document
workspace({ mode: "document" });                // …opened as a scrolling stack of sections (the site's own pages do)
workspace({ saver, templates, seed });          // yours: own file, own T vocabulary
new Workspace(options).mount();                 // ./Workspace/ — a SECOND view of the same root

item.set("display", "grid").set("cols", 3);     // the words — all of them in the RAIL, none on the bar
                                                // pad(+knob) · dir gap(+knob) wrap justify items · cols dense
root.set("mode", "document");                   // …the ROOT's word: one screen, or a scrolling document
panel(structure("docs"));                       // …or one of nine presets, as panels

new Panel().restyle(item);                      // SPLIT's own verb: item's look, copied once — not mirror()

// A panel is a DIV in flow: h hug (floor --panel-min), w fill. Right/bottom edge: drag = size, right-click = reset
panel(seed);                                    // …no --panel-height: the workspace follows its root and GROWS as you add

scrubber($ws);                                  // ./flow.js — the strip that replays what you built
```

## Careful — selection, and the sparse bar
- **One selection per PAGE** — exactly one panel selected or none, every live view of it ringed, the rail agreeing; and **hover shows what a click would select**, from the same `drill()`. `focus.js` is the only writer of either; clear the whole document, never one workspace: [doc/focus.md](./doc/focus.md)
- **Selection has to *feel* right.** A deselect that leaves the orange ring is a smell; so is an action that drops the selection and makes you pick the panel again. Eight of those were real bugs, and the rail is shared with `ext/layout`: [doc/focus.md](./doc/focus.md)
- **Grouping, multi-select and multi-edit are one design, not three** — a rail editing *n* panels needs a story for a word they disagree on, and `focus` is a single id today. Design them together.
- **The bar is deliberately sparse until the words settle** (2026-08-19: 15 controls → 6). It is what a hand does — split, close, drag, `tune`. **The rail is the UI**: [doc/decisions.md](./doc/decisions.md)

## Watch out
- A body's arrangement is `--panel-tracks`, never `--panel-cols` — that name is already the pickers' own column count, and a custom property written on a body inherits into anything drawn in it: [doc/words.md](./doc/words.md)
- Every shipped `T` entry wraps its drawing in one div, so the display words have one child to arrange — `cells` is the exception: [doc/words.md](./doc/words.md)
- `root.toJSON()` is not a snapshot — its `data` and its children are the LIVE ones, so a step recorded from it rewrites itself on the next `set()`: [doc/flow.md](./doc/flow.md)
- `insert.js`'s `+` still wins its OWN split's interior grip at the seam's very start (accepted since 2026-08-16) — only a NESTED split's own edge coinciding with a DIFFERENT grip was a bug, fixed by insetting the stub 0.7rem off that edge: [doc/decisions.md](./doc/decisions.md)
- Anything `view()` binds must hand back a disposer — a teardown that waits to detect its own death leaks observers by the thousand: [doc/decisions.md](./doc/decisions.md)
- A `flex: 1 1 0` child of a box that is measuring itself resolves to ZERO — a hugging panel read 0px until its body took an auto basis: [doc/sizing.md](./doc/sizing.md)
- `.panel-workspace` and `.panel-items` must keep `position: relative` — `container-type: size` was the containing block a *floating* panel landed in, by accident: [doc/decisions.md](./doc/decisions.md)
- `mode: document` makes a split below *append* a section, and nothing in a document divides the block axis — 16em is a floor, not a height: [doc/words.md](./doc/words.md)
- Never add a `panel.js` beside `Panel.js` — case-insensitive NTFS folds them into one file: [doc/decisions.md](./doc/decisions.md)
- A headless probe that clicks a picker rewrites `/data/panels.json` over the dev socket, past `page.route()` — block with `page.routeWebSocket`: [doc/decisions.md](./doc/decisions.md)
- Material Icons is a ligature font — a name it lacks renders as the word, ~400px wide; measure before adding to `glyphs.js`: [doc/decisions.md](./doc/decisions.md)
- `paint()` blanks silently on an unknown template name; `T` and `generate.js` both write them, so ship both in one commit: [doc/generator.md](./doc/generator.md)
- Five surfaces drawn on one body share a z-index budget and two "innermost wins" idioms: [doc/overlays.md](./doc/overlays.md)
- Two SEPARATE `Workspace`s (or the old `workspace()`) on one file still race — one root, one `Workspace`, `mount()` again for a second view: [`Workspace/doc/decisions.md`](./Workspace/doc/decisions.md)
- A feature without a demo is undemonstrated — add the flow when you add the feature: [`demo/`](/framework/ext/Panel/demo/)
- A `group` word (on/off) on any split gates hover behind one outer click, Figma-style — `live_words()` is leaf-only and can't say "splits only", so `properties.js` hand-draws the toggle beside `dir`: [doc/focus.md](./doc/focus.md)
- A binary word is ONE lit button, never a row of two names — `toggle: true` in `WORDS`; `template` and `display` are dropdowns (`drop: true`), everything else a row of pictures: [doc/words.md](./doc/words.md)
- A panel inside a panel IS a split — the leaf's content becomes its first child; drop on a leaf's centre to nest, on an edge to sit beside. An EMPTY leaf (nothing chosen) has no content to relocate: the dropped panel becomes its only child and keeps its own tone/words as the container: [doc/decisions.md](./doc/decisions.md)

## More
- [/framework/ext/Panel/](/framework/ext/Panel/) — the page
- [`Workspace/`](./Workspace/) — holds the root; documents as files, a bar above it: [readme](./Workspace/readme.md)
- [`playground/`](./playground/) — the whole-window home: a document, its viewport set (fill/one/all/twin), the drawer as the responsive handle
- Demo — every feature, as a flow beside a follow-along: [/framework/ext/Panel/demo/](/framework/ext/Panel/demo/)
- [`doc/decisions.md`](./doc/decisions.md) — every verdict, trap and open item, with measurements, and the readme as it stood before 2026-08-17
- [`doc/words.md`](./doc/words.md) — the `WORDS` table the rail reads, toggles and dropdowns, how a word lands on a body
- [`doc/flow.md`](./doc/flow.md) — every gesture is a step you can replay; why snapshots and not diffs, and what a step costs
- [`doc/sizing.md`](./doc/sizing.md) — a grip writes grow ratios, `fixed` takes a length, `hug` measures; what a section keeps without the chrome
- [`doc/templates.md`](./doc/templates.md) — sizing a `T` entry; [`doc/generator.md`](./doc/generator.md) — `space` draws a layout, `structure(seed)` builds it from panels
- [`doc/focus.md`](./doc/focus.md) — selection, the `properties` rail, and the three ways a SHARED rail bit; [`doc/overlays.md`](./doc/overlays.md) — the five body surfaces
- `doc/file/`, `doc/method/`, `doc/property/` — one note per file, verb and property, rendered on the page
- Files that matter: `Panel.js` (verbs, mirrors, defaults), `workspace.js` (the two doors, the redraw, the recursive `view()`), `templates.js` (the `T` vocabulary), `size.js` (per-axis fill/hug/fixed)
- `workspace.js`'s four neighbours, each read by it and none reading it back: `vocab.js` (what a document was opened with — its templates, its tool flags), `focus.js` (the selection), `overlays.js` (the live chrome on a body, and the disposers that release it), `paint.js` (one panel's own DOM)
- Uses [`ext/Dropdown`](/framework/ext/Dropdown/) for the rail's `template` and `display` pickers — a list in the top layer, so nothing clips it
- Consumers: [`ext/editor`](/framework/ext/editor/) shell, [`/framework/`](/framework/) clock, [`space/compose`](/framework/styles/layouts/space/compose/) rolls
- Every panel is a plain [`Item`](/framework/core/Item/) (`items` a `List`, events, a `Saver`) — history, undo and persistence are `Item`/`List` features every panel inherits for free, never something `Panel` builds itself

## Item words (2026-08-19)
```js
// inside a flex/grid leaf, click a cell twice (leaf first, then its item) — the rail
// grows grow/basis/order/self (flex) or span/row-span/self (grid) under the leaf's own rows
```
No subclass: an item is an element with words, not a `Panel` — [doc/focus.md](./doc/focus.md), [doc/words.md](./doc/words.md).
