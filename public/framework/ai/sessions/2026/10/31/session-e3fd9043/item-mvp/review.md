# Review: the Item MVP branch (`claude/replay-tests`, 9ba46ee87..8e5b9fbd9)

An independent review, written by a reviewer who did not write the code. Brief: `brief-R-review.md` (session scratchpad). No code was changed.
Repro scripts live in the session scratchpad (`review/r1`–`r6`); each "confirmed" finding below says what was run. The base for
comparison is `git archive 9ba46ee87` extracted next to them.

Tests run: `node public/framework/core/Test/TestRunner.mjs public/framework/core`: 37 pass, 2 fail (`Template.test.mjs` and
`TasksPage.test.mjs` need the dev server at `monorepo.localhost`; not run here, so not judged). `Files.test.mjs`: 45 checks pass.

## Findings, most severe first

### 1. Approve in the browser no longer starts the task's agent (and other Servex hooks stop firing)
- **Where:** `public/framework/core/Item/Store.js:57` (`static channel = "socket"`) and `:275` (record lines go to the socket).
- **What is wrong:** a record file's lines (`task.jsonl`, `session.jsonl`) used to go through Servex `POST /api/item`, which runs
  `hooks.approved` (TaskLoop.launch, `Servex/agents/page_tools.js:1326`), `notify_requests` (`hooks.answered`, line 729) and
  `hooks.changed` (ProcessRunner). With `"socket"` as the default none of these run for anything the owner does in a tab.
- **Scenario:** a templated task waiting for approval → the owner presses **Approve** on its row (`TaskView.js:76`,
  `task.act("approve")`) → `{"approve":{},"by":"owner","ts":…}` is appended by `Append.js` → nothing calls `TaskLoop.launch`. The
  TaskLoop tick only re-launches tasks that have a `queue` line (`Servex/TaskLoop.js:266`), so the agent is never spawned. In the
  same way, the owner completing a request an agent filed no longer tells that agent (`hooks.answered`).
- **Confirmed?** Reasoned from the code paths (no Servex in this checkout). `doc/transport.md` lists "hooks not run" as a
  trade-off, but does not say this breaks Approve.
- **Smallest fix:** keep `"item_api"` as the default for record files until `Append` (or a file watcher) runs the same hooks;
  or have `Append` call the approve/answer/change hooks for record files.

### 2. `act()` now saves a parent's derived completion as extra lines
- **Where:** `public/framework/core/Item/Item.js:144` (`Store.mute(this)` mutes only the item's own tree), with
  `Task.child_changed` (`core/Task/Task.js:97`).
- **What is wrong:** the old global mute also silenced the changes a verb causes *above* the item. Now a parent that completes
  because its last child completed writes its own `set` lines, before the child's verb line. This is the same derived completion
  that `Store.replay_depth` was added to stop re-saving during replay.
- **Scenario:** a running parent `p` with one child `c1` in the same file → the owner clicks Done on `c1`
  (`c1.act("complete", {auto: true})`) → the store gets
  `{"set":{"completed_at":…}}`, `{"set":{"ran_ms":5}}`, `{"set":{"ran_since":null}}`, `{"set":{"state":"complete"}}`, then
  `{"tasks":{"c1":{"complete":{"auto":true}}}}`. At the base commit it got only the last line.
- **Confirmed:** yes, `review/r1-act-parent.mjs` on this branch (5 lines) against `r1-base.mjs` on 9ba46ee87 (1 line). The
  final state still replays the same, but every such click writes four extra lines stamped `by: "owner"`, and the parent
  "completed" before its child in the log.
- **Smallest fix:** while a verb runs, also skip lines whose origin is an *ancestor* of the muted item (mute the root chain), or
  have `child_changed` run inside `Store.replay_depth` when its cause was muted.

### 3. A transient write failure ("append failed") is dropped, never retried
- **Where:** `public/framework/core/Item/Outbox.js:144`; the server side is `Server/plugins/SocketServer/Append.js` (the
  `append failed` branch: "not remembered: the tab may send it again").
- **What is wrong:** the server deliberately does not remember a failed write so it can be retried, but the outbox treats every
  reply other than `append successful` / `append empty` as a refusal: it drops the batch, deletes it from `localStorage`, and
  `Store.deliver` forgets its echoes. The item in memory keeps the change, so the screen and the file disagree until reload.
- **Scenario (Windows):** an editor, indexer or antivirus holds `task.jsonl` → `appendFileSync` throws `EBUSY` → reply
  `append failed` → the line is gone; a reconnect sends nothing.
- **Confirmed:** yes, `review/r3-outbox-failed.mjs` (a fake socket replying `append failed` then `append successful`): first send
  resolves `false`, `waiting` is empty, `localStorage` is empty, and a drain on a new connection sends no frame.
- **Smallest fix:** in `acked()`, treat `append failed` (and any reply with no `response`) as "keep and resend later": leave the
  batch in `waiting`, clear `batch.ws`, and retry on the next heartbeat or reconnect.

### 4. A reloaded tab does not resend its unsaved lines until it writes something new
- **Where:** `public/framework/core/Item/Outbox.js:161` (the restore runs when the module loads); the only importers are dynamic
  imports inside `Store.deliver` (`Store.js:298`) and `FsFile.send` (`FsFile.js:158`).
- **What is wrong:** `doc/transport.md` says "`Outbox.js` does the restore when it loads", but nothing loads it at page load.
  Lines left in `localStorage` by a reload stay there until the tab's next write. If the owner only looks, they are never sent.
  When they are finally sent, they land after other tabs' newer lines, and this tab, which loaded the file without them,
  gets them back through the tail.
- **Scenario:** the owner checks a box, then reloads at once before the ack arrives (or the socket is down) → the page reloads
  from the file without the change → nothing is resent → the change looks lost; it appears only after some later, unrelated edit.
- **Confirmed:** by grep (no static import of `Outbox.js` anywhere under `public/`, `Server/` or `Servex/`).
- **Smallest fix:** import `core/Item/Outbox.js` from `Item.Store`'s `open()` (or from `dev/Socket`'s `open`) on localhost,
  so the restore runs on every page load.

