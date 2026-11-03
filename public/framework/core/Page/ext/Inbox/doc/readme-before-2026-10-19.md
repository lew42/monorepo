# Inbox — one class, two views: a page's rail, and its small "leave a note" box

**The rail is a [Browse](/framework/ux/Browse/)** (2026-10-14): `Inbox.Rail extends Browse`, the one list-and-detail view the Inbox and Sessions share; the AI Inbox pins **Waiting on you** (`WaitingOnYou.js`, every open owner decision, one line each, ticked → archived) above its rows. Classes: [ux/Browse/doc/architecture.md](/framework/ux/Browse/doc/architecture.md).

**The inbox timeline** ([open it](/framework/core/Page/ext/Inbox/timeline/)): every landed task, owner note and needs-you card, ranked by `Inbox.rank`, as a preview rail with the detail beside it. Where its rows come from, the one data decision, and its classes (`Timeline`, `TimelinePage`, `Landings`, `InboxSources`): [doc/inbox-data.md](doc/inbox-data.md).

`class Inbox` holds one page's inbox; `inbox.rail` and `inbox.compact` are its two views,
each built lazily the first time you read it:

```js
import Inbox from "/framework/core/Page/ext/Inbox/Inbox.js";

const inbox = new Inbox({ page: this });
inbox.rail.mount();     // the big rail — see it running at /framework/ux/Inbox/
inbox.compact.view();   // the small box — see it in the drawer's AI tab
```

- **`inbox.rail`** (`Inbox.Rail`, was the standalone class `InboxRail`) — a rail of row
  previews beside the page you picked, persistent and never jumping. The AI page's Inbox
  and Log tabs, and AI 2, build its subclass `AIRail` (`ai2/rail.js`):
  `class AIRail extends Inbox.Rail`.
- **`inbox.compact`** (`Inbox.Compact`, was the standalone class `DrawerInbox`) — the small
  "Leave a note" box at the top of the drawer's AI tab, read and written through Servex's
  `/api/inbox`. Also the page.jsonl extension described below (its `static setup` is what
  `{"ext": "Inbox"}` and `Page.use(Inbox)` both call).

Any agent (or the owner) can leave a message on ANY page, just by appending one line
to that page's own `page.jsonl`:

```json
{"inbox": {"type": "message", "author": "mastermind-servex-9", "text": "…", "at": "2026-09-30T16:00:00-05:00"}}
```

- `type` is `"message"` (a plain statement) or `"question"`. A missing `type` reads as
  `"message"`.
- `author` is whoever sent it. An older line that says `from` instead still reads
  correctly — `author` falls back to `from`.

## Turn it on

One line, anywhere in the page's `page.jsonl`:
```json
{"ext": "Inbox"}
```
After that, every `{"inbox": …}` line on that page — before the `ext` line or after it
— collects into `page.inbox`, an array, oldest first. See it running at
[core/Page/ext/](/framework/core/Page/ext/) — the extension system's own demo page.

## The newer way in: `page_note` (2026-10-02)

The `{"inbox": …}` line above goes through Servex's `drop` tool and is read through Servex's
`/api/inbox` — so with Servex down, the box above is empty even though the note is sitting
right there in the file. **`page_note(path, text, {to})`** (Servex) writes a `{"note": {id,
from, to?, text, at}}` line instead, and `notes()` (`Inbox.js`) reads it straight from the
page's own `page.jsonl` — no Servex needed, just the dev server serving the file. `to` (or the
page's module coordinator, if it has one) also gets a short WAKE from Servex — never the note's
own text, which already lives in the file; the agent reads it with `page_read`. The two note
shapes are merged in one list by `notes()`, so nothing written the old way stops showing.
`drop`/`clear`/`inbox` (the `{"inbox": …}` shape) keep working unedited, for one release.

## Architecture

One class, `Inbox`, with two lazy views (`inbox.rail`, `inbox.compact`); `InboxRail` and `DrawerInbox` are the old names, re-exported for one release. The before/after of the 2026-10-02 restructure: [doc/InboxRail-notes.md](doc/InboxRail-notes.md#architecture-moved-from-readmemd-2026-10-13-verbatim).

## Files

`WaitingOnYou.js` — `class WaitingOnYou extends Browse.Pinned`, the open owner decisions from `ai/cards.jsonl` and `ai/asks.jsonl`. `Timeline.js` — `class Timeline`, the timeline's rows (two streamed indexes, ranked). `timeline/` — its page (`TimelinePage.js`) and its index `landings.jsonl`. `Landings.mjs` and `InboxSources.mjs` (node) — write that index and count every source the inbox reads; run them from the repo root: `node public/framework/core/Page/ext/Inbox/Landings.mjs --append`. `ai/board.jsonl` (the v/3 board) is retired, read-only: [doc/inbox-data.md](doc/inbox-data.md). `Inbox.js` — `class Inbox`, its `Inbox.Compact` static (the drawer's box + the page.jsonl
extension), and the deprecated re-exports. `Rail.js` — `Inbox.Rail`'s class body (plain
`class Rail`), the big navigation rail — see its look and demo at
[/framework/ux/Inbox/](/framework/ux/Inbox/). `servex.js` — Servex's address and whether
it is up (moved here from `ai2/inbox.js`, which re-exports it, so this folder imports
nothing from AI 2).

## More

- [`ai2/rail.js`](/framework/ai/rail/rail.js) — `AIRail`, the subclass with the usage meters
- [`/framework/ux/Inbox/`](/framework/ux/Inbox/) — `Inbox.Rail`'s own demo and look
- `ext/drawer/` and `doc/inbox.md` — the drawer's "Leave a note" box, `Inbox.Compact`

- Data: [doc/inbox-data.md](doc/inbox-data.md) — the sources the inbox reads (computed by `node InboxSources.mjs`), which is the record and which a cache; `node Landings.mjs --append` refreshes the timeline's index.
- Ranking: [doc/ranking.md](doc/ranking.md) — `Inbox.rank`: importance + recency, new rows float up, owner state sinks.
- Notes: [doc/InboxRail-notes.md](doc/InboxRail-notes.md) — history and lessons moved out of the code comments.
- Next: [doc/next.md](doc/next.md) — what the 2026-10-13 review ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)) left open: the stale pinned Now card.
