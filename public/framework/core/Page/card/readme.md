# card — the site's card design system

## What

A card is a mini page: it has its own background, works on mobile, sometimes has a
title or a header, is sometimes clickable or expandable, and can nest a few levels
deep before it runs out of padding. This module is where the rules for building one
live — see it: [`/framework/core/Page/card/`](/framework/core/Page/card/).

Built from an inventory of every card-like thing already on the site — page
previews, `.card` itself, chips, chat bubbles, icon cards, the AI 2 rail, and more —
at [`inventory.json`](inventory.json) and [`doc/inventory.md`](doc/inventory.md).

## Use

Six children, each one demo:

- [`grounds/`](grounds/) — the four backgrounds a card can sit on, and what happens
  when one sits on another.
- [`nesting/`](nesting/) — how deep a card can go before the box gives way to a plain
  heading.
- [`headers/`](headers/) — none, heading, icon + title, or a header bar with a menu;
  plus clickable and expandable.
- [`mini-pages/`](mini-pages/) — the owner's decision: a card's data is one line in a
  `page.jsonl`, routed to its own url, with no folder of its own.
- [`scale/`](scale/) — small, default, large, and what content fits each.
- [`log/`](log/) — an object-oriented logger, rendered as nested cards (the reason
  this whole system exists: log groups needed a nesting rule first).

`card/card.css` holds the new CSS — four grounds, the nesting classes, and the
header/menu/clickable/expandable shapes. It reuses `.card`, `.surface`, `.wash` and
`--pad-card`/`--radius` from `framework.css` rather than inventing new ones; see
[`doc/system.md`](doc/system.md) for the one table of which card, when.

## Watch out

- **`.card` itself is the framework's, not this module's.** Nothing here restyles
  it — every new class starts with `card-` (`.card-gray`, `.card-dark`,
  `.card-prim`, `.card-level-N`, `.card-head`, `.card-menu-btn`), reserved in
  `styles/css-scopes.txt`.
- **A card's depth is set in JS, not guessed from CSS.** `nesting/page.js`'s `level()`
  function decides `boxed = n <= 3` and stamps `card-level-N` itself — the same
  choice `card/log/LogView.js` already made for a log group. `doc/system.md`
  explains why a pure `:is()` depth selector was rejected.
- **A mini page's data is NOT a new file format.** `mini-pages/page.jsonl`'s `card`
  lines are read by the ordinary `page.jsonl` line reader (`core/Page/Log.js`); the
  only thing new is the `card()` method that `MiniPages.js` adds, the same way
  `place()` and `file()` already work.

## More

[`doc/system.md`](doc/system.md) — the rules, one table. [`doc/inventory.md`](doc/inventory.md)
— the inventory this system was built from. [`core/Page/jsonl/`](/framework/core/Page/jsonl/)
and [`core/Page/dynamic/`](/framework/core/Page/dynamic/) — the two mechanisms
`mini-pages/` reuses.
