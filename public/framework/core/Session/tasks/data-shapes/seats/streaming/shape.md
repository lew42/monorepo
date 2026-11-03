# Streaming as built: how one line gets from a writer to an open tab

Analysis seat (e), 2026-10-28. Verified against the code on `michael/dev`; every hop has its file and line. Findings, measurements and recommendations: [notes.md](notes.md).

## The one-paragraph version

A record is a `.jsonl` file under `public/`. Anything that changes it **appends one JSON line**. The **dev server** (not Servex) holds one recursive `fs.watch` on `public/`; when a `.jsonl` changes it reads **only the new bytes** past the offset it last sent and pushes them as a `jsonl` frame over the dev **WebSocket** (Servex's port-80 proxy just passes the socket through). In the tab, `ext/JSONL/live.js` hands the lines to the reader's `read()`, and a reader that is an `Item.Store` replays each line through `host.replay_line(line)`, which is `set(line)`. There is no SSE, no polling, and no server-side object in this path: the server ships bytes; every reader rebuilds its own object from lines.

## The diagram

```
WRITERS (all end in fs.appendFileSync; nothing ever rewrites a record)
 ├─ agent, item tool ── Servex/agents/page_tools.js:172 write_line()  (validated by replaying the line on a cached live root first, :738 live_root, :752 advance)
 ├─ agent, append.mjs / append_log ── Server/LogLine.mjs:42 append() → :89 appendFileSync, :90 re-reads the whole file to count
 ├─ hooks (prompt-relay, session-page, ledger, naming-guard) ── raw appendFileSync in .claude/hooks/*.mjs, no replay check
 ├─ browser Store, task/session/improvements files ── core/Item/Store.js:186 post_to_tool → Servex POST /api/item (Servex/Servex.js:676) → write_line
 └─ browser Store, every other .jsonl (pages) ── Store.js:193 FsFile.send → ext/filesystem/FsFile.js:160 socket "append"
                                               → Server/plugins/SocketServer/Append.js:64 (schema check, then :87 appendFileSync)
                     │
                     ▼  (a file on disk changed)
DEV SERVER  Server/watch.js:60  one fs.watch(public/, {recursive}) → MtimeFilter (:75) drops read-only "changes"
            Server/plugins/SocketServer/LiveReload.js:144  a .jsonl never reloads: it goes to Tail.changed()
            Server/plugins/SocketServer/Tail.js:78  changed(): read(file, offset) — only the new bytes, cut at the last "\n" (:51-66)
                                                    → socket.rpc("jsonl", url_path, lines, new_offset)   (:91)
                     │  WebSocket frame (Servex/ReverseProxy.js:176 forwards the upgrade on port 80)
                     ▼
BROWSER     dev/Socket/Socket.js:132 message() → calls this[method]: Socket.prototype.jsonl (ext/JSONL/live.js:35)
            live.js:39  skip a batch this reader already has (offset check), else reader.read(reader.parse(lines))
                     │
                     ├─ an Item.Store (core/Item/Store.js:97 read): per line, skip its own echo (:112), else host.replay_line(line)
                     │      → Item.set → Item.apply (core/Item/Item.js:124) → set_one (:145) → get(key) (:177), one hop per nesting level
                     └─ a JSONL subclass (SessionTasks, ChatV2, ChatV3, AISessionDetail.Log): its own read(); see notes.md §3
```

Subscribing: `JSONL.live()` / `Store.open()` → `live.js:112 stream()` sends `subscribe(path, offset)`; `Tail.js:102` answers with everything past `offset` (from 0 on first load, so **first load and live updates are the same code**). Off localhost there is no socket and `stream()` is a plain `fetch` (`live.js:113`, `Store.js:46`). A file that shrinks or vanishes sends `jsonl_reset`, and the reader replays from 0 (`Tail.js:84`, `live.js:52`).

## What each piece holds

```
Tail (dev server, one per socket)      files: Map<abs path, {offset}>  — ONE offset per file, shared by every socket
                                       subs:  Map<abs path, Set<socket>>
live.js (browser module state)         streams: Map<url-path, Set<{jsonl, changed, first, timer, paused}>>
                                       a page's streams pause when the Router leaves the page, resume from their offset on return
JSONL (ext/JSONL/JSONL.js)             url, offset, loaded; logs/actions/skipped  — a verb-dispatching log reader (no Item)
Item.Store (core/Item/Store.js)        url, host (the Item it replays into), entries (held until attach), count,
                                       sent (lines it wrote, to skip their echo), _queue (one microtask batch)
                                       static instances: Map<url, Store>  — one Store per file per tab
Servex item tool (page_tools.js)       Item.Store.for(url).host = ONE live root per file in Servex, kept while the file's
                                       size+mtime (and every child file it read) are unchanged; else replayed again
```

## Where the write goes, by file name (`Store.js:196 via_tool`)

| File | Browser writes through | Checked by |
|---|---|---|
| `task.jsonl`, `session.jsonl`, `improvements.jsonl` | Servex `/api/item` (falls back to the socket append if Servex does not answer) | replaying the line on the live root (`page_tools.js:1010-1016`) |
| any other `.jsonl` (`page.jsonl`, logs) | dev socket `append` | `jsonl-schema.mjs` `check()` per line (`Append.js:78`) |
