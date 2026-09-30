# Every page has an inbox

**Anyone, an agent or the owner, can leave a note on any page.** The note shows at the top of that page's AI tab (the drawer) until someone clears it. The view: [ext/drawer/doc/inbox.md](/framework/ext/drawer/doc/inbox/).

**Coordination, never chat** (the owner, 2026-09-30). Use it only when it is necessary: the owner asked you to tell another agent, or a handoff. One mastermind coordinates a module, so a note goes to that mastermind first; the page inbox is the fallback.

## Who coordinates a module

A task mastermind that takes a module claims it with `claim_topic`, topic = the module path (`core/Page`, `ext/drawer`, `Servex/agents`), and releases it at landing (`release_topic`). `list_claims` is the lookup. Taking or releasing the claim writes one line into the module's own `ai/log.jsonl`:

```
{"coordinator": {"agent": "task-mastermind-doc-pass", "task": "public/framework/ai/2026-09-30/doc-pass", "topic": "ext/Doc", "event": "claimed", "at": "…"}}
```

`drop(path, text)` looks for the most specific live claim whose topic contains `path`. If there is one, the note goes to that mastermind (`send_to_agent`), and its line lands in the module's `ai/log.jsonl` with `path` and `routed_to`; it never shows in a page inbox. Only when nobody coordinates the module (or the coordinator can't be reached) does the note wait in the page's inbox.

## The tools

| Tool | What it does |
|---|---|
| `drop(path, text)` | Leave a note. `from` is you, stamped by Servex. Answers the note's `id`, and `routed_to` when it went to the coordinator. |
| `clear(path, id)` | Clear one open note. An id that isn't open is refused. |
| `inbox(path)` | The open notes, newest first, and the module's `coordinator` (or null). |

`path` is a site path (`/framework/core/Page/`) or a repo folder (`Servex/agents`). It must exist.

## The routes, for a page's own form

- `POST /api/inbox/drop` with `{path, text}` (a browser is the owner; an optional `from` names an agent, and **is not checked**: loopback only, unlike the MCP tool's stamped caller)
- `POST /api/inbox/clear` with `{path, id}`
- `GET /api/inbox?path=…`: a path with no folder answers an empty list, never a 404

## The file

One line per event, in `<page dir>/ai/log.jsonl`, the page's AI log:

```
{"inbox":   {"id": "n-g7yptezx", "from": "minion-layout-audit", "text": "…", "at": "2026-09-30T13:38:33.857-05:00"}}
{"cleared": {"id": "n-g7yptezx", "by": "owner", "at": "2026-09-30T13:40:02.114-05:00"}}
```

Append only. A note is open until a `cleared` line names its id. Servex is the only writer, so two drops never tear a line. Never `page.jsonl`: that is the page's content.

Code: [`agents/inbox.js`](../agents/inbox.js), wired in `Servex.js` (constructor, `tools()`, the router); the coordinator lines come from `claims.js`'s `on` hook, set in `Global.claims()`. New tools and routes go live only after a Servex restart.
