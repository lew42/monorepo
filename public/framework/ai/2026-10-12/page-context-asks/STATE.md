# page-context-asks: STATE

Asks [#6 and #7](/framework/core/Page/doc/asks.md), both built. Requirements: [requirements.md](/framework/ai/2026-10-12/page-context-asks/requirements.md).

## #6 page-context-on-page: done ([bb8d98c9f](https://github.com/lew42/monorepo/commit/bb8d98c9f))
- ✅ Every Page and Doc page shows "N open tasks on this page · M below" (a click opens the task links): `core/Page/ai/PageWork.js`, added to `Page.class.js` and `ext/Doc/Doc.js`. Doc: [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md).
- ✅ Data is computed, not recalled: `node Server/page-ai-cost.mjs --work` writes `ai/page-work.json` (8 pages with open work at the time).
- ✅ Directory data apart from page.jsonl: decided as by design (`core/Page/doc/data.md`, `jsonl.md`).
- Proof: headless probe showed the line on `/framework/dev/`, `/framework/ai/` ("6 open tasks on this page · 1 below") and the Dictate doc page; no horizontal scroll at 400/1200/1920/3440.
- ⬜ **Blocked step:** nothing runs `--work` on a timer. Smallest next step: call it from Servex's task tick, then one batched restart proven on a private port.

## #7 weight-importance: done ([632aa94e1](https://github.com/lew42/monorepo/commit/632aa94e1))
- ✅ `core/Page/PageWeight.js`: `of(url | {url} | {weight})`, `rank`, `classes`, `apply`. `page.previews(pages, { weight: true, min })` (add-only change in `Page.class.js`).
- ✅ Card size follows weight (w1 to w3, `weighty` past 10) and a `min` filter hides the light ones; the number is the hover title.
- ✅ Display A (size scale) decided, B named as the alternative: [design.md](/framework/core/Page/weight/doc/design.md). Live demo: [weight/](/framework/core/Page/weight/).
- Proof: on the private server the core/Page children came out Layout(12, weighty), Navigation(3), Generator(3), Overview(2)..., weight-1 cards hidden; screenshots at 400/1200/3440 read fine, no horizontal scroll.
- ⚠ A weight on an Item or card is only a property; there is no `weight.jsonl` for objects that are not pages.
