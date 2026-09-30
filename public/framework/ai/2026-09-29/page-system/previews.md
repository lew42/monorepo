# Preview cards — every component, and the one shared source

The owner's report: many layout preview cards are broken. Two rules: (1) a preview
is auto height at one shared zoom — a one-line item stays one line, a tall one caps
with a fade, never stretched or hard-cropped; (2) the gap from a label to its own
picture is clearly smaller than the gap to the next card.

## Every preview component found

| Component | File | Used by |
|---|---|---|
| **`Page.preview_card()` / `.page-preview-thumb`** — the shared card shell | `core/Page/Page.class.js`, `core/Page/Page.css` | Every `previews()`/`walls()`/`browse()` wall site-wide: core/Page's own Overview (`browse()`, BANDS in `core/Page/page.js`), `/layouts/decide/`'s demo cards, ~90 other `grid.auto`/`wall` call sites |
| **`this.browse(bands, …)`** — a filterable wall of preview cards, bands declared by the caller | `ext/catalog/browse.js` | `core/Page/`'s Overview tab (`core/Page/page.js`, fenced off — another minion owns it this task); `/layouts/browse/` |
| **`mini(word)`** — a schematic grey-box picture, no live content, absolutely positioned INTO `.page-preview-thumb` | `ext/demo/mini.js`, `ext/demo/mini.css` | the page generator's own block-word cards (not confirmed live on the Overview wall today — BANDS in `core/Page/page.js` renders each child's own real `preview()` override instead, where one exists) |
| **`demo.page()` / `demo.tree()`** — a live render of the actual demo, zoomed | `ext/demo/exhibit.js` | rail cards wherever `demo.page(...)`/`demo.tree(...)` builds a page (site-wide; not on my 4 named pages today — `/layouts/decide/`'s children override neither) |
| **`Layout.thumb()` / `Layout.shot()`** — a wireframe drawing at a real w×h, shrunk with a container-query zoom (`.std-frame`/`.std-draw`) | `layouts/Layout.js`, `layouts/layouts.css` | `/layouts/` (the tree, family, related, tag walls), a layout's own page (three widths) |
| **`.std-explorer-card`** — a rail card: a wireframe or a lazy iframe at a fixed 1920×760, label inside the border | `layouts/explorer/page.js`, `layouts/explorer/explorer.css` | `/layouts/explorer/` only |
| **the five-question wall** — plain `.card` divs on a generic `.grid.auto`, no thumb at all | `layouts/decide/page.js` | `/layouts/decide/` only |

## The shared source, and what was actually broken

**`core/Page/Page.css`'s `.page-preview`/`.page-preview-thumb`/`.wall` rules, plus
`preview_card()` in `core/Page/Page.class.js`, are the one real shared source** —
every page under `core/Page/overview/` that renders a **live** thumb (`preview(nav){
return this.preview_card(nav, () => div.c("zoom-25", board)); }`, eight of them:
`mounts`, `replace`, `render`, `region`, `shell`, `inset`, `full`, `measure`) went
through this exact code, and so does `browse()`'s wall (same `.page-preview` markup)
and `/layouts/decide/`'s own `this.previews()` call. **This is what was actually
broken**, confirmed live on `/framework/core/Page/` (Overview tab, "Building
blocks"/"Pages are navigation"/"The box" bands):

1. `.page-preview-thumb` forced `aspect-ratio: var(--stage, 16/10)` on every thumb,
   live renders included — so a one-line board (`wall`, `prose`) got stretched to a
   fixed box with dead space below it, and a taller one (`region`, three stacked
   panels) got hard-cropped by `overflow: hidden`.
2. `.page-preview`'s label-to-thumb gap was `calc(var(--gap) * 0.6)` — 0.6× the
   SAME token the wall uses for card-to-card spacing (`--gap`, 1em–2.4em), so a
   label read as just another item in the wall's rhythm, not its own thumb's caption.
3. Within "The box" band, `render` and `region` used `zoom-25` while `full`,
   `inset`, `measure` and `shell` used `zoom-50` — one wall, two zooms.
4. `.wall`/`.page-previews`'s grid had no `align-items`, so CSS Grid's own default
   (`stretch`) dragged every short card in a row down to its tallest neighbour —
   visible even on cards with NO thumb at all (a description-only card next to a
   longer one), and on `/layouts/decide/`'s five-question wall (a different
   mechanism, `.grid.auto`, not `.page-preview` — same visual bug, fixed the same way).

**`/layouts/`, `/layouts/browse/`'s wireframes, and `/layouts/explorer/`'s rail
cards were already correct** and are deliberately NOT auto-height: they draw a
*picture of a whole page's shape* (a real w×h aspect), not a snippet of live
content, so a fixed aspect is the right answer there, not a bug — and both already
use a small, fixed label gap (`0.5em`, `layouts.css`'s `.std-thumb`) well under the
wall's own `--gap`. Confirmed by inspecting `Layout.js`/`layouts.css` and
`explorer.css` directly, and by the before/after screenshots below (byte-identical,
as expected — nothing in those two files was touched).

## The fix — at the shared source, once

`core/Page/Page.css` (`.page-preview`, `.page-preview-thumb`, `.wall`/`.page-previews`)
and `core/Page/Page.class.js` (`preview_card()`):

1. **Auto height, opt-in by what's already there.** `.page-preview-thumb:has(>
   [class*="zoom-"]) { aspect-ratio: auto; height: auto; }` — every LIVE render
   already wraps itself in a `zoom-25`/`zoom-50`/`zoom-75` class (that was already
   true; nothing new to write at each call site), so this one CSS rule catches
   exactly the boards that have their own real content height and leaves a
   schematic picture (`mini()`, absolutely positioned, no `zoom-*` wrapper, would
   collapse to 0 height if forced auto) or a screenshot fill (`.design-shot`,
   `.journey-shot`, `.notes-thumb`, none of them carry `zoom-*` either) exactly as
   they were — scoped, not swapped, the same pattern `framework.css`'s
   `.grid.auto:has(> .page-preview)` already uses one screen up.
2. **A cap, not a crop.** `max-height` (unchanged) still ceilings a thumb; past it,
   `preview_card()` now measures the rendered thumb on the next frame
   (`requestAnimationFrame`, since a synchronous read can't see real layout yet) and
   adds `.capped` only when the content is actually taller than the cap — `.capped`
   fades the last 2em instead of hard-cutting it. A thumb that fits needs no fade
   and gets none.
3. **A real gap, not a fraction of the wall's own.** `.page-preview`'s label gap is
   now a flat `0.35em` — inside the 0.25–0.5em the owner asked for, and always at
   least 2× smaller than `--gap` (which never drops under 1em), instead of a 0.6×
   fraction of the same number.
4. **`align-items: start`** on `.wall`/`.page-previews`, so a short card keeps its
   own height inside a taller row instead of being stretched to match.
5. **One shared zoom per wall.** `render` and `region` (`core/Page/overview/`)
   changed from `zoom-25` to `zoom-50`, matching the other four cards in "The box"
   — one line each, not a copy of the CSS.
6. **`/layouts/decide/`'s five-question wall** (a different mechanism, plain
   `.grid.auto` — see above) gets the same `align-items: start`, one line, since
   the wall itself isn't shared with `.page-preview`.

**Not touched, on purpose:** `ext/demo/mini.js`/`mini.css` (the schematic palette —
the `:has([class*="zoom-"])` scoping already leaves it alone; verified no `zoom-*`
wrapper exists anywhere in its own markup), `.design-shot`/`.journey-shot`/
`.notes-thumb` and their pages (screenshots elsewhere on the site, same reasoning),
`layouts/Layout.js`/`layouts.css`, `layouts/explorer/*` (already correct, see
above) — none of these needed the "wall that genuinely needs its own override"
exception because none of them were broken.

## Proof

Before/after at 1920 and 400, `shots/previews-<page>-<width>-<before|after>.png`:
`core-page-overview` (the Overview tab — "Building blocks"/"Pages are
navigation"/"The box" bands, the actual bug), `layouts`, `layouts-decide`,
`layouts-explorer`. Zero console errors on every shot (`shots.mjs` in the run;
script not kept — a one-off headless Playwright check, `minion` skill's own
pattern). At 400 wide, `core-page-overview` shows a mobile nav screen, not the
Overview grid — that's `core/Page/layout/switcher`'s own page, a sibling minion's
work in this same worktree (not touched, not fenced to me); before and after are
byte-identical there.
