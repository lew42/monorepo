# demo — show the code and run it from one source; the site's one example mechanism, for any page that shows a thing

## Use
```js
import { demo } from "/app.js";

demo(() => { h1("Hello"); }, "Caption — the code shown IS the code that ran.");
demo.stage(hero);                                                    // the render alone: the one resizable viewport
demo.exhibit({ page: this, stage: s => demo.stage(hero, s), def: hero });   // a detail page: stage, layout bar, definition
demo.app(sample());                                                  // a Page tree playing App and Router in a box
```
`demo.page()`, `demo.tree()`, `demo.layout()` are exhibit sugar; `demo.source()` is the closed code block under a render — all seven at [/framework/ext/demo/api/](/framework/ext/demo/api/).

```js
import { mini } from "/framework/ext/demo/mini.js";

preview(nav){ return this.preview_card(nav, () => mini("tabs")); }   // a card's PICTURE, not a live render
```
`mini(word)` draws a chrome-free wireframe of a page shape — 29 of them, composed from a dozen parts. Live: the palette on [core/Page](/framework/core/Page/).

## Watch out
- A div is not a viewport: a `@media` query inside an example ignores the handle and the simulated width; only an iframe would — [doc/record.md](./doc/record.md) §6.
- The three boxes `.demo-stage › .demo-screen › .demo-render` cannot be merged: `overflow` on the wrong one clips the handle or every render — [doc/decisions.md](./doc/decisions.md).
- `stage.js` must not import `demo.js` (a cycle breaks only on deep reloads), and `demo/` imports neither markdown nor highlight — feature-test, don't import — [doc/decisions.md](./doc/decisions.md).
- The API tab's "Replaced at runtime" banner is wrong on all seven members: unnamed member-expression assignments — [doc/decisions.md](./doc/decisions.md).
- `mini()`: a PART is `.demo-mini-<part>`, a PICTURE `.demo-mini--<word>` — half the words name a part too, and one dash silently put a part's padding and `align-items` on the picture's root (the header of `mini.css` has it).

## More
- [Overview](/framework/ext/demo/) · [API](/framework/ext/demo/api/) — the seven doors, each with its real source
- [doc/record.md](./doc/record.md) — twenty sections of question → options → verdict: the HTML pane, the toolbar, the width presets, the two-up's drag, the exhibit band at 390/810/1440/3440, every open question
- [doc/decisions.md](./doc/decisions.md) — the retired readme: who uses it (counts), trap detail, the two soft dependencies, open items
- `doc/method/*.md`, `doc/file/*.md` — one page per door and per file (the Doc's `methods:` / `files:`)
- Files that matter: `demo.js` (demo, stage, source), `exhibit.js` (exhibit, page, tree), `stage.js` (the one viewport), `mini.js` (the picture a preview card wants instead of a zoomed instance)
- `stage.js` exports `simulate`/`watch`/`magnifier`/`ruler`/`WIDTHS`, `twin.js` exports `pane`/`twin(fn, devices)` — a second caller, `ext/Panel/Workspace/viewports.js`'s device frames; this module's own strip is unchanged
