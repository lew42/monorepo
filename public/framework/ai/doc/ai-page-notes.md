# AI Page Architecture and Routing

## What a rail row can be called

The `RAIL_ID` regex defines valid shapes: tabs (Inbox, Log, Live, Now, View, Framework), years (`\d{4}`), sentences (`p-393`), asks (`ask:…`), old board cards (uuid, `topic-…`). Only these shapes are recognized; AI 2 claims every unknown name as a card, but real folders with their own `page.js` (`v/`, `talk/`, `collab/`) are found by the probe after `route()`.

## The ?v1 version flag

Under `?v1`, the original board is kept addressable at the same URL. The flag is read fresh on every call (not captured once) because a picker click is a real navigation but intra-page route changes are not.

## LEVEL 1 redesign (2026-09-30)

The page was redesigned to show the AI system itself rather than a board. The V3 board that stood here lives on at `/framework/ai/v/3/`. The board's own hand-back (`v/3/page.js` `draw_board`) never paints it here because `board_drawn` stays true.

## The band and tabs

THE BAND is the icon, the title and the tabs in ONE row on every AI page, the dashboard included (`head()` in page.js; the strip swipes sideways). **Home** owns the bare URL (the dashboard) and wears `.tab-default` (ext/tabs' "not really a match" flag), so a card URL (which matches no tab) lights Home by ext/tabs' first-child fallback. The page is built once per load, as the dashboard or as the rail, so Home, the title, Tasks and every tab on the dashboard are full loads (`target=_self`). An Inbox filter on the bare url (the Tasks tab forwards to one) marks its own tab `aria-current`, and rail.css un-lights Home beside it.

The REST of the strip is DETECTED, not hand-listed (AIOverview.js's `AIOverview.detectTabs()`, owner 2026-10-01): these links render after the page's own `mark()` pass, so they need their own `mark()`, same as a late ext/tabs strip does.

## The rail (AIRail)

AIRail is the same class AI 2 builds: one of everything (CLAUDE.md law 6). Every page routed here opens in its detail column; a card beside the rail, any other page across the whole width (`add()` below).

## The head row (v1 only)

The title and the version picker, side by side. Core draws the h1 just before calling `content()`, so the row is made here and the h1 it follows is moved into it — no core edit. If core ever stops drawing the title first, the row simply holds the picker alone.

## Dashboard pages

A day that hasn't written its page yet is still a dashboard, and its task dirs still get the manifest viewer, same as a declared day's `route()`. A plain Page sets no `$pages`, so a routed task walks up to the AI page's catalog region and lands beside its day rather than inside it — which is why `ai.css` stands the day aside while one of its tasks is showing.

## The effort/ segment

`effort/` is the second segment a category tag can claim, and it earns the nesting: a bare slug here is indistinguishable from a typo and would turn every miss under `/framework/ai/` into a blank filter.

## What sits beside the rail

The Inbox and Log tabs, a card, Live, Now, the pinned Today/Yesterday day pages, Your prompts and the card views are rail-sized: the rail is a switcher and stays beside them (the owner, 2026-10-13). Every other page routed here (System, a concept, the old board views) takes the whole width — `inbox-takeover` (ux/Inbox/Inbox.css) steps the rail aside while it is open.

## The five views (2026-09-22)

The board has five views that are five URLs: `/framework/ai/days/`, `/framework/ai/now/`, `/framework/ai/grid/`, `/framework/ai/timeline/` and `/framework/ai/prompts/`. Each opens that view of the board, and a card opened inside one gets its own URL under it. None of the five can look like a date, `log` or `effort`. The board itself owns the routing (`v/3/page.js`'s `board_route`), so `/framework/ai/grid/` and `/framework/ai/v/3/grid/` cannot drift.

The owner's own words: "the timeline, prompts, grid, now, and days don't even have a route... a live reload would navigate me away from this page." First, because none of the five can ever look like a date, `log` or `effort`.

## The pinned Now card (2026-09-30)

The pinned Now card wins here, ahead of `board_route()`, which would otherwise claim "now" as one of the old v3 board's own five view words (`VIEW_WORDS`, `ai/v/3/page.js`) and show something empty. The owner already saw that happen (`/framework/ai/now/` rendered blank before this). `ai/now/page.jsonl` is a real Servex-made card folder — read directly with `fold.js`'s own small parser (no `ai2/card.js` `Card` class or its `shell` needed for a one-note read), same content AI 2's own `/framework/ai2/now/` shows.

## The rail's own addresses

Live, a card at its real folder (`2026/09/30/<card>/`, the year, month and day are pages too), the card views, a changed site page, Your prompts. `AIRail.handles()` is the ONE list (bug 4, 2026-10-03: this page used to hand-list a shorter set than the rail itself routes, so a rail link to "your-prompts" 404'd) — the same `AIRail.route()` AI 2 uses, so a card opens the same way on both. A row that is not a card folder opens the same card page AI 2 gives it.

## Day routing

Days stay a dashboard at their address (a view, not a folder); tasks moved into the sessions store (ai/doc/task-folders.md) and `route(task)` redirects each old task address. The `warm()` call fires the instant this day is routed to, not when its `dashboard()` happens to render — a cold deep link straight to a task below has no earlier chance, and every other child() hop still ahead gives the fetch time to land before `route(task)` below ever asks.

## By-system view (2026-10-04)

"By system" — the SAME day's prompts, regrouped (the owner's follow-up: "if all of my prompts can fit within a different structure"). Its own URL, never a query-string toggle (route everything, CLAUDE.md).

## By-module breakdown

"By module" — the day's spend/module breakdown's own click-through URL. Server/DaySpend.mjs writes the data; module-spend.js draws both ends.

## Month routing

A month is a stub (deliverable 5): checked after the day regex above (a day always wins — `\d{4}-\d{2}-\d{2}` never also matches `\d{4}-\d{2}`).

## Log/ and the archive

`log/` is the archive this page used to BE: every task of every day, in-flight first, forty at a time. A route rather than a `log/` dir with its own `page.js`, for one reason — the date route above is a regex on the SAME segment, and a declared child would have to be kept out of its way forever. `effort/` is the prior art; `log` can never look like a date. Under ?v1 the year/month/day dirs are bare pass-throughs (the rail answers them above).

## The task log

Every task of every day, in-flight first. It was `log/` until the Log tab (the rail at floor 0) took that URL; under ?v1 `log/` still draws it.

## Concept pages

One concept's page: the gist first, then a few items, then the code that owns it, then the Servex page where Servex implements it (linked, never repeated).

## System shown by effect

A system is shown by its effect (owner 2026-09-30: the iceberg). Where a page's data lives (mastermind-servex-9's merge-approval proposal, §7).
