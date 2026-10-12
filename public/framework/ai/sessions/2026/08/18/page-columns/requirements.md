# page-columns — a Miller-columns arrangement, as a Page demo

## The ask (verbatim)

> do we have any multi-column nested page layouts?  they're basically like vertical tabs, or the page.catalog, but more like, equal column, with a max-width, and maybe any number of them?  If you click a page on the right column, another right column appears?  I think the CSS on this might "just work".  Explore this idea, and create an example at core/Page as a demo.app.
>
> It should be responsive, so it works on mobile (1 column at a time), or any resolution.  determining the column showing/hiding logic might require some javascript?  if you keep drilling deeper, what's the easiest way to handle running out of room?  maybe horizontal scrolling isn't the worst idea?  as you close open columns, the originals appear?
>
> you can't have nested pages this way, btw, they have to be peers, so they can share space evenly.  you could have full-height column pages, or nested.  but i've noticed you can't, at least not easily with my "blocky tabs", have full-height columns that bisect the active tab at the top, or you'll have an ugly line and the "flush tab-to-content" effect is lost.
>
> anyway, spawn some minions to help, begin

## Scope

- One demo tree: `public/framework/core/Page/overview/columns/page.js` (group **Arrangements**), a fifteenth card in the Page rail, built with `demo.tree` → `demo.app`.
- The arrangement's CSS lives beside it, loaded from the demo (`View.stylesheet(import.meta, "columns.css")`) — no change to `Page.css`, `Page.class.js`, `ext/demo`.
- Register: `overview:` string in `core/Page/page.js`, `files:` list, and `overview/readme.md`'s name list.
- A doc note (`core/Page/doc/layout.md` or a new `doc/columns.md`) recording what was learned: peers vs nested, and how `display: contents` answers it.

## The design being tested

Every page in the tree is a **column**: its title, its prose, its children as a list of links. Clicking a child opens
another column to the right. The DOM stays a tree (each page's `$pages` region sits *inside* its own view, so the
arrangement contract — `.active-ancestor:has(.page.active-page)`, and demo.app's containment `mark()` — holds
unchanged), but the LAYOUT is flat: `.page.column { display: contents }` makes every column a direct flex item
of the root's row. Peers on screen, a tree in the DOM.

- Equal columns: `flex: 1 1 0; min-width: var(--column-min, 14em); max-width: var(--column-max, 24em)`.
- Out of room: the row `overflow-x: auto` with `scroll-snap`; opening a column scrolls it into view (one `scrollIntoView` in `activated()`).
- Mobile: below ~2 columns' worth of width, each column is `min-width: 100%` — one at a time, swipe/scroll between them, snap.
- Closing: navigating to a shallower url deactivates the deeper pages; they hide, the row shrinks back — nothing to write.

## Verification

Playwright headless (`probe.mjs` in the scratchpad, never the owner's live tabs): the demo at 390 / 1280 / 3440,
click three deep, measure the columns are equal, that the row scrolls when it must, that the util-layer visibility
contract still hides every non-chain page.

## File ownership

- builder: `core/Page/overview/columns/page.js`, `core/Page/overview/columns/columns.css`
- orchestrator: `core/Page/page.js`, `core/Page/overview/readme.md`, `core/Page/doc/*.md`, `core/Page/readme.md`, this task dir
