# Inbox data: where the inbox's rows come from, and the one set it is built from

**See it:** [the inbox timeline](/framework/core/Page/ext/Inbox/timeline/): every landed task, owner note and needs-you card in one ranked rail. Click a row to open its detail beside the rail, with the card's own chat on its right, where you talk to it. [`?debug`](/framework/core/Page/ext/Inbox/timeline/?debug) shows each row's source line and score.

## The decision (2026-10-13)

1. **A record is the file its writer already appends to:** a card's own `page.jsonl` (cards, owner notes, chat) and a task's own `task.jsonl` landing line (what was built). Nothing is copied by hand.
2. **The inbox reads two indexes (caches, computed from the records), streamed with `live()`:** [`ai/cards.jsonl`](/framework/ai/cards.jsonl) (written by Servex `Cards.js`) and [`timeline/landings.jsonl`](../timeline/landings.jsonl) (written by `node Landings.mjs --append`, append-only).
3. **`ai/board.jsonl` is retired, read-only.** It is the v/3 board. Its last writer is health-watch (`every-prompt/say.mjs`), and only `rail/inbox.js` reads it, as a fallback when `cards.jsonl` is missing. Nothing deletes it.

Alternatives weighed (the `decision` line in [the task log](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-data/)):

- **A node Query source** that holds every task and card in memory, with no index file. It runs only on the dev server, so a static host would still need a file. It also needs `Server/run.js` and a restart. It can be added later over the same row shape without changing the view.
- **One new `ai/inbox.jsonl` that every writer also appends to.** That makes a third copy of every card and landing, and copies drift. `board.jsonl` vs `cards.jsonl` is that drift today: 297 of the board's titles are also cards.
- **Keep `board.jsonl`.** Its 372 slug ids don't match the card folders, and nothing but health-watch writes it any more.

## The map, computed

Refresh the table below from the repo root of the main tree (a worktree counts its own, older files): `node public/framework/core/Page/ext/Inbox/InboxSources.mjs --write`. Never type a number into it by hand.

