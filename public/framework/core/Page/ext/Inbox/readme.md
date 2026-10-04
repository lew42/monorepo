# Inbox — one class, two views: a page's rail, and its small "leave a note" box

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

## Architecture: before and after (restructured 2026-10-02)

**Before:** two unrelated classes shared this folder, with no connection to each other —
`InboxRail` (`Rail.js`) and `DrawerInbox` (`Inbox.js`), even though both are "a message,
on a page," just read from two different places (Servex's `/api/inbox` vs. whatever rows
a page's own `source()` returns). Nothing pointed from one to the other, and `ai2/rail.js`
named `InboxRail.prototype` the misleading `store` — it holds no data, just the rail's
try/catch `localStorage` helper methods.

**After:** one class, `Inbox` (`Inbox.js`), holding `{ page }`. Its two views are reached
through two lazy getters, `inbox.rail` and `inbox.compact`, each built once and cached on
first read — building one never builds the other. `Inbox.Rail` is `Rail.js`'s class,
unchanged, imported into `Inbox.js` and assigned there (`Inbox.Rail = Rail`) — chosen over
moving the class body itself so `Rail.js` never has to import `Inbox.js` back (no import
cycle). `Inbox.Compact` is `DrawerInbox`, renamed and kept inside `Inbox.js` itself (small
enough that a second file would be more ceremony than help) — a later task builds the
actual Overview-dashboard tile on top of this same class. `ai2/rail.js`'s `store` is now
`storage`, and `AIRail` extends `Inbox.Rail` directly.

**Deprecation, for one release:** `InboxRail` and `DrawerInbox` are both still exported
from `Inbox.js`, pointing at the new names (`export const InboxRail = Inbox.Rail;` etc.),
so any import written before this change keeps working with no edit — `ux/Inbox/page.js`'s
demo, for one, still imports `InboxRail` from `Rail.js` directly and needs no change. New
code should write `Inbox.Rail` / `Inbox.Compact` instead; these two old names go away once
nothing in the repo still uses them.

## Files

`Inbox.js` — `class Inbox`, its `Inbox.Compact` static (the drawer's box + the page.jsonl
extension), and the deprecated re-exports. `Rail.js` — `Inbox.Rail`'s class body (plain
`class Rail`), the big navigation rail — see its look and demo at
[/framework/ux/Inbox/](/framework/ux/Inbox/). `servex.js` — Servex's address and whether
it is up (moved here from `ai2/inbox.js`, which re-exports it, so this folder imports
nothing from AI 2).

## More

- [`ai2/rail.js`](/framework/ai2/rail.js) — `AIRail`, the subclass with the usage meters
- [`/framework/ux/Inbox/`](/framework/ux/Inbox/) — `Inbox.Rail`'s own demo and look
- `ext/drawer/` and `doc/inbox.md` — the drawer's "Leave a note" box, `Inbox.Compact`
