# Inbox — one ranked list of what wants the owner's attention, and the note box on every page

An **inbox** is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, `Inbox.rank`. There are two views of it, and one class holds both. See the rail running: [/framework/ux/Inbox/](/framework/ux/Inbox/) (sample rows) and the real one on the [AI page](/framework/ai/). See the timeline: [timeline/](/framework/core/Page/ext/Inbox/timeline/) (add `?debug` to see each row's source file and score).

## The classes

```js
class Inbox                              // Inbox.js — holds { page }; the ranking lives here as statics
  Inbox.Rail    = class Rail extends Browse            // Rail.js — the big list + detail pane (ux/Browse)
  Inbox.Compact = class Compact                        // Inbox.js — the small "Leave a note" box, and the page.jsonl extension
class AIRail extends Inbox.Rail                        // ai/rail/rail.js — the AI page's inbox: adds usage meters, cards, "+ New card"
class WaitingOnYou extends Browse.Pinned               // WaitingOnYou.js — the pinned "Waiting on you" list, with a tick per line
class Timeline                                          // Timeline.js — landed tasks + owner notes + needs-you cards as ranked rows
class TimelinePage extends Page                         // timeline/TimelinePage.js — the Timeline as a rail (ext/DataGrid) with a detail beside it
```

Old names `InboxRail` / `DrawerInbox` are exported from `Inbox.js` and equal `Inbox.Rail` / `Inbox.Compact`; write the new names.

| Property (class) | Type | Meaning |
|---|---|---|
| `inbox.page` (`Inbox`) | string | the page's url path; both views take `{ page }` |
| `inbox.rail`, `inbox.compact` | `Inbox.Rail`, `Inbox.Compact` | built lazily on first read, then cached |
| `rail.items` / `rail.list` (`Rail`) | `Row[]` | the rows given / the rows shown, see *A row* |
| `rail.min` (`Rail`) | number | the score floor; rows scoring under it stay out. Default `Rail.FLOOR` = 90; `?min=0` is the Log |
| `compact.open` (`Compact`) | `Note[]` | open notes on this page, newest first |
| `compact.coordinator` (`Compact`) | `{agent, topic}` or null | who holds the claim on this module (a note goes to them) |
| `page.inbox` / `page.notes` | arrays | filled on any page that turns on the extension, see below |
| `timeline.landed.rows`, `timeline.cards.by_id` (`Timeline`) | array, `Map` | the two streamed indexes in memory |
| `waiting.cards`, `waiting.asks` (`WaitingOnYou`) | `Timeline.Cards`, `Asks` (`JSONL`) | the two streamed files in memory |

**A row** (what `Inbox.rank` reads): `{ id, title, sub, kind, owner_kind, score, at, status, unread, reviewed, needs, page }`. `kind` is `owner_note`, `landed`, `card`, `task`, `note`…; `owner_kind` is `needs-you`, `risk` or `decision` on an owner note; `status` is `archived` to be hidden.

## Where the data comes from

Nothing is stored "in the inbox". Each source is a file its own writer appends to; the views only read.

| Source | Shape | Written by | Read by |
|---|---|---|---|
| a page's `page.jsonl`, older note | `{"inbox":{"type":"message"\|"question","author","text","at"}}` (also `{"inbox":{"id","from","text","at"}}` and `{"inbox":{"id","cleared":{…}}}`) | Servex `drop` / `clear` tools (`Servex/agents/inbox.js`) | `Inbox.Compact`: through Servex `GET /api/inbox?path=…` (empty when Servex is down) and, once the extension is on, straight from the file into `page.inbox` |
| a page's `page.jsonl`, newer note | `{"note":{"id","from","to?","text","at"}}` | the `page_note` tool (`Servex/agents/page_tools.js`) | `notes()` in `Inbox.js`: from the page's own `page.jsonl`, no Servex needed; merged with the older kind |
| `ai/cards.jsonl` | one card summary per line: `{id,title,status,state,preview,owner_note:{kind,text},last,created…}` | Servex `Cards.js` (rewritten whole, so `live()` replays it as a reset) | `Timeline`, `WaitingOnYou`, the AI page (`ai/rail/inbox.js` `CardList`) |
| `ai/asks.jsonl` | `{"ask":{id,card,title,status,why,at}}`, latest line per id wins | the Servex asks ledger | `WaitingOnYou` (status `waiting` / `needs-you`), `ai/rail/inbox.js` |
| `timeline/landings.jsonl` | `{"landed":{id,title,sub,at,page?,card?}}`, append-only (a row's url is its line number: never rewrite) | `node Landings.mjs --append`, which reads every `task.jsonl` landing line | `Timeline` |
| `ai/index.json` + `ai/index.jsonl` | every task folded into buckets; see [ai/tasks](/framework/ai/tasks/) | `Server/AIIndex.mjs` | `ai/rail/DashState.js` → `DashRow.rows()` → the AI page's task rows |

**Overlaps, one line each.** `ai/board.jsonl` is retired and read-only (fallback for `ai/rail/inbox.js` only); `cards.jsonl` is the canonical card list. `cards.jsonl` and `landings.jsonl` are caches of the card folders' `page.jsonl` and the `task.jsonl` landings, which are the records. Source counts, computed: [doc/inbox-data.md](doc/inbox-data.md) (`node InboxSources.mjs --write`).

## Turn on the note box for a page

One line in the page's `page.jsonl`: `{"ext":"Inbox"}` (or `Page.use(Inbox)` for every page). `Inbox.setup` forwards to `Inbox.Compact.setup`, which collects the page's `{"inbox":…}` and `{"note":…}` lines into `page.inbox` and `page.notes`, replaying the lines already loaded and then listening for new ones.

## The rank rule

`Inbox.rank(row, now)`, higher sits higher (full rule: [doc/ranking.md](doc/ranking.md)):

1. `status: "archived"` → `-1`.
2. `raw = importance + boost`. Importance is `score` if the row has one, else a weight by kind: needs-you 100, risk 97, decision 94, request 80, question 75, task 60, note 40, landed 30; an unreviewed owner note is 100.
3. Boost: under 30 minutes old, 201 falling to 101; then at most 30, falling to 0 over 24 hours.
4. Unread (`unread !== false`) → `raw + 10`; opened → `raw / 100` (below every unread row).

Rows are sorted by this in `Timeline.rows()` and `Rail`; a rail then hides rows under its floor.

## Waiting on you

`WaitingOnYou` is the pinned list at the top of the AI page's inbox. It streams `ai/cards.jsonl` and `ai/asks.jsonl` and lists (a) open cards with status `needs-you` or an owner note of kind `needs-you`, (b) asks with status `waiting` / `needs-you`. **Ticking a line** hides it at once (the id is kept in `localStorage`) and calls the pin's `tick`: `AIRail` passes `Rules.archive_row`, which appends `{status:"archived",by:"owner"}` to the card's `page.jsonl`. Nothing is deleted. An ask with no card cannot be archived by a tick.

## Files

`Inbox.js` · `Rail.js` · `WaitingOnYou.js` · `Timeline.js` · `timeline/` (`TimelinePage.js`, `TimelineTalk.js`, `landings.jsonl`) · `servex.js` (Servex address and whether it is up) · `Landings.mjs`, `InboxSources.mjs` (node scripts) · `page.js` (this module's page). Style: `ux/Inbox/Inbox.css` (`.inbox-shell`, `.inbox-rail`, `.inbox-detail`).

## More

[doc/inbox-data.md](doc/inbox-data.md) (source map, computed; open items) · [doc/ranking.md](doc/ranking.md) · [doc/next.md](doc/next.md) · [doc/InboxRail-notes.md](doc/InboxRail-notes.md) · the readme as it stood before 2026-10-19: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