### 5. Every browser append skips the per-file schema now, not only Item deltas
- **Where:** `Server/plugins/SocketServer/Append.js:109` (`if (!numbered || basename === "page.jsonl")`), together with
  `FsFile.send` now going through the outbox (`ext/filesystem/FsFile.js:158`).
- **What is wrong:** the skip is justified as "an Item's deltas are not agent verbs", but `FsFile.append` callers
  (`ai/rail/inbox.js` → `board.jsonl`, `ai/AITask/decisions.js`, `ai/AISession/Approvals.js`) write agent-style lines to
  schema'd files, and they are all numbered now. The `jsonl-schema.mjs` gate for `board`, `day`, `asks`, `flags`, `audit` and
  `task.jsonl` no longer runs for any browser write. The item tool's "would this line replay?" check is also skipped for record
  lines (finding 1).
- **Scenario:** `FsFile.append("/…/board.jsonl", {nonsense: true})`. Unnumbered: `append refused: a flat line (no verb…)`.
  Numbered: `append successful`, and the line is in the file.
- **Confirmed:** yes, `review/r4-schema.mjs` calls `Append.append` both ways on a temp `board.jsonl` (removed afterwards).
- **Smallest fix:** skip the legacy schema only for lines from `Item.Store` (send a flag such as `{client, n, item: true}`),
  or only for `task.jsonl`/`session.jsonl`, and keep the check for `FsFile.append`.

### 6. A snapshot drops Items held in a data slot; the proof can miss it
- **Where:** `public/framework/core/Item/Item.js:629` (`restore`: `hydrate(state)` keeps a slot's `{type, id, data}` as plain data,
  then `Object.assign(this.data, built.data)`), and the proof in `Server/Snapshots.mjs:111`.
- **What is wrong:** a full replay turns `{"box":{"type":"Item",…}}` into an adopted child Item (`adopt_slot`). After `restore`
  it is a plain object. The fingerprint at the end of the log is the same (same JSON), so the proof passes unless an existing
  line after a cut point writes into that child. The next live line does.
- **Scenario:** log `[{id:"root"}, {box:{type:"Item",id:"k",data:{x:1}}}]`, snapshot taken, then a new line `{box:{x:2}}`. Full
  replay: `box` is an Item with `x: 2`. From the snapshot: `box` is replaced by the plain `{x:2}` (type and id lost).
- **Confirmed:** yes, `review/r2-snap-slot.mjs` ("fingerprints equal (end of log)? true"; the two loads then differ).
  Today `Snapshots.mjs` only takes `task.jsonl`/`session.jsonl`, so this is latent for Task/Session data slots.
- **Smallest fix:** in `restore`, run each data value through `adopt_slot(key, value)` (it already hydrates an envelope and sets
  `parent`/`_slot`); add a proof case that replays one synthetic `set` into every slot Item after the snapshot.

### 7. A snapshot stays in use after the replay code changes, and the script will not refresh it
- **Where:** `Server/Snapshots.mjs:94` (`current` = same `bytes` and `anchor`), `core/Item/Snapshot.js` (no code version stored).
- **What is wrong:** the anchor proves the *log* has not changed, not that today's replay code would build the same state. This
  branch itself changes replay (`ran_since`, `Item.unmark`, hooks, `root_from`). After such a change, a browser keeps loading the
  old state, and rerunning `Snapshots.mjs --write` says `current` and skips the file, because only `bytes` and `anchor` are compared.
