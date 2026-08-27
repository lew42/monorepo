# Page overview — the palette: one card per building block, and every card is a picture

Four bands, declared as `BANDS` in [`page.js`](../page.js) — the source of truth for what's on the wall and in what order. The first band is the [page generator](/framework/core/Page/generator/)'s own block words, so the wall IS the list of things a generated page can be made of.

**Add a card:** a directory here with a `page.js`, its name in the right band's string, and a picture for that name in [`ext/demo/mini.js`](/framework/ext/demo/) — a missing picture silently falls back to `prose`.

## Watch out

- **The cards are drawn centrally**, by the `add()` override in `page.js`'s `overview_section()` — a page's own `preview()` is *not* what shows here. A palette has to be one hand at one scale; the old wall was a live app zoomed to 0.5 per card and no two alike.
- **No band under six.** `browse()`'s grid collapses its empty tracks, so a band of two stretched its cards to 659px at 1920 and ~1400px at 3440.
- A picture is `.demo-mini--<word>`, **two dashes** — half the words (`tabs`, `rail`, `list`, `crumbs`, `strip`) name a part too.
