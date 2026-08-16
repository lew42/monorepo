# live-streaming

## The ask, verbatim

> moving away from live reload (which goes crazy during parallel fan outs) to
> socket-based streaming content is one of the motivators for this whole thing

> you are fable, you use a lot of tokens, so offload this task to any number of
> opus minions. work autonomously, keep working through the next 5h window,
> keep an eye on usage.

Design agreed in chat (Fable, 2026-08-15): `.jsonl` appends stream over the dev
socket instead of reloading; code changes reload only tabs that actually loaded
the changed file; CSS hot-swaps in place. Phase 1 of the `ai-server` effort
(phase 2 = ledger hooks, phase 3 = socket-backed MCP tools — separate tasks).

## Wire protocol (the contract — both sides build to THIS)

All paths on the wire are **url-paths** (`/framework/x/y.js`), forward slashes,
never `public/…` or backslashes.

Server → client:

- `{"method": "changed", "args": [paths]}` — non-jsonl files changed.
  `paths` is a deduped array, debounced ~300ms server-side. `[null]` (or a
  null/omitted array) means "unknown — reload everything" (Directory.js's
  no-path call today). `.jsonl` paths NEVER appear here.
- `{"method": "jsonl", "args": [path, lines, offset]}` — appended complete
  lines (array of raw strings, no trailing `\n`) of a subscribed `.jsonl`;
  `offset` = server byte offset after these lines. Sent only to subscribers.
- `{"method": "jsonl_reset", "args": [path]}` — the file shrank or was
  rewritten. Client clears its replayed state and re-subscribes from 0.

Client → server:

- `{"method": "subscribe", "args": [path, from]}` — `from` is a byte offset
  the server previously sent (0 = whole file). Server immediately streams
  content from `from` as one `jsonl` message (empty `lines` is fine), then
  keeps streaming on change. Client re-sends all subscriptions on reconnect.
- `{"method": "unsubscribe", "args": [path]}` — optional; socket close cleans up.

Clients never compute byte offsets themselves (UTF-8 length trap) — they only
echo back offsets the server sent.

## File ownership (hard fences — do not cross)

**Agent A — server side.** Owns `Server/plugins/SocketServer/Tail.js` (new),
`Server/plugins/SocketServer/LiveReload.js`, `Server/plugins/Directory.js`,
and `Server/plugins/DevSocket/DevSocket.js` if wiring requires it.

- `LiveReload.changed(file)`: `.jsonl` → route to Tail, everything else →
  debounced `changed([paths])` broadcast (mute semantics preserved per path).
  Watch `add`/`unlink` too — a created file a page 404-probed earlier IS in
  that page's resource entries, so `changed` on create makes the probe finally
  succeed on reload.
- `Tail`: per-file byte offset + partial-line buffer; on change read from
  offset, send complete lines to that file's subscribers; on shrink send
  `jsonl_reset`. Per-socket subscription sets via `rpc:subscribe`/`rpc:unsubscribe`
  (register alongside Runtime/Ask/Start in root `server.js` if needed — that
  file is Agent A's too).
- `Directory.update()`: after rebuilding, call `changed` with the two files it
  actually wrote (`/directory.json`, `/framework/directory.json`) plus the
  added/unlinked path — not the no-path broadcast-all.
- Server restart required to test: find the PID on port 80, `taskkill //F //PID`,
  relaunch `node server.js` detached, verify port 80 answers. NEVER `pkill -f`.

**Agent B — browser dev core.** Owns `public/framework/dev/Socket/**` and
`public/app.js`.

- `Socket.changed(paths)`: null/absent → `reload()`. Else compare against
  `performance.getEntriesByType("resource")` pathnames; changed `.css` that
  matches a `<link rel=stylesheet]` hot-swaps (bump a `?t=` query on the same
  element — same element keeps `@layer` order); any other loaded path →
  one `reload()`. Respect `$BLOCKRELOAD`. Keep `reload()` itself.
- `app.js`: `performance.setResourceTimingBufferSize(<large>)` as early as
  possible — the default ~250-entry buffer silently stops recording and a
  long-lived tab would silently stop reloading.
- Docs: `dev/Socket/doc/wire.md` gains the protocol above; readme traps
  updated (buffer-size trap, changed-vs-reload).

**Agent C — jsonl live + dashboard.** Owns `public/framework/ext/JSONL/**`
and `public/framework/ext/AITask/**`.

- `ext/JSONL/live.js` (new): `Socket.prototype.jsonl`/`jsonl_reset` patches
  (the ext/Ask `ask_event` pattern), a path→instance registry, re-subscribe on
  reconnect (chain-patch `Socket.prototype.open`, visibly, in live.js).
  Imported by `JSONL.js` itself — do NOT touch `app.js` (Agent B owns it).
- `JSONL.live()`: explicit opt-in. Socket disabled → falls back to `load()`
  (fetch stays the static/prod path). Otherwise subscribe(path, 0), apply
  streamed lines through the existing replay, resolve `.loaded` after the
  first message, track `offset`. `jsonl_reset` → clear state, resubscribe 0.
- `ext/AITask`: dashboard + detail page opt into `live()`; on new lines
  re-render the owning component (inside a callback — capture is synchronous).
- Fix `card.js:49`: render `done/total`, not `step/total` (a task landing
  without bumping `step` reads N−1/N forever).
- Docs: JSONL readme live section + doc file; AITask readme note.

**Orchestrator (Fable)** owns this file, `task.jsonl`, the final integrated
smoke test, and the verification agent.

## Verification bar

Every agent: `node --check` on a `.mjs` copy of every edited JS file (the
backtick-in-css trap); log `action`/`log` milestone lines (batched, not
per-keystroke) to `public/framework/ai/2026-08-15/live-streaming/task.jsonl`.
End-to-end (after all three land, one server restart, verification pass):

1. Append a line to this task's own `task.jsonl` → a subscribed board updates
   WITHOUT reloading.
2. Touch a `.css` a page has → that page hot-swaps, no reload, layer order intact.
3. Touch a `.js` loaded by page X only → X reloads, an open page Y does not.
4. A new file in a task dir → directory.json rebuilds → the board reloads.
5. `.md` edits still reload pages that fetched them.

## Out of scope (phase 2+, note in readmes, don't build)

Mute-call cleanup in Ask.js/Start.js (harmless once jsonl stops reloading);
`--input-format stream-json`; ledger hooks; MCP tools; the `<page>/ai/` move;
JS HMR (deliberately never — see chat).

## House rules that bite here

No npm deps. No build step. Files under ~100 lines. Comments near zero (traps
only). Load the `code-architecture` skill before writing JS/CSS; the
`documentation` skill before finishing docs. CLAUDE.md rules over everything,
including this file.
