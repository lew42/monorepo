# How a line travels: out, ack, in, catch-up

**What this is.** An item's change is one line in a `.jsonl` file. This page follows that line from the tab that made it to every tab that shows it, and says what happens when the socket drops on the way. Asked by the owner: "if we have a socket, why not use it? It allows bi-directional communication, and then we can put everything through the socket." (Everything except where Servex's hooks must run: see "How the two coexist".) Test: `node public/framework/core/Item/transport.test.mjs`.

## The short version

1. **The socket for everything, except record files while Servex answers.** Every `.jsonl` line a tab writes goes over the dev server's websocket. The exception is a record file (`task.jsonl`, `session.jsonl`, `page.jsonl`, `improvements.jsonl`): its lines go to Servex `POST /api/item` first, because Servex runs the hooks that start an agent on **Approve**, tell an agent its request was answered, and pick up a changed process. Only the lines Servex did not take (it is down, or it refused where they came from, like a phone) go through the socket, so a record is saved either way. `Store.channel = "socket"` sends records through the socket too (no hooks).
2. **Numbered and acked.** Each batch of lines carries a client id and a counter. The server writes it once and answers with that number. The tab keeps the batch until the answer arrives, and sends it again after every reconnect.
3. **One stream back.** Every tab that subscribed to the file hears the new lines (`Tail.js`), the writer too. The writer drops its own echo.
4. **Catch-up.** A tab that was away resubscribes from the byte offset it had reached and gets only what it missed.

## Out: the tab to the file

```
item.set(...)  ->  Store "delta" listener  ->  Store.append(line)  ->  Store.flush()    (one microtask later: the whole tick's lines)
   ->  Store.deliver(path, lines)  ->  Outbox.send(path, lines, {item: true})  ->  socket frame  ->  Append.js  ->  appendFileSync
   (a record file, Store.channel "item_api": first RecordWriter.post -> Servex /api/item; only the lines it did not take go on to deliver)
```

- **`Store.flush`** (`core/Item/Store.js`): for a record file it posts to Servex first (`RecordWriter.post`, which stamps `by: "owner"` and a millisecond `ts`); lines that fall back to the socket carry the same stamps, because a Task reads its times from `ts`. With `Store.channel = "socket"` it stamps them itself and sends them. Every other `.jsonl` goes as it is.
- **`Outbox`** (`core/Item/Outbox.js`, one per page, `Outbox.shared()`): numbers the batch, keeps it in `waiting`, sends it when the socket is open. `FsFile.send` (the one file API) ends here too, so a plain `FsFile.append` gets the same treatment.
- **`Append`** (`Server/plugins/SocketServer/Append.js`): checks the path (under `public/`, ends in `.jsonl`) and that every line is a plain object, then judges each line against the file's per-file schema (`jsonl-schema.mjs`) unless the batch says `item: true`, writes the batch in one `appendFileSync` (two writers interleave between lines, never inside one), and answers.

### The message shapes

Tab to server (the existing `append` RPC, with one new third argument):

```json
{"method":"append","args":["/framework/core/Item/live/demo.jsonl",[{"add":{"id":"k3f9","text":"Row 6"}}],{"client":"3e83f2c0.x7q2","n":14}],"index":5}
```

| field | what |
|---|---|
| `args[0]` | the file's url path |
| `args[1]` | the lines: an array of plain objects, written in this order |
| `args[2].client` | this page load's id: the tab id (`Socket.tab()`, kept in `sessionStorage`) plus 4 random letters. The letters matter: a reload keeps the tab id but restarts the counter, and the server must never see `n: 1` from the same id twice |
| `args[2].n` | this client's counter, 1, 2, 3, ... one per batch, across all files |
| `args[2].item` | `true` only on a batch from `Item.Store` (`Store.deliver`): an Item's deltas (`{"set":…}`, `{"tasks":{"add":…}}`), which the per-file schema for `task.jsonl`, `board.jsonl` and the like would refuse because it describes agent verbs. Without it, even a numbered batch is checked (`FsFile.append` callers write agent-style lines). A `page.jsonl` is checked either way. Kept in `localStorage` with the lines, so a reload keeps it |
| `index` | `Socket.request()`'s own correlation number; the reply carries it back |

Server to tab, the ack:

```json
{"index":5,"response":"append successful","client":"3e83f2c0.x7q2","n":14,"offset":48211}
{"index":5,"response":"append successful","client":"3e83f2c0.x7q2","n":14,"offset":48211,"dup":true}
{"index":6,"response":"append refused: lines must be an array of objects","client":"…","n":15}
```

