# demo — show the code and run it from one source; the site's one example mechanism, for any page that shows a thing

## Use
```js
import { demo } from "/app.js";
import rail from "/web/nav/rail/page.js";

demo(() => { h1("Hello"); }, "Caption — the code shown IS the code that ran.");
rail.demo({ min: "26em" });   // any page, as a demo PAGE: path, stage, bar, source column
demo.stage(hero);             // the render alone: the one resizable viewport
demo.app(sample());           // a Page tree playing App and Router in a box
```
`page.demo()` is the whole demo UX and the only thing that draws one. `demo.exhibit()`, `demo.page()`, `demo.tree()` and `demo.layout()` are page **shapes** over it — `children:` factories — and `demo.source()` is the shell's own code block on its own. Each at [/framework/ext/demo/api/](/framework/ext/demo/api/); prototype and prose at [Shell](/framework/ext/demo/shell/).

**Landed 2026-08-30 — the merge: 14 render variants to 6.** `demo(fn)`, `page.demo()`, `mini()`, and three engines (`stage`, `demo.app`, `layout.bar`). Deleted: `demo.stage.two()`, `two.js`, `two.css`, `twin()`, the `<details>` expando. The audit and the five-step order are in [ai/2026-08-30/demo-merge/proposal.md](/framework/ai/2026-08-30/demo-merge/); what each step actually did is in [doc/decisions.md](./doc/decisions.md).

Four rules `page.demo()` cannot break: the **path** is always above, the **width readout** always under the render, the **source is a column** beside the render where there is room and a block under it where there isn't, and the render has **no height, only a floor** (`min:`). There is deliberately no `height` — that is what silently cut 17 demos off.

```js
import { mini } from "/framework/ext/demo/mini.js";

preview(nav){ return this.preview_card(nav, () => mini("tabs")); }   // a card's PICTURE, not a live render
```
`mini(word)` draws a chrome-free wireframe of a page shape — 29 of them, composed from a dozen parts. Live: the palette on [core/Page](/framework/core/Page/).

## Watch out
- `page.demo()` renders a page's **memoized view**, so demoing a page the real Router also shows moves that view into the box. Import a page the site does not route to, or use `sample()`.
- The band splits into two columns from ~1310px of **its own** width, not the window's — a page whose chrome leaves less than that stacks the code under the render, which at that width reads better than a 350px column. Measured at 400/1920/3440.
- `demo.app()` defaults to `{ urls: false }`: an in-memory tree emits `data-demo-url`, not an `href` that 404s on middle-click, open-in-new-tab and every crawler. Pass `{ urls: true }` when `scope:` is a real page (`page.demo()`, ext/demo/shell.js) — [doc/method/app.md](./doc/method/app.md).
- `demo.app()` prints its own width readout now — hidden by CSS inside a stage (the stage has one) and inside a preview card (a number at `zoom: 0.25` is noise, and every row of it comes off the thumbnail's crop).
- `demo()` prints the function it ran, so a comment written *inside* the callback is published as part of the lesson. Explain it above the call.
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
- Files that matter: `shell.js` (`page.demo()` — the one demo UX), `demo.js` (demo, stage, `source_block()`), `exhibit.js` (exhibit, page, tree — shapes over the shell), `stage.js` (the one viewport), `mini.js` (the picture a preview card wants instead of a zoomed instance)
- `stage.js` exports `simulate`/`watch`/`drag`/`magnifier`/`ruler`/`WIDTHS`; `pane.js` (was `twin.js`) exports one device frame, for `ext/Panel/Workspace/viewports.js`
