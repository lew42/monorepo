# `page_work()` — opt-in, not automatic

**The question the brief asked:** do class-doc pages (`ext/Doc extends Page`) get this
automatically, or does each page opt in?

**Answer: opt-in, one line, on the pages that ask for it — not automatic for every Doc
page.** `Doc`'s default `content()` never calls `page_work()` on its own. A page places
it itself, exactly like any other block:

```js
import { page_work_strip } from "/framework/core/Page/ai/work.js";
// … inside content():
div.c("card pad", $box => page_work_strip($box, { match: ["your", "keywords"] }));
```

## Why not automatic

1. **There is no default match for a Doc page to opt in WITH.** `page_work()` finds work
   by matching a few hand-picked keywords against every open card's title and every live
   agent's id (`page-work-data.md` has the full reason — no card or agent carries a
   page-identifying field yet). A class name (`Dictate`, `Panel`, `Filter`) is not
   reliably the same word a task's title uses, so a Doc page has nothing sensible to
   search with unless a person decides its keywords — that decision is the opt-in.
2. **Most Doc pages have no open work at all**, and a block that says "nothing open" on
   every single class-doc page in the framework is noise on the page that matters least
   this rule (`CLAUDE.md`: "don't tell the reader what you are about to show them" — an
   always-empty block is the opposite, it tells the reader nothing every time).
3. **The cost, named plainly:** two HTTP fetches per page load (`GET /cards?view=open`,
   `GET /api/agents`), both CORS-open and unauthenticated, each capped at a 4-second
   timeout in `live.js`. On localhost they resolve in well under 100ms today, but "every
   Doc page fetches this on every load" is a real, standing cost against a process
   (Servex) that also answers every other page's own live widgets — turning it on
   everywhere multiplies that load for no benefit on pages nobody tagged.

## How to turn it on for a page that DOES want it

One line, same shape used on [`ux/Dictate/`](/framework/ux/Dictate/) and this page
(`core/Page/ai/page.js`, `ux/Dictate/page.js` — both read the real call). Name a few
words about the page's own topic in `match`, and pass `page: this` (from inside
`content()`) so the collapsed "Parent: …" rows come from the real page tree —
`page.parent`, walked all the way to the root — instead of a hand-typed list
(review-2.md finding 7, 2026-09-29 fix round 2). Each ancestor's own match is a
`work_match` property set on that page's `Doc`/`Page` definition; a page that never
declares one falls back to its own last url segment (`/framework/ux/` → `ux`). Full
shape and both views: `work.js`'s own top comment.

## If cards start carrying a real tag

`Servex/cards/Cards.js` already has a `tags` field on every card ("projects this card
belongs to") — almost nothing sets it yet. The day a card is reliably tagged
`tags: ["dictate"]`, `topic()` in `work.js` swaps its keyword substring-match for an
exact `tags.includes(...)` compare, and every page that already opted in keeps working
with no other change — the opt-in call stays the same, only what counts as a match gets
more precise.
