# Inbox data: where the cards live, and the inbox as the timeline of the big things

Budget: $20. Load the `sub-mastermind` and `page` skills first. You are an Opus task mastermind because the whole AI UI will sit on this data-structure decision. Your log is this dir's `task.jsonl`.

## The ask, in the owner's words

Source: `../requirements-3.md`, asks 2 and 5.

> the inbox should be a prioritized view of only the important things, ranked by recency, so as I scroll I see all the big things I've been asking for… an appendable JSONL set, loaded and sorted… one robust system for the data structure, streaming and updates shared with the sessions page and the data grid: a preview rail, click for the detail, a right sidebar per card to talk to it… an iceberg page of what happened recently

Rules from CLAUDE.md: one of everything; stream, don't poll; compute, don't recall; design the class architecture before you build; never destructive.

## What exists (read in this order)

- **Inbox class:** `public/framework/core/Page/ext/Inbox/Inbox.js`, two views of one thing. `Inbox.rank` landed today (`doc/ranking.md`) and scores `owner_note` items 100 (line ~104).
- **Card notes:** `Servex/cards/Cards.js` `owner_note` appends to a card's `page.jsonl` and to `public/framework/ai/cards.jsonl` (170 KB).
- **Old board:** `public/framework/ai/board.jsonl` (397 KB, the v/3 board, last written 10-12).
- **Page inbox:** `core/Page/PageInbox.js` holds notes to the agent that owns a page.
- **Grid and query:** `ext/DataGrid` is the grid the Sessions page uses. `ext/Query` is the node-side query behind the Sessions rows (server-query, 10-12).
- **Big things built:** every task's `task.jsonl` landing line (`assign.landed_at`, `title`, `outcome`, `links`).
- **Sibling `storage-design`:** writes the Store class architecture (`core/Page/doc/storage.md`, no code). Read it when it lands and stay consistent, or say where you differ and why.
- **Sibling `session-index`:** builds the in-memory query over sessions. Read through it if ready, else through `ext/Query`.

## Deliverable

1. **The map, computed** (`doc/inbox-data.md` beside Inbox.js, one screen): every source the inbox draws from today (file, writer, reader, line kind, count), by a script that counts them; which are duplicates of each other (board.jsonl vs cards.jsonl vs page.jsonl owner_note lines); which one is the record and which are caches.
2. **The decision**: one appendable JSONL set the inbox is built from (most likely: the card pages' own `page.jsonl` lines plus every task's landing line, read through the node query, with `cards.jsonl` as the index and `board.jsonl` retired to read-only), with alternatives and trade-offs; a `decision` line in your log. Write what retires as read-only with a pointer, never deleted.
3. **The timeline**: the inbox shows, newest first, every landed task's title + one-line outcome + link as a row (the "oh yeah, oh yeah" scroll), interleaved with owner notes and open needs-you items ranked by `Inbox.rank`; a filter chip "big things only" (landed tasks with a page or demo link, owner notes) on by default. Preview rail → detail page → the card's own chat in the right sidebar: reuse what `AISessionDetail` and the card page already do; add nothing new if a component exists (`ext/DataGrid` for the rows if it fits a rail, else the Inbox's own rows). Streams via the existing `live()` tail; no `setInterval`.
4. **Four widths**, smoke clean, `merge.mjs`, a 1200 screenshot on the card; the Inbox page's debug view shows the rows' sources and scores.
5. Report on your card: the decision in three lines, how many rows the timeline has today, the link, the screenshot.

Fence: `public/framework/core/Page/ext/Inbox/**`, `ext/Query` (additive query only), one link line in `public/framework/ai/readme.md`, this task dir. `Servex/cards/Cards.js` is read-only: a needed server change is a `decision` line with the exact edit. Opus judges; Sonnet minions build; Haiku counts.
