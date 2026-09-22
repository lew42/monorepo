# Browse — every layout on the whole site in one wall, so the owner can approve or improve each one

The owner asked for this in one sentence: *"part of that might require me going through layout
by layout and either approving it or recommending what needs to change. So I think to do that,
we need a layout browser."* [/layouts/browse/](/layouts/browse/) is that browser — every
layout the site owns, as a picture, in three tiers, with two buttons on each one. The tier
strip counts them live, so trust that and not any number written into a sentence here.

**The three tiers** are the owner's own split between the big shapes and the small ones:

- **Global** — the shape of a whole page: the approved layouts, the ids of the layout standard
  next door (the numbered-arrangement lab that used to sit at `/imagine/layouts/` was folded
  into those same ids 2026-09-18), the app shells.
- **Sections** — a band *inside* a page: the sections realm, the `/imagine/paging/` templates,
  the full-screen experiences in `/layouts/labs/screens/`.
- **Components** — the pieces a band is made of: `framework/ui` and `framework/ux`. The
  "mobile card UI" tier.

## Use

- [/layouts/browse/](/layouts/browse/) — the three walls. A card is a picture, a name and a
  verdict mark; the tier strip at the top jumps between the walls and counts what is approved.
- [/layouts/browse/shell-left/](/layouts/browse/shell-left/) — one item: the thing at 400,
  1920 and 3440, a link to the real page, **Approve** / **Improve**, and why it is the way it
  is (its module's own watch-outs and decisions, fetched and quoted).

**A verdict is one appended line** in [`../verdicts.jsonl`](/layouts/verdicts.jsonl):

```json
{"verdict": {"at": "2026-09-17T17:06:06-05:00", "item": "shell-left", "say": "approve", "note": ""}}
```

Nothing is ever overwritten, so changing your mind is simply a later verdict and the newest
one is the mark. **The owner is the only writer** — no agent casts a verdict.

**Adding or refreshing an item** is `items.json`, never a page:
[`doc/inventory.md`](./doc/inventory.md) has the shape, where each item came from, and the
script that rebuilt the file.

## Watch out

- **Approve/Improve follow the site's one edit switch, `ext/Ask/edit.js`'s `edit()`** — true
  on the dev server with the rail's "edit" checkbox on, false off localhost or with the
  checkbox off, and either way the buttons are not drawn at all; the page says why. Reading
  still works everywhere — it is a fetch of the same file. [`doc/decisions.md`](./doc/decisions.md)
- **A card is a picture, never a live instance.** A wall of live pages would be a module load
  per card. The layout standard's own ids draw a wireframe from `layouts.json` live; everything
  else is a jpeg in `shots/`, taken once. [`doc/inventory.md`](./doc/inventory.md)
- **A component's jpeg is clipped to its demo, not to its page** — 126 of the 246 are a 16/9
  frame grown around `.demo-stage` / `.paging-frame`, because a full screenshot of a doc page
  makes thirty cards look identical. [`doc/inventory.md`](./doc/inventory.md)
- **`sizes` in `items.json` is the picture's real pixel size, and it must be rewritten from
  disk whenever `shots/` is.** The three-width row declares that ratio before the jpegs load;
  assuming it from the viewport left 72 of 246 pictures cropped. [`doc/inventory.md`](./doc/inventory.md)
- **Everything that looks like a control is one.** A chip the reader cannot press does not
  hover (`.std-browse-flat`), and the tier chips are `<span role="button">` rather than links
  with an href that lies. [`doc/decisions.md`](./doc/decisions.md)
- **The wall is `this.browse()` (ext/catalog), not a hand-rolled grid** — every catalogued
  layout is a real declared child (`BrowseItem`), which is what `browse()` needs to draw a
  band. `Page` reserves `.name`/`.url`, so `items.json`'s own `name`/`url` fields are renamed
  to `title`/`real_url` on the way in; get that wrong and a card's own address breaks.
  [`doc/decisions.md`](./doc/decisions.md)
- **One verdict trail, keyed by url — not by this page's own id.** `vkey(item)` reads
  `item.real_url` (or `item.url` on a raw `items.json` entry) for everything except the twelve
  `wire` items, which keep their short id. Get the field wrong and a card silently stops
  agreeing with `ext/Ask`'s own corner control on the same real page.
  [`doc/decisions.md`](./doc/decisions.md)
- **Only the pictures are `wide`.** Everything under them is reading-width — `wide` gave a
  one-line `<summary>` a 1,766px grey bar at 1920 and a 3,260px paragraph at 3440.
  [`doc/decisions.md`](./doc/decisions.md)
- **A sticky bar has to paint the page's own background**, `--wash`, not `--surface` — white
  over a grey page read as a bright empty band across the wall.
- **Anything a sticky bar scrolls to needs `scroll-margin-top`, in `rem`.** Without it a tier
  chip put its own heading under the bar you just pressed. `em` is wrong here: the body font is
  a viewport clamp, so an `em` margin shrinks where the bar is tallest.
  [`doc/decisions.md`](./doc/decisions.md)
- **An item page is four boxes, and below 40rem three of them take `order: 1`** so the verdict
  lands under the heading. Not `order: -1` on the verdict — that puts it above the `<h1>`, which
  is a child of the same grid. And both framework rhythm rules follow DOM order, so each box
  re-states the margin of the position it is *drawn* in. [`doc/decisions.md`](./doc/decisions.md)
- **The phone's picture arrangement is chosen in JS**, because no CSS can open a `<details>`.
  `redraw()` rebuilds the row when the width crosses 40rem either way; `39.99rem` is written in
  both `page.js` and `browse.css` and the two have to agree.
- **This module edits nothing it catalogs.** Every item was read out of a realm's own manifest;
  if a realm renames a page, `items.json` goes stale and the card 404s on click. Rebuilding is
  one script run. [`doc/inventory.md`](./doc/inventory.md)

## More

- [Docs](/layouts/browse/doc/) — [`doc/inventory.md`](./doc/inventory.md) how the items were
  gathered and how to change them · [`doc/decisions.md`](./doc/decisions.md) what was
  settled, what was measured, what is still the owner's call
- Files: `page.js` (`BrowseItem`, one real child per catalogued layout, drawn by
  `this.browse()`; each item's own page is that child's `content()`, not a route) ·
  `verdicts.js` (read the log live, append one line) · `items.json` (the inventory — the
  authority, fetched once with a top-level await) · `browse.css` · `shots/` (246 jpegs, three
  widths each)
- Beside it: [`/layouts/`](/layouts/) the layout standard this page lives inside ·
  [`/layouts/doc/studies/approved/`](/layouts/doc/studies/approved/) the five that are
  already approved · [`/imagine/importance/`](/imagine/importance/) the same append-only
  jsonl-over-the-socket seam, one realm over
