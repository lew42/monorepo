# Vary — three trees of column-page variations, browsed live

Three small labs under one question each: **scroll** (the scrollbar situation), **tone**
(background hierarchy), **place** (how children get shown). Every variation is its own real
page, previews as nav, one-line verdict at the end.

## Use

Open [/imagine/vary/](/imagine/vary/) and click through — nothing here is a config option,
every variation is a page you can link to.

## Watch out

- `demo.app(root)` only re-marks `root.chain()` — a `classes: "default"` cascade three levels
  deep loses its mark past depth 1 unless you hand `demo.app()` the **deepest** page, not the
  root (`tone/up/page.js` and its siblings; same fix `examples/looks/backgrounds` already used).
- `width: "full"` collapses the site's own left sidebar to 0 width, even nested correctly —
  reproduces on the framework's own `core/Page/overview/columns/finder/guides/words/full/`, so
  it's a core `Page.css` behavior, not a `vary/` bug. `scroll/full/` shows it deliberately.

## More

- Prior art (read, not modified): [`core/Page/overview/columns/examples/`](/framework/core/Page/overview/columns/examples/)
- The mechanism these labs vary: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md)
- Files: `scroll/`, `tone/`, `place/` — each a `page.js` index + one `page.js` per variation,
  plus one `.css` per lab (`scroll.css`, `tone.css`, `place.css`)