- **Scenario:** snapshot written; a later commit changes how `Task.replay_line` reads a line → the dev page shows the old
  result for every task whose log did not grow; `node Server/Snapshots.mjs … --write` does nothing.
- **Confirmed:** reasoned. No `*.snapshot.json` is committed yet, so nothing is wrong today.
- **Smallest fix:** store a replay version (a constant bumped with replay changes, or a hash of the replay sources) in the
  snapshot; `Store.use_snapshot` ignores a mismatch and `Snapshots.mjs` treats it as not current. At least, in `make()` compare
  `existing.state` with the newly proved state as well.

### 8. `as_call` saves lines that do not replay
- **Where:** `public/framework/core/Item/Item.js:161`.
- **What is wrong:** (a) two or more arguments are saved as an array, but `call_marked` replays it as ONE argument;
  (b) a single `undefined` argument makes `{ "name()": undefined }`, which `JSON.stringify` writes as an empty line `{}`.
- **Scenario:** `pair(a, b){ return this.as_call("pair", [a, b], …) }` → `pair(1, 2)` saves `{"pair()":[1,2]}` → replay calls
  `pair([1,2])` → live `{a:1, b:2}`, replayed `{a:[1,2]}`. `sort_by()` saves `{}`, and the change is lost on replay.
- **Confirmed:** yes, `review/r6-ascall.mjs`.
- **Smallest fix:** refuse (warn) when `args.length > 1`, or replay an array with `apply`; save `{}` for an `undefined` argument.

### 9. Smaller findings
- **`FsFile.send` hangs where there is no socket yet** (`Outbox.js:103`): on a host where the socket never connects, `drain()`
  returns while the socket is not connected, and `give_up()` runs only from `drain()`. Nothing calls `drain()` again once
  `Socket.disabled` flips, so the promise never settles. The old `FsFile.send` returned `false` at once. Every such call also
  leaves a `localStorage` key. Reasoned. Fix: on `disabled`, or in `beat()`, call `give_up()`.
- **Set-aside of the page itself on Windows** (`Server/plugins/SocketServer/Files.js:21,88`): `RESERVED.has(name)` is
  case-sensitive, and NTFS is not. `set_aside(folder, "Page.jsonl")` moves `page.jsonl` into `_removed/`. Windows device names
  (`CON`, `NUL`, `COM1`, `LPT1`, also with an extension) pass `check_name`; `existsSync("…\\CON")` is true there, so
  set-aside and upload fail with a raw error. Reasoned. Fix: compare `name.toLowerCase()`, and refuse
  `/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i`.
- **Path escapes in `Files.js` look closed:** `..`, a leading dot, a backslash or NUL in a folder part, a drive letter (`/C:/…`
  resolves outside `PUBLIC` and is refused by the prefix check), a symlink (the `realpath` check) and URL-encoding (not decoded,
  so it is a literal name) are all handled. Names refuse `/ \ : * ? " < > |`, control characters and a trailing dot or space.
  `fs.linkSync` in `finish()` fails on FAT/exFAT and some network drives, so every upload there is refused (no rename fallback).
- **Accidental hooks** (`Item.js` `wrap_hooks`): every `set_<x>` method on any Item subclass becomes a data hook. Current examples
  are `AISessionsPage.set_scope/set_from/set_to` and `AISession.set_configured`. They are harmless today, because none of them
  writes `data`, but a page line `{"from":…}` would now call `set_from()` instead of storing data. Consider a marker (e.g. a static
  `hooks = ["title"]`) instead of a name prefix.
- **`restore()` runs hooks with `old === value`** (`Item.js:629`): a hook that does nothing when the value is unchanged skips
  the side effect a full replay would run.
- **`Item.replay` line 1 for a plain Item** (`Item.js:735`): `new this(first)` turns keys that are not declared `fields` into own
  properties, not data. `Item.replay([{id:"a", title:"t"}]).toJSON()` used to keep `title` and now drops it. This matches
  `Item.open`, so it is consistent, but it changes what Servex `live_root`, `Agents.js:1099` and `replay-compare.mjs` read for such
  files. Confirmed: `review/r5-replay-line1.mjs`, run on this branch and on the base.
- **Servex `unmark_delta` changes data keys too** (`Servex/agents/page_tools.js:1154`): it recurses into every value, `add`/`set`
  payloads included, so a data key such as `"#top"` or `"#fff"` is renamed `"top"`/`"fff"`. The comment says it never touches a
  value. Fix: unmark only the routing keys (stop at `set`, `add` and other verb values).
- **Data keys starting with `#` or ending `()` cannot be set at all** now (`Item.set_one`), even by `set({"#fff": 1})`; they warn
  and are dropped. No such key exists in today's `.jsonl` files (grep). The D13 rule says this, but `set()` callers get a warning
  and their value is not kept.
