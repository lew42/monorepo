# Brief: related sidebar

Owner's words (2026-09-18, 14:40):

> a right sidebar — not the property drawer with a different background, but an internal right sidebar. We haven't explored that much. It's often used for related topics; that's a good idea for a lot of pages: related links to other things, maybe just an icon and the title. We probably want to import that thing so the title and icon update when we update the other thing.

## What exists (read first)

- `core/Page` (`Page.class.js`, `Page.css`, `readme.md`, `doc/`) — read `readme.md`, `doc/declaring.md`, the page grid's tracks in `Page.css`: `main`, `wide`, `bleed`; under a columns host there is no page grid — `/imagine/` is one.
- `Page.from(url)` — loads a page by url without importing it, no import cycle.
- layout skill's Q1/Q4 — a page has two or three regions.
- design-system tokens at `/framework/styles/system/`.
- `ext/toc` — a right-hand table of contents on blog posts — read how it takes the third region, the "docs three-region" approved shape at `/imagine/design/layout/approved/`.

## Deliverables

1. `related:` on a page — a string of urls (`related: "/layouts/ /framework/ux/Tree/"`) — draws an internal right aside on the page's own ground (no separate background; the box rule: no box, so no padding beyond the grid's own gutter), one row per url: the target's icon and title resolved through `Page.from(url)` at render (so a renamed target updates by itself; a url that fails resolves to nothing and logs nothing loud), each row a link; a small heading ("Related") only if the page does not already have one. The aside takes the third region where the page grid has room and folds under the content at narrow widths (say the breakpoint and why — the toc's is the precedent); under a columns host it renders as a short list at the end of the column instead.
2. Two first consumers: `/framework/ux/Tree/` (related: `ui/tree`, `/layouts/shell/`, `/imagine/design/lists/`) and `/layouts/browse/` (related: `/layouts/practice/`, `/layouts/shell/`, `/imagine/design/layout/approved/`) — the `related:` line only in their `page.js`.
3. Docs: `core/Page/readme.md` one Use line, `doc/property/related.md` (the property, the resolve, the alternative — importing the target's config so a moved page breaks loudly rather than silently, and when that wins), `doc/decisions.md` the dated record.
4. Verify headless on private server (`PORT=8129 node server.js`, background, killed by its real Windows PID): both consumers at 400 / 1280 / 1920 / 3440 — the aside on the right at 1280+, under the content at 400, titles and icons matching the targets' own pages (two numbers that must agree: rows drawn and urls declared), zero console errors; one shot each at 1920.

## Fence

`public/framework/core/Page/**` (one write per file; core is live on the owner's dev server on port 80 — never touch it; LiveReload pushes edits to their tabs, so verify within a minute), the one `related:` line in `public/framework/ux/Tree/page.js` and `public/layouts/browse/page.js`, your task dir. Nothing else.

Never `git stash`, never `find /`, never drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here — drop the slash.

## Final report shape

One screen: the property in one line, the two links, the two shot paths, the breakpoint and why, the alternative, what was left and why.
