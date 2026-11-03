# Minion brief — AI 2 falls back quietly while Servex runs the old code

Load the `minion` skill first, then `code`. Worktree `C:\Code\lew42\worktrees\page-cards`. Do not commit; I do.

## Why (from the owner's tab)

> "The owner uses /ai2/ all day and does not want to see errors." A Servex restart is held until
> agents survive a restart. Until then, /ai2/ must quietly fall back to the old path, or show
> nothing for that piece, with ZERO console errors. When the restart happens later, the new path
> simply takes over.

Today the running Servex (127.0.0.1:8090) has no card routes. `GET /cards?view=all` falls through
to its static handler with no CORS header, so the browser logs a CORS error. The browser cannot
suppress that error, so the page must not make the request at all.

## The design (decided — build exactly this)

1. **Servex says it has the routes.** In `Servex/cards/Cards.js` `initialize()`: if `this.log` is set,
   append ONE line to the `features` log: `this.log.append("features", { cards: 1 }).catch(() => {})`.
   It fires when Servex boots with the new code. `GET /log/features?n=20` already answers `[]` with
   CORS on the OLD Servex (checked: 200, `Access-Control-Allow-Origin: *`), so the probe never errors.
   Make sure `test.mjs` still passes (its fake log may need an `append`).
2. **AI 2 asks once.** In `public/framework/ai2/inbox.js`, add `cards_ready()`: a memoised promise that
   fetches `servex_base() + "/log/features?n=20"` and is true only if some entry has `cards`. It is
   false on any failure. `servex_json()` is the one place every card call goes through (`/card/create`,
   `/card/append`, `/card?id=`, `/cards?view=`). Make it return null WITHOUT fetching when
   `cards_ready()` is false. Every caller already treats null as "Servex has no card routes". Check
   each caller, including the ones in `page.js` and `card.js`, and that null gives the old path:
   - the rail and overview list from `board.jsonl` as before;
   - `+ New card` uses the old `new_card()`;
   - the composer still posts `/log/prompts` and `/log/cards/<slug>`, but not `/card/append`;
   - on a card page, the type picker and `+ sub-card` are hidden (not an error) when not ready;
   - a folder card's page still draws: it loads from the dev server, same origin.
3. Grep ai2/ (not live.js) for any other request to `servex_base()` that the old Servex does not answer
   with CORS, and gate it the same way.

## Proof, both ways

- **Old Servex (the real one, never restart it):** the worktree's dev server on port 4817. Open
  `/framework/ai2/`, a migrated card `/framework/ai2/2026/09/24/topic-mufuomsy/`, and the overview
  headless with Playwright: zero console errors, zero failed requests. Do not click Send, or anything
  that posts to the real Servex.
- **New Servex:** the scratch harness from the earlier view round (in the scratchpad,
  `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-worktrees-page-cards\2a1fcc71-6ce1-4224-b379-eef0fe42020f\scratchpad\`)
  with `?servex=` pointing at it. It must answer `/log/features` with `[{cards:1}]`. Show that the
  folder list and the type picker appear, and still zero errors.

## Fence

`Servex/cards/Cards.js`, `Servex/cards/test.mjs`, `public/framework/ai2/` except `live.js`, scratch files.

## Done

Last message: the two proofs (error counts), and the list of gated calls.
