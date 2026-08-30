# Feeds — embeds and data-driven pages

Three small labs: **video** (a lazy YouTube picker), **data** (one `data.json`, three
renderings, one filter), **live** (one keyless public API). Previews as nav, one-line
verdict on every leaf.

## Use

Open [/imagine/feeds/](/imagine/feeds/) and click through — nothing here is a config
option, every variation is a real page you can link to.

## Watch out

- **No iframe before the click.** `video/`'s `stage()` builds a poster `<img>` and a play
  `<button>` synchronously; the `<iframe>` (`youtube-nocookie.com`) is only appended inside
  the click handler. Verified headless: zero iframes on load, one after, correct `src`.
- **`data/`'s filter lives on the PARENT, not the three views.** `Cards`, `Tree` and
  `Table` are all `this.parent.filtered()` — one text box, one chip row, no per-view
  filter code. See [`doc/decisions.md`](./doc/decisions.md).
- **Every fetch is built-box-then-fill, never build-after-await.** `data/` and `live/`
  both capture their box synchronously in `content()` and only ever touch it inside a
  `watch()` callback — the trap this whole module exists to demonstrate the fix for.
- **`live/` fails quietly.** A blocked network shows one `.feeds-offline` note, never a
  blank column — verified headless with the request aborted.
- Real `<button>`s (the play button, the filter chips) need `(0,3,0)` in `@layer theme` to
  beat the site theme's `.theme-lew42 :is(button, .btn)` CTA rule — same fight
  `/imagine/imagine.css` documents. See `feeds.css`.

## More

- [Feeds](/imagine/feeds/) · [Video](/imagine/feeds/video/) · [Data](/imagine/feeds/data/) ·
  [Live](/imagine/feeds/live/)
- The column shape these pages sit in: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)
- Deliberation and rejected alternatives: [`doc/decisions.md`](./doc/decisions.md)
- Files: `video/page.js` (picker + lazy stage), `data/page.js` + `data.json` (the filter,
  the fetch) with `data/cards|tree|table/page.js` (the three renderings), `live/page.js`
  (the weather dashboard), `feeds.css` (one sheet for all three)
