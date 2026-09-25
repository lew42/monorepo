# Layouts — every whole-page layout as a class string, on one filterable wall; for anyone building a page

## Index

- [400](./400/) — five class strings, one column at 400px
- [anatomy](./anatomy/) — seven generic layouts and the two strings behind them
- [apidoc](./apidoc/) — API-documentation page layouts (no readme yet)
- [bold-editorial](./bold-editorial/) — a row-heading strip over an editorial band (no readme yet)
- [carousel](./carousel/) — a rail that scrolls sideways and snaps (no readme yet)
- [chat](./chat/) — conversation list, transcript, composer (no readme yet)
- [cols](./cols/) — six words for 2- or 3-column rows
- [dashboard](./dashboard/) — number strip over a wall of panels (no readme yet)
- [docs](./docs/) — menu, article and table of contents (no readme yet)
- [document](./document/) — header, one reading column, footer (no readme yet)
- [feed](./feed/) — a centred column of posts, two sticky rails (no readme yet)
- [fit](./fit/) — how a page holds a layout, and four words to change it (no readme yet)
- [flex](./flex/) — a row and its eight one-word variations (no readme yet)
- [gallery](./gallery/) — filter rail beside a wall of tiles (no readme yet)
- [grid](./grid/) — a wall that counts its own columns (no readme yet)
- [hero](./hero/) — copy beside a picture, or over it (no readme yet)
- [home](./home/) — a real homepage in ten bands
- [landing](./landing/) — stacked full-bleed bands (no readme yet)
- [mail](./mail/) — folders, list and message panes (no readme yet)
- [masonry](./masonry/) — a ragged wall with no column gaps
- [model](./model/) — the whole system in seven sentences (no readme yet)
- [overlay](./overlay/) — a sheet or menu that covers the page (no readme yet)
- [pricing](./pricing/) — three tiers on one token (no readme yet)
- [screens](./screens/) — seven Figma frames, four already ours
- [set](./set/) — Figma frames built as class strings (no readme yet)
- [shell](./shell/) — header, rail, work area, inspector, status bar (no readme yet)
- [sidebar](./sidebar/) — a fixed panel beside fluid content (no readme yet)
- [space](./space/) — type a layout string, see it on five screens
- [spec](./spec/) — the Figma layout-documentation frame at full width (no readme yet)
- [split](./split/) — a list beside what it selects (no readme yet)
- [stack](./stack/) — vertical rhythm and a form with no CSS (no readme yet)
- [toc-studio](./toc-studio/) — a category strip over a scanned contents list (no readme yet)
- [wire](./wire/) — eight generic page skeletons

## Use

A layout is a page: config over `ext/demo`'s exhibit, then its name in `BANDS` (`page.js`) — `children:` derives from it.

```js /framework/styles/layouts/document/page.js
export default new Page(demo.layout({
	meta: import.meta, title: "Document", group: "Pages",
	parts: "header footer",   // chips on the stage; `this.shows("header")` in layout()
	layout(){ return div.c("page full fill flex v", () => { /* the bands */ }); },
}));
```

## Watch out

- No stylesheet in any layout dir — the vocabulary plus inline per-layout state; the exceptions ever needed are counted in [doc/css-cost.md](./doc/css-cost.md)
- A layout reaches UP for its nav (`this.parent.rail()`), never imports the index — a mutual import breaks deep reloads only. [doc/decisions.md](./doc/decisions.md)
- A wrapping row hands slack to its LINES (`align-content: stretch`), and the scroller belongs to the row, not the panel in it. [doc/decisions.md](./doc/decisions.md)
- Measure with `offsetHeight`, never `getBoundingClientRect()`, where a card or stage zooms; media queries do not follow `zoom`. [doc/previews.md](./doc/previews.md)
- A card is one `zoom-25` frame at `56em` and `--column: 22em` — the layout lays out at four times the card's width. [doc/twin.md](./doc/twin.md)

## More

- [Overview](/framework/styles/layouts/) · [doc/decisions.md](./doc/decisions.md) the record: merges, reversals, open items · [doc/twin.md](./doc/twin.md) the two-screen card · [doc/previews.md](./doc/previews.md) `zoom` vs `transform`, measured · [doc/full-view.md](./doc/full-view.md) maximize as a url · [doc/css-cost.md](./doc/css-cost.md) which rules were needed
- Files: `page.js` (BANDS, one `browse()`) · `web.js` (one site's content) · `word.js` (class string as page) · [masonry/readme.md](./masonry/readme.md) (the JS exception)
- Pages: [document](/framework/styles/layouts/document/) header, measure, footer · [docs](/framework/styles/layouts/docs/) rails beside article · [landing](/framework/styles/layouts/landing/) full-bleed stacked bands · [hero](/framework/styles/layouts/hero/) copy beside picture · [pricing](/framework/styles/layouts/pricing/) tiers, one token · [stack](/framework/styles/layouts/stack/) rhythm versus gap · [toc-studio](/framework/styles/layouts/toc-studio/) category strip, scanned rail · [apidoc](/framework/styles/layouts/apidoc/) rail, breadcrumb, tabs, three bodies
- Apps: [shell](/framework/styles/layouts/shell/) six optional regions · [dashboard](/framework/styles/layouts/dashboard/) numbers over panels · [split](/framework/styles/layouts/split/) list beside detail · [overlay](/framework/styles/layouts/overlay/) sheet covers page · [gallery](/framework/styles/layouts/gallery/) filter rail, wall · [sidebar](/framework/styles/layouts/sidebar/) fixed rail, fluid · [masonry](/framework/styles/layouts/masonry/) ragged wall, JS · [feed](/framework/styles/layouts/feed/) column, sticky rails · [carousel](/framework/styles/layouts/carousel/) sideways snapping rail · [mail](/framework/styles/layouts/mail/) three panes shed · [chat](/framework/styles/layouts/chat/) transcript pins composer
- Reference: [model](/framework/styles/layouts/model/) seven-sentence system · [fit](/framework/styles/layouts/fit/) the page shapes · [flex](/framework/styles/layouts/flex/) nine flex words · [grid](/framework/styles/layouts/grid/) three grid words · [400](/framework/styles/layouts/400/) five strings, unstacking · [space](/framework/styles/layouts/space/) layout as string · [wire](/framework/styles/layouts/wire/) eight wireframes as eight strings · [anatomy](/framework/styles/layouts/anatomy/) burgers and columns, nested · [set](/framework/styles/layouts/set/) six Figma frames, two primitives · [screens](/framework/styles/layouts/screens/) phone-width app shell · [spec](/framework/styles/layouts/spec/) a Figma spec sheet, and its numbers audited
- From Figma, 2026-08-18: [home](/framework/styles/layouts/home/) the owner's homepage, one string per band · [toc-studio](/framework/styles/layouts/toc-studio/) tabs plus a live `ext/toc` rail · [apidoc](/framework/styles/layouts/apidoc/) five frames of a class's docs, one page — the live one is [`ext/Doc`](/framework/ext/Doc/). · [spec](/framework/styles/layouts/spec/) the tallest node in the file — ten shapes drawn at four widths, drawn once here. The record: [`/framework/ai/2026-08-18/figma/`](/framework/ai/2026-08-18/figma/)