- **Snapshot race:** `Store.use_snapshot` checks `this.opening` only on entry (`Store.js:95`). A second reader that calls
  `store.open()` during its awaits reads from byte 0, then `count`, `offset` and `snapshot` are set on that same store, and
  `attach` restores the snapshot *and* replays every line again (duplicate list members). Reasoned. Fix: check `this.opening`
  again after the awaits, and give up the snapshot if it is set.
- **The dedupe memory is first-in, first-out, and in memory only** (`Append.js`, `REMEMBER_CLIENTS = 500`): every page load is a new
  client, and live reload reloads all tabs, so a long-lived tab's entry can be pushed out within a day of work. A resend after that,
  like a resend after a server restart (documented), writes the batch twice. Low. Fix: refresh a client's entry on each batch
  (delete and set again) so the order follows recent use.

## Looks right

- `delta` before `change` in `set_one` and `run_hook`; a throwing `change` listener is caught by `emit_safely` and the line is still
  saved. A throwing `delta` listener still throws, as before.
- `Store.replay_depth`: every increment is in a `try/finally` (`Item.replay`, `from_snapshot`, `Store.read`, `Store.attach`), so
  a throw cannot leave it above 0.
- `Store.mute`/`unmute` are counted per item and paired in `finally`; `muted_at` walks `parent` (a List's `parent` is its owner),
  so list verbs inside a verb are muted. `Ref`'s `moving.before` and `Page/Reader.js` use `muted_at(origin)`.
- `Task` running time: `_ran_ms`/`_ran_since` are now getters over `data`. No code outside `Task.js` assigns them (grep), and a
  replayed `start` stamps `ran_since` from the line's time, so old verb logs keep their durations.
- `Item.unmark` in `Task.replay_line`/`Session.replay_line`, and `List.member` for `#id` hops: both spellings replay the same;
  no current `.jsonl` file holds a `#…` or `…()` key (grep).
- `Outbox` ordering: batches are numbered in send order and resent oldest first on each new connection; the server's
  `(client, n)` dedupe is shared across sockets; a refusal is remembered and stops the resends; `Socket.restart()` ignores the
  late events of the connection it threw away.
- `Snapshot.check`: the anchor plus a range request; a 200 answer with the whole file is cut by hand; a 416 or a mismatch falls back
  to a full replay with a warning. `Snapshots.mjs` refuses torn lines, `page.jsonl`, own-file children and inferred-state tasks,
  and writes through a temp file and a rename.
- `Files.js`: path checks (see above), the 25 MB cap counted per part, in-order parts, `.part` temp files cleaned up when the
  socket closes, no overwrite (hard link, then `name (2).ext`), set-aside never deletes. Only a loopback peer from a local origin
  reaches it (`SocketServer.js` `local_only`, `Socket.js` `LAN_OK`).

## Fixed (X2: snapshot and Files)

- **6** fixed in a5cd349f0 (failing test ad7c51fc8): `restore` runs every data value through `adopt_slot`; the fingerprint now counts slot Items; the proof writes one probe line into every slot Item and compares again.
- **7** fixed in cf9366446 (failing test 7727ad180): the snapshot stores `classes` and `code` (a hash of the classes' source, `Item.Store` and `Snapshot`, plus a hand-bumped `Snapshot.REPLAY`); `Store.use_snapshot` ignores a mismatch and `Snapshots.mjs` rewrites instead of saying "current". Format version is now 2.
- **Files, Windows names** fixed in 50a671412 (failing test e9430ea47): protected names compared in lower case; device names (`CON`, `nul.txt`, `COM1`...) refused; the no-hard-link case (FAT/exFAT) now falls back to an exclusive copy.

## Fixed

Each as a failing-test commit, then the fix (builder X1).

- **1** fixed in 3bbd1dcf0 (test af10b4d6f): `Store.channel` defaults to `"item_api"`, so record files go to Servex first (its hooks run) and use the socket only as the fallback; `"socket"` skips Servex.
- **2** fixed in 217179854 (test e0c0ccca6): `Store.mute` also mutes the ancestors' own derived changes (`Store.muting_up`).
- **3** fixed in 336fa3622 (test 12ae38c33): an `append failed` batch is kept and sent again after `Outbox.retry_after`.
- **4** fixed in fe10251af (test 45b3df825): `Store.open()` loads the outbox on the dev server.
- **5** fixed in 55a25cb8a (test 0d067268e): the per-file schema is skipped only for a batch that says `item: true` (`Store.deliver`), not for every numbered batch.
- **8** fixed in 424ca8b32 (test d7489511e): `Item.call_value` / `Item.call_args` write and read the `$args` wrapper, so every argument list replays to the same arguments (bare and marked spellings).