<!-- sources -->
| Source | Role | Writer | Reader | Holds today | Last |
|---|---|---|---|---|---|
| card `page.jsonl` (ai/YYYY/MM/DD/slug/) | **record** (cards, owner notes, chat) | Servex `Cards.js` (`create_card`, `append`, `owner_note`) | card page (`ai/cards/card.js`), `rail/inbox.js` `resolve_card` | 506 cards, 3344 lines; 22 owner_note lines on 22 cards | 2026-10-13 |
| `ai/cards.jsonl` | **index** (a cache of the above) | `Cards.js` (debounced whole rewrite) | `rail/inbox.js` `static_cards` (the AI Inbox tab), Timeline | 572 rows (open 347, done 142, needs-you 41, working 25); 22 with an owner_note | 2026-10-13 · 168 KB |
| task `task.jsonl` landing lines | **record** (what was built) | every agent, `finish-task` (`assign.landed_at`) | `Server/PastWork.mjs`, day pages, Timeline (through the index) | 1487 task logs, 1302 landings (1087 big: a page link or a card) | 2026-10-13 |
| `Inbox/timeline/landings.jsonl` | **index** (a cache of the landings) | `node Landings.mjs --append` (append-only) | Timeline (`live()` tail) | 1302 rows | 2026-10-13 · 428 KB |
| `ai/board.jsonl` | **retired** (the v/3 board), read-only | `every-prompt/say.mjs` (health-watch only, last) | `rail/inbox.js` `BOARD_URL` when the card index is missing | 770 lines (card 770); 372 card ids, 297 titles also in cards.jsonl | 2026-10-12 · 387 KB |
| page `note` / `inbox` lines (any page.jsonl) | **record** (coordination notes to a page's agent) | Servex `page_note`, `drop` | `Inbox.notes()`, the drawer's box (`Inbox.Compact`) | 19 note + 400 inbox lines on 107 pages | – |
| `ai/asks.jsonl` | record (owner asks and who owns them) | Servex asks ledger | `rail/inbox.js` stalled-ask rows | 274 lines | 2026-10-13 |
| `ai/verdicts.jsonl` | record (Approve/Improve presses) | `Server/plugins/CardAnswer.js` | `rail/inbox.js` | 70 lines | 2026-09-23 |

Counted by `node InboxSources.mjs` on 2026-10-13 22:01 UTC.
<!-- /sources -->

**Duplicates:** `cards.jsonl` copies each card's `page.jsonl` (its summary row and its last owner note). `landings.jsonl` copies one line of each landing. `board.jsonl` and `cards.jsonl` are two boards of the same kind of thing; only `cards.jsonl` is still written.

## The classes

| Class | File | Job |
|---|---|---|
| `Landings` (node) | `Landings.mjs` | Reads every `task.jsonl` and turns each landing into one row. `--append` adds the missing rows to the index. |
| `InboxSources` (node) | `InboxSources.mjs` | Counts every source above and writes the table. |
| `Timeline` | `Timeline.js` | Streams the two indexes and returns ranked rows. Each row carries its `source` and its `score` (`Inbox.rank`). `Timeline.Landed` and `Timeline.Cards` are its two `JSONL` readers. |
| `TimelinePage extends Page` | `timeline/TimelinePage.js` | The rail is one `ext/DataGrid` in rail view, and `columns()` opens a row beside it. `TimelinePage.Detail` is one row's page: the full outcome and links, read from the task's own log. |
| `TimelineTalk` | `timeline/TimelineTalk.js` | The card's chat beside the detail. It streams the card's `page.jsonl` (`prompt` and `message` lines) into the same `CardChat` log and `Compose` box the card page uses. |

**Seen and the day (2026-10-13, the owner: "once I've seen it, we get rid of it"; "filtering the inbox by date"):** opening a row marks it seen, and seen rows leave the default view. They are never deleted: the **Seen too** chip (`?seen`) brings them back, and **Mark all seen** clears everything up to now. Seen is kept per browser (`PagePrefs`, `Timeline.Seen`), like the AI rail's read flag. The **Today** and **Yesterday** chips (`?day=today`, `?day=yesterday`, or `?day=2026-10-12`) scope the rows to one local day. Browsing *sessions* by date belongs to the [Sessions](/framework/ai/sessions/) page.

**Rows:** a landing has a page or a card → "big". An owner note, or a card with status `needs-you`/`blocked`, is always shown. The "Big things only" chip is on by default (`?all` turns it off).

## Edits outside this module (not made here; exact text)

- **Live on every landing.** In `Server/on-landing.mjs`, after the `council.mjs` spawn (line ~43), add:
  `try { spawnSync(process.execPath, [path.join(root, "public/framework/core/Page/ext/Inbox/Landings.mjs"), "--append"], { stdio: "ignore", windowsHide: true }); } catch {}`
  **Not made yet (2026-10-13).** Until it is, run `node public/framework/core/Page/ext/Inbox/Landings.mjs --append` from the repo root, then commit `timeline/landings.jsonl`; the page's `live()` tail shows the new rows at once.
- **The AI page's Inbox tab** (`ai/rail/inbox.js`, `CardList`) still reads `cards.jsonl` on a 20 s `setInterval`. It should take its rows from `Timeline` (one stream, no poll), so both inboxes show the same ranked list.
- **health-watch** should post through `owner_note` (Servex) instead of `say.mjs` → `board.jsonl`. Then the board has no writer at all.

## Watch out

- With no row open, the space right of the rail is empty, as on the [Sessions](/framework/ai/sessions/?view=rail) rail. Opening the top row by itself was weighed and left out: it would change the url on every load.

- `landings.jsonl` is committed, so it is kept small: about 340 bytes a row, links left out. The detail page reads the links and the full outcome from the task's own `task.jsonl`.
- A row's url is its line number in `landings.jsonl` (`/timeline/1300/`). This is stable only because the file is append-only: never rewrite or re-sort it.
- `cards.jsonl` is rewritten whole by `Cards.js`, so `live()` replays it as a reset rather than as an append. That is correct, just not an append.