`offset` is the file's size after the batch (the file's own sequence number: no new counter is kept on the server). `dup: true` says "I already had this one; nothing was written". A call with no third argument (an older caller) behaves as before: the plain reply `{index, response}`, no memory, no dedupe.

Server to tab, the stream (unchanged, `dev/Socket/doc/wire.md`): `{"method":"jsonl","args":[path, lines, offset, from, ends]}`.

### Why a retry can never write twice

`Append` keeps, in memory, the answer it gave to every `{client, n}` (the last 1000 batches of each of the last 500 clients, shared by all sockets, because a retry arrives on a new socket). A batch it has seen is answered again with the same ack and not written. A refused batch is remembered too: it counts as processed, so the tab stops sending it (`R3` in the research). Only an `append failed` (the disk said no) is forgotten, so a later send can try again, and the outbox does: it keeps the batch and sends it again, with the same `{client, n}`, after `Outbox.retry_after` (3 s).

## When the socket drops

| What happened | What the tab does | What is in the file |
|---|---|---|
| The socket was down before the line was made | The batch waits in `Outbox.waiting`; `store.pending` is above 0. The socket's `open` event sends it. | Nothing yet, then once |
| The socket died with the batch on the wire | No ack comes. After the reconnect, `open` sends every unacked batch again. | Once (the first send never arrived) |
| The server wrote it but the ack was lost | Same: sent again after the reconnect. `Append` answers `dup: true`. | Once |
| The server refused it (bad path, not an object, a line that fails its file's schema) | Dropped with a console warning; the Store forgets the echoes it was waiting for. | Nothing |
| The server could not write it for now (`append failed`: an editor, indexer or antivirus holds the file) | Kept (also in `localStorage`) and sent again after `Outbox.retry_after`, until it is written. Test: `Outbox.test.mjs` | Once, when the disk allows |
| There is no socket at all (a static host) | `Store.writable` is false: nothing is sent, and the one warning says so. | Nothing |

`store.pending` is the number of lines the Store made that the server has not acked: still queued for the next microtask, or sent and waiting. A page can show "not saved yet" while it is above 0. `Outbox.shared().pending()` counts all files, and the outbox emits `"change"` whenever the count moves.

## In: the file to every tab

`Store.open()` streams the file through `ext/JSONL/live.js`: it subscribes (`{"method":"subscribe","args":[path, offset]}`), and `Tail.js` answers with the lines from that byte offset on and keeps pushing each append. `Store.read` replays each line through `host.replay_line`. The writer's own line comes back like everyone's; `Store.skip_echo` compares it (minus `by` and `ts`) with the lines this store sent and drops it.

## Catch-up after a reconnect

`live.js` remembers, per reader, the byte offset it has reached (`store.offset`, set from each `jsonl` frame). `Socket.open` runs on every reconnect, and `live.js` chains onto it: it subscribes again from that offset. `Tail.js` reads from there and sends only the lines written meanwhile (one offset per socket, so a second reader never steals a line). The test cuts tab B off, lets A write three lines, and B gets exactly those three, in order, once each.

## What Servex `/api/item` did that the socket path does not

Servex (the owner's agent server, not running in a cloud or CI checkout) keeps a live in-memory copy of each record file and `POST /api/item` goes through it (`Servex/agents/page_tools.js`, `serve_item` -> `run_item` / `record_lines`). Compared with the socket:

| | `/api/item` (Servex) | the socket (`Append`) |
|---|---|---|
| Validates the line | A task verb is run on the live root first (a refused verb writes nothing); a raw line that would not replay on the warm root is refused; a `page.jsonl` line is schema-checked | A plain object, and the file's per-file schema, except for an `item: true` batch (an Item's deltas: the schema describes what agents append by hand, `{"log":{…}}`, not `{"set":…}`). An Item already ran its own verb in the tab (`act`), so a refusal happens there. The "would this line replay on the live root?" check is Servex's only |
| Updates the live copy | Yes, before it writes | No. The next `item()` call in Servex sees the file's signature changed, drops its warm copy and replays the file: correct, slower once |
| Stamps `by` and `ts` | At the door | In the tab (`Store.flush`), same values |
| Hooks and side effects of an item-tool verb (**Approve starts the agent**, an agent told its request was answered, a changed process picked up) | Run | **Not run.** The file watchers still see the line (`AIIndex.mjs --watch` indexes any task or session log change), but nothing launches an agent from it. This is why records default to `/api/item` |
| Needs Servex running | Yes (a phone gets a 403) | No: the dev server alone |

**How the two coexist.** `Store.channel` (`core/Item/Store.js`) is the one switch, for record files only: `"item_api"` (the default) or `"socket"`. With `"item_api"`, a record file's lines are posted to Servex first, and only the lines Servex did not take go through the socket (numbered, so they are acked and retried too). With `"socket"` they all go through the socket and Servex's hooks do not run: for a page that never needs them, or a host without Servex. Every other `.jsonl` uses the socket whatever the switch says. Nothing else changes; the same lines land in the same file either way. The owner's lean (research D8) is for each project's dev server to own the item API, which is this path with the hooks added to `Append`; until then Servex's `/api/item` stays the record door. Why the default is `"item_api"`: the first version made the socket the default for everything, and a review found that **Approve** in the browser then wrote its line but never started the agent ([review.md](../../../ai/sessions/2026/10/31/session-e3fd9043/item-mvp/review.md), finding 1). Test: `transport.test.mjs` scenarios 5 and 6.

## Reload and heartbeat

- **A reload keeps unsent lines.** Each unacked batch is also written to `localStorage` under `outbox:<client>:<path>` (a list of `{n, lines}`) and removed on its ack. A reloaded tab has the same tab id (`sessionStorage`) but a new client id, so it reads the keys that start with its own tab id, queues those batches with their old `client` and `n`, and sends them. If the server had already written one, it answers `dup: true`. Storage that is missing or full is skipped (every access is in a try/catch). Batches of a tab that was closed for good stay in storage unclaimed: another tab never takes them, so nothing is written twice by mistake. `Outbox.js` does the restore when it loads, and `Store.open()` loads it on the dev server (a dynamic import), so a reloaded page that only looks at an item still sends what the last page left behind. Test: `transport.test.mjs` scenario 8.
- **A heartbeat finds a dead socket.** While batches wait on a connected socket, the outbox sends `{method: "ping"}` every 10 s (`Outbox.heartbeat.every`); `Append.js` answers `pong`. No answer within 10 s (`.wait`) means the connection is dead without the browser knowing, so `Socket.restart()` opens a new one and its `open` event sends the batches again: detection in 20 s at worst. Nothing pings while the outbox is empty. Test: a server that keeps the socket open and goes silent.

## Limits (known, and what they cost)

- **A server restart forgets the dedupe memory.** If the server writes a batch and dies before the ack, the tab sends it again to the new process, which has no memory of it and writes it twice. A narrow window; numbered batches skip the old `by|ts` tail check on purpose (two tabs in the same millisecond share `by: "owner"` and look like one line, and the second edit was silently dropped). To close it: keep the last `{client, n}` per file in the file's own tail, or in a sidecar.
- **The ack means "written", not "everyone has it".** Other tabs hear it through the tail, as before.
- **Order across files.** Batches go out and are written in `n` order on one socket; after a reconnect the unacked ones are resent oldest first. Two files are two independent logs, so no order between them is promised beyond that.
- **Unchanged and still open:** a tab's own edit and another tab's edit to the same field both apply locally, then the second one arriving wins in each tab (research R3); an offset past a rewritten file (R4, compaction); a stream that never gets its first frame falls back to one fetch after 1.5 s (R5).

## Alternatives not taken

- **The socket for record files too, as the default** (the first version). It needs no Servex, but skips Servex's hooks, so **Approve** stopped starting the agent. Kept as the opt-in `Store.channel = "socket"`; the alternative fix, running the approve, answer and change hooks inside `Append.js`, is the way to make the socket the only road later.
- **Skip the per-file schema for every numbered batch** (the first version). `FsFile.append` callers (`board.jsonl`, `decisions.js`, `Approvals.js`) write agent-style lines to schema'd files, and they are numbered too, so the check stopped running for them. The `item: true` flag marks the Item deltas only.
- **Put `client` and `n` inside each line in the file** (so a restarted server could rebuild its memory from the tail). It would make every line in every file carry two more keys, and the legacy per-file schemas refuse unknown keys. The memory above is simpler; the sidecar is the way out if the restart window ever matters.
- **A number per line instead of per batch.** A batch is already all-or-nothing on the server (one validation, one `appendFileSync`), so one number per batch is the smallest unit that can be retried.
- **A new RPC name.** The existing `append` takes a third argument, so an old tab and a new server (and the reverse) keep working.

Research this follows: `research/persistence-sync/lessons/sync-protocol.md` (R1 client id and counter, R2 retry, R3 refused still counts, the catch-up part of R4/R6) and `design/decisions.json` D4.
