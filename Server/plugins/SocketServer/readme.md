# SocketServer — the dev server's websocket and what it does for the tabs

One websocket per browser tab, opened on `server.js`'s own http port. This folder is the server half; the browser half is [`dev/Socket`](/framework/dev/Socket/) (its wire reference: [`doc/wire.md`](/framework/dev/Socket/doc/wire.md)). Only localhost and the private LAN may connect, and a LAN peer (a phone) gets push traffic only ([`doc/lan.md`](/framework/dev/Socket/doc/lan.md)).

## The files

| File | What it is |
|---|---|
| `SocketServer.js` | the `WebSocketServer`, the origin and address gate, one `Socket` per connection |
| `Socket.js` | one connection: parses a frame, emits `rpc:<method>` to the plugins, `send()` and `rpc()` back |
| `Tail.js` | `subscribe` / `unsubscribe`: streams a `.jsonl` file's lines to a tab from a byte offset, then every append (one offset per socket). `Tail.changed(file)` is called by the file watcher |
| `Append.js` | `append`: one batch of lines added to a `.jsonl`, validated, written once, acked |
| `LiveReload.js` | the file watcher: `.jsonl` changes go to `Tail`, everything else becomes a `changed` frame |
| `Runtime.js` | `write`, `ls`, `rm`, `move`, `cmd` |
| `Files.js` | `page_add`, `upload`, `set_aside`: what the Files tab does to a page folder (below) |
| `Tab.js` | which page each tab is on, and `eval` into it |

Wired in `Server/run.js` with `DevSocket.Socket.use(Tail)`, `use(Append)`, and so on.

## `Append`: the numbered batch (2026-10-31)

`{"method":"append","args":[path, lines, {client, n}],"index":i}`. With the third argument the batch is **numbered**:

- Written once. `Append.seen` (shared by all sockets, memory only) holds the answer it gave to each `{client, n}`: the last 1000 batches of each of the last 500 clients. A resend of a batch it has seen is answered with the same ack plus `dup: true`, and nothing is written.
- Acked: `{index, response: "append successful", client, n, offset}`, `offset` being the file's size after the write. A refusal is remembered and answered the same way; only `append failed` (the disk) is forgotten.
- Not judged by the per-file verb schema (`.claude/hooks/jsonl-schema.mjs`), which describes what agents append by hand; a `page.jsonl` still is. And not checked against the file's tail by `by|ts` (`RecordWriter.fresh`), which cannot tell two tabs apart.

Without the third argument it behaves as it always did: schema check, tail check, plain reply.

How the tab sends, retries and catches up, the exact shapes, and what Servex's `/api/item` did that this path does not: [`core/Item/doc/transport.md`](/framework/core/Item/doc/transport.md).

## `Files`: make a page, upload a file, set one aside (2026-10-31)

`{"method":"page_add","args":[folder_url, name, title]}`, `{"method":"upload","args":[folder_url, name, base64, {part, of}]}`, `{"method":"set_aside","args":[folder_url, name]}`. Each is answered `{index, response: {ok: true, …}}` or `{ok: false, reason: "a sentence"}`.

- **Who sends:** the Files tab (`core/Page/FilesTab.js`), dev server only; a LAN peer is refused by `Socket.js`.
- **What it writes:** `page_add` makes `<name>/page.jsonl` and links it through `Servex/agents/Subpages.js`; `upload` writes a dot `.part` file and links it to its name on the last part (a name that exists becomes `name (2).ext`, nothing is overwritten; cap `Files.MAX_BYTES` = 25 MB); `set_aside` moves into `<folder>/_removed/<name>-<time>/` and never deletes. It never writes a list line: `PageFiles` sees the disk change and the tail does the rest.
- **Checks:** every folder url must resolve (symlinks too) inside `public/`, with no `..`, dot segment or `node_modules`; a name is one plain file name. Design and the alternatives: [`core/Page/doc/files.md`](/framework/core/Page/doc/files.md).

## Tests

- `node Server/plugins/SocketServer/Files.test.mjs`: the three messages over a real ws server and a real folder, with the real `PageFiles` watcher

- `node Server/plugins/SocketServer/Tail.test.mjs` — one offset per socket, no line lost, none applied twice
- `node Server/plugins/SocketServer/Stream.test.mjs` — a file append reaches a Page
- `node Server/plugins/SocketServer/Append.test.mjs` — the schema check on a plain append
- `node public/framework/core/Item/transport.test.mjs` — two real tabs over this real server: numbered batches, a lost line, a lost ack, catch-up (the numbered `Append` is tested here, with real sockets)
