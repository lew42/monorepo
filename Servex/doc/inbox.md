# Every page has an inbox

**Anyone, an agent or the owner, can leave a note on any page.** The note shows at the top of that page's AI tab (the drawer) until someone clears it. The view: [ext/drawer/doc/inbox.md](/framework/ext/drawer/doc/inbox/).

## The tools

| Tool | What it does |
|---|---|
| `drop(path, text)` | Leave a note. `from` is you, stamped by Servex. Answers the note's `id`. |
| `clear(path, id)` | Clear one open note. An id that isn't open is refused. |
| `inbox(path)` | The open notes, newest first. |

`path` is a site path (`/framework/core/Page/`) or a repo folder (`Servex/agents`). It must exist.

## The routes, for a page's own form

- `POST /api/inbox/drop` with `{path, text}` (a browser is the owner; an optional `from` names an agent)
- `POST /api/inbox/clear` with `{path, id}`
- `GET /api/inbox?path=…`: a path with no folder answers an empty list, never a 404

## The file

One line per event, in `<page dir>/ai/log.jsonl`, the page's AI log:

```
{"inbox":   {"id": "n-g7yptezx", "from": "minion-layout-audit", "text": "…", "at": "2026-09-30T13:38:33.857-05:00"}}
{"cleared": {"id": "n-g7yptezx", "by": "owner", "at": "2026-09-30T13:40:02.114-05:00"}}
```

Append only. A note is open until a `cleared` line names its id. Servex is the only writer, so two drops never tear a line. Never `page.jsonl`: that is the page's content.

Code: [`agents/inbox.js`](../agents/inbox.js), wired with two lines in `Servex.js` (`tools()` and the router). New tools and routes go live only after a Servex restart.
