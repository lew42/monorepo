# Every page has an inbox

**Anyone, an agent or the owner, can leave a note on any page.** The note shows at the top of that page's AI tab (the drawer) until someone clears it. The view: [ext/drawer/doc/inbox.md](/framework/ext/drawer/doc/inbox/).

**Coordination, never chat** (the owner, 2026-09-30). Use it only when it is necessary: the owner asked you to tell another agent, or a handoff. One mastermind coordinates a module, so a note goes to that mastermind first; the page inbox is the fallback.

## Who coordinates a module

A task mastermind that takes a module claims it with `claim_topic`, topic = the module path (`core/Page`, `ext/drawer`, `Servex/agents`), and releases it at landing (`release_topic`). `list_claims` is the lookup. Taking or releasing the claim writes one line into the module's own `page.jsonl`:

```
{"inbox": {"coordinator": {"agent": "task-mastermind-doc-pass", "task": "public/framework/ai/2026-09-30/doc-pass", "topic": "ext/Doc", "event": "claimed"}, "at": "…"}}
```

`drop(path, text)` looks for the most specific live claim whose topic contains `path`. If there is one, the note goes to that mastermind (`send_to_agent`), and its line lands in the module's `page.jsonl` with `path` and `routed_to`; it never shows in a page inbox. Only when nobody coordinates the module (or the coordinator can't be reached) does the note wait in the page's inbox.

## The tools

| Tool | What it does |
|---|---|
| `drop(path, text)` | Leave a note. `from` is you, stamped by Servex. Answers the note's `id`, and `routed_to` when it went to the coordinator. |
| `clear(path, id)` | Clear one open note. An id that isn't open is refused. |
| `inbox(path)` | The open notes, newest first, and the module's `coordinator` (or null). |
| `page_note(path, text, {to})` | Leave a note the NEWER way (below) — read with no Servex dependency. |

## `page_note` — the same note, read with Servex down (2026-10-02)

`drop`'s notes only show through `GET /api/inbox`, so they're invisible while Servex is down —
even though the line is sitting right there in the file. `page_note(path, text, {to})` writes a
`{"note": {id, from, to?, text, at}}` line instead (same file, new key), and
`core/Page/ext/Inbox`'s `notes()` reads it by tailing the page's own `page.jsonl` directly — no
Servex call at all, so it still shows with Servex down. `to` (an agent id), or the module's own
coordinator when `to` is left out, still gets a short WAKE from Servex, same as `drop`'s routing
— but the wake is just "a note on `<path>` — page_read it," never the text itself, which already
lives in the file (no second copy). The two note shapes are merged into one list by `notes()`, so
`drop`'s older notes keep showing too. `drop`/`clear`/`inbox` are unchanged and keep working, for
one release; `clear` does not yet know about `note:` lines (there's no `clear`-the-new-way yet).

`path` is a site path (`/framework/core/Page/`) or a repo folder (`Servex/agents`). It must exist.

## The routes, for a page's own form

- `POST /api/inbox/drop` with `{path, text}` (a browser is the owner; an optional `from` names an agent, and **is not checked**: loopback only, unlike the MCP tool's stamped caller)
- `POST /api/inbox/clear` with `{path, id}`
- `GET /api/inbox?path=…`: a path with no folder answers an empty list, never a 404

## The file

One line per event, appended to the page's own `page.jsonl` (the owner: "append to that module's page.jsonl and it just goes into its inbox"). A card is a page.jsonl too, so every card has an inbox. Every line uses the one key `inbox`, which the page loaders keep as plain data:

```
{"inbox":   {"id": "n-g7yptezx", "from": "minion-layout-audit", "text": "…", "at": "2026-09-30T13:38:33.857-05:00"}}
{"inbox": {"id": "n-g7yptezx", "cleared": {"by": "owner", "at": "2026-09-30T13:40:02.114-05:00"}}}
```

Append only. A note is open until a line with its id and `cleared` arrives. Servex is the only writer, so two drops never tear a line.

**A plain folder is never written into.** A folder with a `page.js` is safe: it is always loaded by its page.js. But a folder with neither a page.js nor a page.jsonl (a `doc/`, a `shots/`) would become a jsonl page if its page.jsonl began with an inbox line ([writers.md](/framework/core/Page/jsonl/md/doc/writers/)). So a drop there goes to the nearest page above it.

Code: [`agents/inbox.js`](../agents/inbox.js), wired in `Servex.js` (constructor, `tools()`, the router); the coordinator lines come from `claims.js`'s `on` hook, set in `Global.claims()`. New tools and routes go live only after a Servex restart.
