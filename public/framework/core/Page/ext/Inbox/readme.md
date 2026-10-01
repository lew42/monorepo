# Inbox — a message, appended straight to a page's own log

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

## Draw an inbox: `InboxRail`

`Rail.js` is the class that DRAWS an inbox: a rail of row previews beside the page you
picked, persistent and never jumping. Any page builds one with
`new InboxRail({ page: this }).mount()`; the AI page and AI 2 build its subclass `AIRail`.
Its look and demo are the ux block, [/framework/ux/Inbox/](/framework/ux/Inbox/) — start
there.

## The other Inbox in this file — the drawer's, unrelated

This same file, `Inbox.js` (moved here 2026-09-30 from `ext/drawer/inbox.js`, which is
now a one-line re-export so nothing that imported it had to change), also draws the
**AI tab's page inbox**: the small "Leave a note" box at the top of the drawer, read
and written through Servex's `/api/inbox` — a coordination inbox, for any agent
currently working on a page, not page.jsonl data. That part is untouched. See
`ext/drawer/` and `doc/inbox.md` for it.

## Files

`Inbox.js` — both halves: `DrawerInbox` (the drawer's Servex-backed reader/writer, as
before) and its new static `setup(page)` (the extension above, `page.inbox` from
page.jsonl). `Rail.js` — `InboxRail`, above. `servex.js` — Servex's address and whether
it is up (moved here from `ai2/inbox.js`, which re-exports it, so this folder imports
nothing from AI 2).
