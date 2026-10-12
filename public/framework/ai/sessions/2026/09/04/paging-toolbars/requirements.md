# paging-toolbars — build brief (wave 2)

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program, the vocabulary, the owner's ask) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `new-page`, `css` + `new-css-class` (prefix `paging-`) if a class is born, `ui-test`, `documentation`, `finish-task`.

**The owner's ask, verbatim:** "work on toolbar styles for pages, top toolbars, left toolbars, right toolbars, bottom toolbars, both in the card, and outside the card."

## Build on the core, do not fork it

`public/imagine/paging/paging.js` landed: `Paging extends Page` with `Paging.Toolbar` (mode chips, `store()` per url, one seam `pick(axis, value)`), `Paging.Item`, `Paging.Code`; `paging.css`; `readme.md` + `doc/{mechanisms,decisions}.md`. Read all of it, and `mechanisms/page.js` + `styles/page.js` as the pattern for a factor tree. Also `public/framework/ext/layout/readme.md` (the framework's own toolbar + push drawer) — say in one log line what it offers and what it does not.

## Deliverable

`public/imagine/paging/toolbars/` — one page whose toolbar chips switch the page's OWN toolbar placement live: `top` `left` `right` `bottom` × `inside` (in the card) | `outside` (on the frame), on each of the five surfaces (`plain` `card` `tint` `prim` `dark`) — so the reader sees a left toolbar inside a card page, then outside it, then on dark, without a new page. Then `toolbars/<side>/` one page per side (a tree, `children:`), each carrying the toolbar and a real content sample (`m`). The placement is a new axis on `Paging.Toolbar` — add it in `paging.js` as a seam the same way `style`/`content`/`layout` are, and make the `code` child print `this.pick("toolbar", "left-outside")` like the others. ⚠ `Paging.Toolbar` is shared: your change must not move any existing chip or break the mechanisms/ styles/ sizes/ center/ transitions/ pages — re-run the core's own checks (zero console errors at 400/1280/1920/3440 on the hub and the four factor pages) after your edit.

## Also: the way out of a takeover (the owner, 2026-09-04)

On a `full` page every item on the takeover demo is itself a takeover, so nothing on the page brings the row back; the crumb strip and the head's × are the only exits, and at 3440 the × is a long way away. Add to `Paging.Toolbar`: when the page is `full` (its own width word or its layout axis), the toolbar shows one more chip, `close_fullscreen` (Material Icons classic), that navigates to the page's parent url. One seam, no new axis. Prove it with `ui-test`: takeover from the hub's walk, click the chip → the row is back with the rail visible.

## Prove it

`ui-test`: click through the eight placements on one surface → the toolbar's rect moves to the named side and inside/outside the card's box (measure the toolbar rect against the card rect); screenshots at 1280 and 3440 in your task links. Answer, with numbers, the one design question: at 400, which placements survive and which must fall back to `top`.

## Fences

Write only: `public/imagine/paging/toolbars/`, `public/imagine/paging/paging.js` (the placement axis only), `paging.css` (the placement rules only), `doc/decisions.md` (append), this task dir. The mastermind wires `toolbars` into the hub. Budget ~250k tokens.
