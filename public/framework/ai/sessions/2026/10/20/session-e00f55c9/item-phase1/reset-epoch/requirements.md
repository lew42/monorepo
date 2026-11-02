Budget: $8

# Item/List Phase 1: a reader recovers when its log is rewritten under it (`reset` / `epoch` + gap check)

Load the `minion` skill first. You are one piece of [the Item Phase 1 task](../requirements.md); its mastermind is `mastermind-item-phase1` (report to it, it merges).

**Worktree:** `C:\Code\lew42\worktrees\item-reset` (branch `worktree/item-reset`, its own server at http://localhost:53537/). Work and commit only there, by path. Never touch the main tree `C:\Code\lew42\monorepo` except to append to your own `task.jsonl`.

## The problem (spec R4)

Read first: `public/framework/research/2026/10/29/persistence-sync/persistence-sync/lessons/sync-protocol.md`, section "R4. Say 'start over' when the log was rewritten" (about 35 lines), and `public/framework/core/doc/status.md`.

Today `Server/plugins/SocketServer/Tail.js` sends `jsonl_reset` only when the file got SHORTER than a reader's offset. When a file is rewritten and is the same length or longer (`Server/SessionConsolidate.mjs` rewrites URLs inside lines and appends another folder's lines; a migration writes `old lines + newer`; `Runtime.safe_write` renames a tmp file over it), the reader is sent bytes from the middle of a line, or lines it already has, and misses others.

And when a reset DOES arrive, the browser side (`public/framework/ext/JSONL/live.js` `jsonl_reset` → `Store.reset()` in `public/framework/core/Item/Store.js`) sets `count = 0` and re-reads from 0 onto the SAME live host: every line is applied twice (a Task's verbs run again).

## Do (a failing test first for each)

1. **Server: detect a rewrite.** Tail keeps, per socket, something that proves the bytes before its offset are unchanged (for example the last up-to-256 bytes before the offset, or a hash of them; the byte just before the offset must be `\n`: that is the gap check). On a `change`, if the proof fails, send `jsonl_reset` instead of bytes. Must cover: shorter, same size, longer, and a rename-over. Test: `Server/plugins/SocketServer/Tail.rewrite.test.mjs` with the real `Tail`, cases A and B from R4, plus a SessionConsolidate-style rewrite (a URL inside an early line changed, lines appended).
2. **Client: recover without double-applying or losing lines.** After a reset the Store re-reads the file from 0 and applies only the lines it has not applied yet. Recommended: the Store keeps a multiset of the lines it has applied (a cheap hash of each line's JSON text → count; never the strings of a 7 MB log), and on the read after a reset it consumes matching lines and applies only the rest, in file order; then emits one `"reset"` event on the host so a view can redraw. A line whose text a rewrite changed (a URL) counts as new and is applied; say in the doc why that is safe for the lines SessionConsolidate rewrites (`task`, `file` lines replace by id) or what is not. A store that started from a snapshot (`Store.use_snapshot`) has not seen the lines before it: decide (rebuild by full replay into a fresh instance and `restore()`, or keep and warn), build it, and write down the alternative. Test: `public/framework/core/Item/reset.test.mjs`, node, real `Item`/`List`/`Task`: open a host from lines, apply some live lines, rewrite the file the SessionConsolidate way, reset, read again → identical to a fresh replay of the new file, and every verb ran once.
3. **`epoch`** (optional, only if cheap): if you give rewriters a way to say "I rewrote this" (a sidecar or a counter Tail reads), make `Runtime.safe_write` bump it. Skip it if the proof in step 1 already catches every case, and say so.
4. Run `node public/framework/core/Test/run-all.mjs` and `node Server/ReplayCompare.mjs C:/Code/lew42/monorepo` in your worktree: no new failure, 0 records differ. Paste both summary lines in your log.
5. Write it down: a short section in `public/framework/core/Item/doc/transport.md` (or a new `doc/reset.md` linked from `core/Item/readme.md`): what is detected, what the reader does, the alternative not taken.

## Fences

- Your files: `Server/plugins/SocketServer/Tail.js` (+ tests), `public/framework/ext/JSONL/live.js`, `public/framework/core/Item/Store.js` ONLY in `read()`, `reset()` and a new helper method or a new file next to it (the mastermind is editing `append`/`flush` in Store.js in another worktree, so keep your Store.js change small and in those methods), new test files, the doc.
- Never kill or restart the dev server or Servex, never drive the owner's browser tabs, never `git stash` (diff, don't stash), no migrations, never edit anything on disk under `public/framework/ai/sessions/` except your own `task.jsonl`.
- Don't turn on `Item.Store.marked_lines`.
- Log findings as `log` lines in your `task.jsonl`, not a findings file. Commit after each working step, by path. Don't merge: when done, send the mastermind one message: branch, commits, the two summary lines, anything left open.
