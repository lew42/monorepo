# Figma architecture — the browser reads, an agent writes

The Figma module shows tracked Figma files as routed pages. The browser only reads JSONL and screenshots that already sit in the repo; an agent in a Figma session does all the talking to Figma. The main classes are `Figma` ([`Figma.js`](../Figma.js)), `FigmaFile` ([`FigmaFile.js`](../FigmaFile.js)) and `FigmaNode` ([`FigmaNode.js`](../FigmaNode.js)). Writing is done by [`track.mjs`](../track.mjs).

## The browser never calls Figma

**Decided:** the page only fetches `index.jsonl`, `data/<key>/pages.jsonl` and `built.jsonl`. Nothing in the browser talks to Figma.
**Why:** the Figma MCP answers only inside an agent session, and the site is static, so there is no server to proxy it.
**Instead:** a browser-side Figma token would add a secret to a static site and still need every fetch to be re-run by hand.
**Detail:** [readme](../readme.md) (Classes); [doc/mcp-servers.md](./mcp-servers.md).

## Tracking is a spec in, append-only lines out

**Decided:** an agent writes a spec (`{key, name, pages[]}` of node ids and screenshot urls). `track.mjs` downloads the shots and appends lines to `pages.jsonl`. It never edits old lines.
**Why:** the agent does the Figma reads, but the sizes, timestamps and line format are computed by code, so the record is never written from memory.
**Instead:** the agent writes the JSONL itself. Rejected: it would drift from the format the reader expects.
**Detail:** [track.mjs](../track.mjs) header.

## The newest line per id wins

**Decided:** `FigmaFile.apply()` keeps the last line seen for each page id. Earlier generations stay in the file.
**Why:** re-tracking a file must not lose history, and a plain append is the one write that cannot tear a line.
**Instead:** overwriting the file. Rejected: it deletes the last good copy.
**Detail:** [FigmaFile.js](../FigmaFile.js) `apply()`.

## Screenshots over 600 KB are refused

**Decided:** `track.mjs` deletes any shot over 600 KB and fails the track.
**Why:** every card on the browse grid loads its shot, so one huge PNG slows every page that shows it.
**Instead:** keeping large shots and resizing in the browser. Rejected: the cost lands on every visitor.

## Routes use readable slugs, never Figma ids

**Decided:** every file, page and frame gets a unique slug from `unique_slug()`, and the routes match only slugs. Pages live at `/framework/ext/Figma/<file>/<page>/`.
**Why:** a reload or back button must land in the same place, and a Figma id in the url is unreadable.
**Instead:** `?file=<key>&page=<id>` query links. They still open: `FigmaBrowse` rewrites them to the routed url.
**Detail:** [readme](../readme.md) (Use).

## A cold deep link reads synchronously

**Decided:** `Figma.files_sync()` does one blocking XHR for `index.jsonl` (and the file's pages) when a route is hit before the async load has landed.
**Why:** `Page.child()` never awaits `route()`, so a route can only answer with a value that exists now.
**Instead:** an async route that waits. Rejected: `route()` cannot wait, so a Promise would render nothing.
**Detail:** [sync.js](../sync.js) and [FigmaFile.js](../FigmaFile.js) `load_sync()`.

## Figma values are copies of the site's tokens

**Decided:** the browser `styles/` tokens are the source of truth, and Figma mirrors them. The rebuilt pages show the site's `--prime`, never Figma's blue.
**Why:** the site is what ships, so a Figma copy can only be wrong on the site, not the reverse.
**Instead:** Figma as the source, pushed into the site. Rejected: this repo never writes to Figma, and the site is what ships.
**Detail:** [doc/figma-to-framework.md](./figma-to-framework.md#direction-of-the-token-sync-decided-2026-10-13), [doc/scheme.md](./scheme.md).
⚠ Two variables (`dark`, `light`) still differ between Figma and the site; they are listed on `/framework/ext/Figma/tokens/`, not fixed.

## Rebuilt pages are plain `page.js`, not JSONL views

**Decided:** a rebuilt design (`colors/page.js`, for example) is written as an ordinary `page.js`. Its data stays in JSONL.
**Why:** `page.js` is the simplest thing that works, and no code yet rebuilds a view tree from JSONL lines.
**Instead:** a `View` list renderer that replays JSONL. It is the next step and needs its own slice first, since it changes how `core/Page` loads content.
**Detail:** [doc/page-storage.md](./page-storage.md).

## Figma only holds what Figma alone does

**Decided:** this module covers auto layout, components, variables and the MCP. General design rules (space, contrast, layout) live in [`/framework/design/`](/framework/design/).
**Why:** a rule written here would drift from the copy in `design/`, and every finding that applies to both should live in one place.
**Instead:** duplicate the guidance here. Rejected: two copies would drift apart.
