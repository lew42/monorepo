# The inventory — where every item came from, and how to change them

`items.json` is the authority. Every card on the wall, every routed item page and every
verdict id comes out of it, and **nothing crawls**: a layout that is not in the file does not
exist here.

## One item

```json
{
  "id": "shell-left",
  "tier": "global",
  "name": "Left rail",
  "say": "The default app shape — nav on the reading edge, content beside it.",
  "url": "/layouts/labs/shells/left/",
  "source": "imagine/shells",
  "why": ["/layouts/labs/shells/readme.md", "/layouts/labs/shells/doc/decisions.md"],
  "shoot": true
}
```

| field | what it is |
| --- | --- |
| `id` | the url segment (`/layouts/browse/<id>/`). Never reuse one for a different thing — the twelve `wire` items (below) are also keyed by it in `verdicts.jsonl`; a renamed id silently orphans their verdicts. |
| `tier` | `global`, `sections` or `components`. Decides which wall it lands on. |
| `name` | what the card says. Taken from the realm's own `title:`, not invented here. |
| `say` | one line, from the realm's own `description:`. |
| `url` | the real page. The card's "Open the real page" button — **and, for every item except the twelve `wire` ones, the key a verdict is written against** (mastermind decision `verdict-keyspace`, 2026-09-18, `ai/2026-09-18/browse-on-browse/`): the same key `ext/Ask`'s corner control writes when the owner approves a page from the page itself, so the two never disagree about one url. |
| `source` | the module directory it belongs to, no leading slash. |
| `why` | the markdown files quoted on the item's page, in order. Only files that exist. |
| `wire` | an id in `/layouts/layouts.json`. The picture is drawn live from that wire. |
| `shot` | a jpeg that already exists somewhere else on the site. Used as-is. |
| `shoot` | `true` means this task screenshotted it into `shots/<id>-<400\|1920\|3440>.jpg`. |
| `badge` | an optional chip on the item's page — only the five approved layouts carry one. |

Exactly one of `wire`, `shot` or `shoot` is set on every item, so every card has a picture.

## Where each tier came from

Every list was read out of the realm's **own manifest**. No realm was edited to make this page
exist, and no list was typed by hand.

| items | read from |
| --- | --- |
| 5 approved | the `APPROVED` array in `/layouts/doc/studies/approved/page.js`, and the jpegs it already points at in `/layouts/doc/studies/shots/` |
| 12 layout ids | `layouts.layouts[]` in [`/layouts/layouts.json`](/layouts/layouts.json) — each brings its own `wire`, so nothing was screenshotted twice |
| 18 arrangements | the `ENTRIES` list in `/imagine/layouts/system.js` (`id`, `n`, `title`, `when`) — that realm was deleted 2026-09-18; each of the 18 now points at its mapped [`/layouts/`](/layouts/) id instead |
| 10 shells · 4 sections · 12 templates · 8 screens | the `children:` line of each realm's `page.js`, then each child's own `title:` and `description:` |
| 22 ui | the `BANDS` object in `/framework/ui/page.js` |
| 8 ux | the `children:` line of `/framework/ux/page.js` |

## Rebuilding it

The builder is a throwaway script, not a repo file — it ran once, read-only over nine realms,
and wrote `items.json`. Rebuild by writing it again from the table above; it is about a
hundred lines of `fs.readFileSync` and one regex per manifest shape. Two things to keep:

- **Read the manifest, never the directory listing.** A realm's `children:` line is the list
  the realm itself believes in; a directory can hold a page nobody declares, and that page
  does not exist to the site.
- **`why` is checked, not assumed.** Only `readme.md` and `doc/decisions.md` files that are
  actually on disk go in, because the item page quotes them and a 404 there is a dead fold.

## The pictures

Taken headless with Playwright against a private dev server, three viewports per item —
400×844, 1920×1080, 3440×1440 — each rendered at a fractional `deviceScaleFactor` so the jpeg
comes out small without being resized afterwards. 246 files, 4.0 MB, the largest 86 KB.

**A component's picture is CLIPPED to the thing, not to the page.** 42 of the 82 shot items —
every `framework/ui` and `framework/ux` component, and the ten `imagine/paging/templates` — live
on a documentation page, so a full-viewport screenshot of one is a picture of the *site*: the
same left nav, the same topbar, the same "Variants" heading and the same dark code block on
every card. Those 126 jpegs are a **16/9 frame grown around the page's own demo region**:
`.demo-stage`, then `.demo-shell`, then `.page-previews` for a component; `.paging-frame`, then
`.paging-canvas` for a template; and for the three pages that keep their demo in a box of their
own name (`.templates-theming`, `.ui-controls-sizes`, a bare `.flex.auto.gap.bleed`) the widest
child of the page, since a demo on this site is the thing that breaks out of the measure and
prose never does. The other 40 items — shells, screens, arrangements — are whole-page layouts,
so their picture is the whole viewport, unclipped.

**`sizes` is the picture's real pixel size, and it must be refreshed with the jpegs.** Each
shot item carries `"sizes": { "400": [w, h], "1920": [w, h], "3440": [w, h] }`, read off the
files. The item page declares that ratio so the three-width row lays out before a single jpeg
arrives. It used to be ASSUMED from the viewport a shot was taken at, and that held only while
every jpeg was a whole screen — the moment the 126 became crops, 72 of the 246 were more than
2% off their declared ratio and `object-fit: cover` threw the difference away (2026-09-17).
Re-shoot, then rewrite `sizes` from disk in the same pass.

- **Block the dev socket before shooting** (`context.routeWebSocket(/.*/, () => {})`), or
  LiveReload reloads the tab whenever any agent saves under `public/` and a shot lands
  mid-reload.
- **Shoot into a scratch directory and copy in afterwards.** A jpeg written under `public/`
  fires the server's watcher on every single file.
- **Hide `.dev-bar` and `.drawer`** with an injected style tag. They are the dev server's own
  chrome, not part of the page, and one of them is parked past the right edge on purpose.
- **Never `fullPage: true` on this site.** The real scroller is `div.pages`, not the document,
  so a "full page" capture silently gives you the viewport and nothing below it.
