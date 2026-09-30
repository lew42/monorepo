# Audit — every page layout in use, most-used first

Live: [/framework/core/Page/audit/](/framework/core/Page/audit/). Every page the site links to,
crawled headless and given one layout by its DOM marker. Pick a new page's layout from here.

- [priority](./priority/) — the main pages (most linked), each with its layout
- [design](./design/) — nine main pages at 400, 1200, 1920 and 3440: tab rows, padding, wraps
- [reuse](./reuse/) — why pages drift, and the four changes that make reuse the default

## Use
- Re-run it: the crawl (`ai/2026-09-30/page-audit/crawl/crawl.mjs`, resumable), then
  `node classify.mjs --emit <this folder>`; the design numbers come from
  `node Server/layout-check.mjs --bands <urls>` then `node design-emit.mjs <this folder>/design`.
- `data.js` and `design/data.js` are written by those scripts. Never edit them by hand.

## Watch out
- A console error doesn't stop a page rendering: classify by what drew, not by the error.
- AI 2 cards and task pages are capped at 15 per day in the crawl, so their counts are a floor.
- "Pages" counts the rendered crawl; "page.js opt-ins" is a grep. A gap between them is a finding.
