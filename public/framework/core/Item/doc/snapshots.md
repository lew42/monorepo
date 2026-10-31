# Snapshots: load an item from its last state plus the tail

**The problem.** Opening a log means reading every line and replaying it. The largest voice session (8,360 lines, 2.7 MB) takes about 400 ms in node and ships all 2.7 MB. A snapshot is the item's final saved shape, kept beside the log, so a load reads that and only the lines written after it.

**The owner's idea** (2026-10-31): "rebuild the snapshot in a build process … collapse the deltas into a snapshot to load it properly". The log is the history and is never shortened or rewritten; the snapshot is a cache that can always be thrown away and rebuilt.

## What is on disk

```
task.jsonl            the log (unchanged by any of this)
task.snapshot.json    the snapshot, written by Server/Snapshots.mjs
```

`session.jsonl` gets `session.snapshot.json`. The snapshot file is one JSON object ([Snapshot.js](../Snapshot.js) describes every field):

```
{ snapshot: 1, log: "task.jsonl", lines: 8260, bytes: 2717000, anchor: "<base64>", made_at: "…",
  state: { …item.toJSON()… }, memory: [[walk index, { _key: value }], …] }
```

- `lines` and `bytes` say how far into the log the snapshot reaches. `bytes` is always just after a newline.
- `anchor` is the last 64 bytes of the covered part. A reader asks for the log from `bytes - 64` and checks those 64 bytes. A mismatch means the log was rewritten or cut before that point: the snapshot is ignored with one console warning and the whole log is replayed, as before.
- `memory` is the `_`-prefixed in-memory fields that `toJSON` leaves out (a Task's last line time, a Session's settings and first/last times). Without it a restored item would not behave like the replayed one.

## Who writes it, who reads it

- **Writes:** `node Server/Snapshots.mjs <file-or-folder>` (dry run: says what it would write) and `--write`. Before it writes anything it replays the log, then proves that "snapshot + the lines after it" gives the same item as the full replay (same saved shape, the same class, id and state of every item, the same `memory`), at the end of the log and at two cut points inside it. If the proof fails, the log is refused with the reason and nothing is written. It writes to a temp name and renames, never touches the log, and refuses a log with an unreadable line in the middle (a snapshot would bake the skip in) and any `page.jsonl`.
- **Reads:** `Item.open(url)` → `Store.use_snapshot()` → `store.attach(host)` → `host.restore(state, memory)` → the tail replays through the ordinary `replay_line`. `Item.replay(lines, snapshot)` is the node twin. `Store.snapshots = false` turns it all off.
  - **Static site / node:** one request, `Range: bytes=<bytes-64>-`: the anchor check and the tail together. A server that ignores Range and sends the whole file still works (the reader cuts it).
  - **Dev server (localhost):** one 64-byte range request checks the anchor, then the socket subscribes **from `bytes`** (`store.offset`), so the live tail continues from the tail's end like any log. If the folder's listing (`/api/folder-names`) shows no sidecar, nothing is requested at all (no 404 in the console).
- **Hooks:** `restore` runs each `set_<key>` hook (D17) once per key, on the item and every item under it. A full replay runs a hook once per line.

## Measured (node, this repo, 2026-10-31)

`public/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`, 8,360 lines, 2,744,072 bytes. Snapshot made at line 8,260, the last 100 lines as the tail; `Item.open` over a local HTTP server with Range support, five runs:

| | time | bytes sent |
|---|---|---|
| full replay | 359 to 420 ms | 2,744,072 |
| snapshot + 100 lines | 27 to 51 ms | 623,568 (a 596,569-byte snapshot and the tail) |

Dry run over `ai/sessions/` (2,960 logs, 3 seconds): 1,473 pass the proof. The others are refused with a reason (1,239 are old logs whose state is inferred from old fields and have no start/complete line yet; 225 hold a child in its own file; about 25 fail to replay or differ, listed by the script).

## Why a sidecar file and not a `{"snapshot": …}` line in the log

| | sidecar `task.snapshot.json` (chosen) | a snapshot line appended to the log |
|---|---|---|
| The log | never touched: no race with Servex appending, offsets stay valid, git history is plain | the script appends into a file other writers append to; a second writer can interleave |
| Every other reader of the log | sees nothing new (the item tool, `AIIndex`, `Tail.js`, old tabs) | each one must learn a new line type, or an old reader puts `snapshot` into the item's data |
| Dev server's tail by byte offset | untouched: subscribes from `bytes` | the reader must find the last snapshot line first (scan back from the end) |
| Cloudflare static hosting | two files; a Range request for the tail | one file, but the whole file must still be fetched (or ranged from an offset found by scanning) |
| Throw away and rebuild | delete the file | a line in the middle of the history that must stay |
| Cost | one extra request per open on the static site when there is none (a 404); none on the dev server | none |

The line-in-the-log version is what `ai/design-decisions-2026-10-27.md` first imagined; the research (`persistence-sync/lessons/storage-compaction.md`: "the index is a disposable cache that records the offset it covers") points the same way as the sidecar. If the extra request on the static site ever matters, a site-wide list of which logs have a snapshot is the cheap fix.

## What is not covered, and traps

- **Pages (`page.jsonl`)** are not snapshotted. A page loads through `Page.Reader`, not `Item.open`, and keeps every raw line for its inbox and log view (`jsonl_lines`), tabs and `file` imports. The script refuses them.
- **Only `Item.open` uses a snapshot, and only when nobody opened the store before.** Another reader of the same `Store` (`Task.open_ref`'s stub, `TaskPage`) expects every line, so a store that someone already opened plain is not changed under them. The risky order is `Item.open` first and `open_ref` second on one file: `open_ref` already checks `store.host` first, which is set by then, and takes its own copy of the whole file. (A second `attach` onto a snapshot store restores the snapshot but not the tail; that case was already empty before snapshots.)
- **Legacy tasks** (no start/complete/… verb line, so the state is inferred from old fields at the end of a replay) are refused: a later verb line would meet the inferred state and not the idle one a full replay has.
- **A child in its own file** (a `{"task": "<path>"}` reference line) is refused: the snapshot would copy the child and lose the link.
- **State kept in plain fields, outside `data`, that no `set_<key>` hook rebuilds,** is not in the snapshot (the proof cannot see it). Keep derived state in a hook, as D17 says.
- **A live tab on a rewritten log** (`jsonl_reset`) replays the whole log onto the item it already has, as it did before; reload.
- **Nobody runs the script yet.** No watcher or merge step writes snapshots. The next step is the size-ratio trigger the research proposes (snapshot when the lines since the last one are bigger than the snapshot), run by Servex's heartbeat or `merge.mjs`; the script is already safe to run any time because it only adds sidecar files.
- `Store.count` counts a line twice when entries are read before a host exists (it did before this); do not use it as a line count.

Tests: `node snapshot.test.mjs` (real files, a real HTTP server with byte ranges, the real script). The browser half (localhost, socket tail from `bytes`) was checked by hand in a real browser on the dev server: the snapshot was used, only a 64-byte anchor range was asked for, and a line appended afterwards arrived live.
