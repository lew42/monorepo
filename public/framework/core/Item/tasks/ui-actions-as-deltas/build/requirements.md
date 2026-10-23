# Build: a button on a task saves its verb as a delta, through the item tool's own writer

Budget: $8. Sonnet. Parent: `mastermind-item` (it reviews and merges; you do not merge). Work in a worktree (`take_worktree`), commit there, report the branch.

The owner's ask and the whole brief: [../requirements.md](../requirements.md). Read it first, then `core/Item/readme.md` and `core/Item/doc/map.md`.

## What is true today (checked by the mastermind, 2026-10-22)

- A browser click such as `task.start()` runs `Item.set({state:"running", started_at})`. The Store records that **state** as the line (`core/Item/Store.js` `attach` → `line_for` → `flush` → `FsFile.send` → the dev server's `Server/plugins/SocketServer/Append.js`). No `by`, no `ts`, only the JSONL schema check, and Servex's hooks never fire (`hooks.approved` starts a templated task's agent, `hooks.changed` steps a process).
- The item tool (`Servex/agents/page_tools.js` `run_item`) writes the **verb** line `{"start":{}}`, validated against the class, stamped `by` and `ts`, advances node's live instance and fires the hooks.
- So the same click and the same agent call write two different grammars through two writers.

## Build (the smallest slice)

1. **Servex route** `POST /api/item` in `Servex/Servex.js`, beside `/api/tidy` (same `cors` + `express.json` pattern, plus `OPTIONS`). Body `{path, target?, delta}` → `run_item({path, target, delta}, {caller: "owner"})` → JSON answer as-is. Refuse any request not from loopback (`req.socket.remoteAddress` is `127.0.0.1`/`::1`/`::ffff:127.0.0.1`): it writes files (see the closed RCE note: rpc:cmd was LAN-reachable).
2. **One browser verb call on Item**: `item.act(verb, args)` in `core/Item/Item.js`. It runs `this[verb](args)` locally (optimistic, the page redraws at once) with its own `set` deltas NOT recorded, then emits ONE `"delta"` `{[verb]: args ?? {}}` with `this` as origin, so `Store.line_for` nests it to the right hops exactly like any other delta. If the method refused (it warned and nothing changed), emit nothing. Keep it a few lines; name the mute flag clearly.
3. **Store writes through the item tool**: `Store.flush` posts each line as a delta to `servex_url("/api/item")` (`/framework/dev/servex_url.js`, path = the store's file's folder url, or the file url if `run_item`'s `resolve` needs it — check `resolve_file`). Only when Servex does not answer, fall back to today's `FsFile.send` and `console.warn` once. **Echo skip**: the line comes back from the tail with `by`/`ts` added, so `skip_echo` must compare with `by` and `ts` removed.
4. **Buttons**: in `core/Task/TaskView.js` (the one task row/card every surface uses, so the session page's tasks get it too), show only the verbs the task's state allows: Start, Pause, Resume, Stop, Approve. Expose `Task.can(verb)` from the existing `CAN` map rather than copying it. Click → `task.act(verb)`; `e.stopPropagation()` so the row does not toggle. Small icon buttons (Material icons, as the row already uses), 44px touch target, fitting at 400px. Load the `ui` skill first.

## Prove it

- A node test `core/Item/act.test.mjs` (or beside `Servex/agents/item_tool.test.mjs`): `run_item` with `caller:"owner"` on a temp task writes `{"start":{},"by":"owner","ts":…}` and a fresh `Task.replay` of the file is `running`; `Item.act` on a Task emits exactly one delta `{start:{}}` and none for the state set; a refused verb emits nothing.
- Restart nothing yourself. The mastermind restarts Servex after the merge. You may run Servex's route code by importing `run_item` directly.
- A 400px headless shot (`mcp__site__shot`) of a page that shows TaskView rows with the buttons (e.g. `/framework/core/Task/live/` or a task page); save it in this folder as `shot-400.png`.

## Do not

- Do not touch the dev server's `Append.js`, `page_tools.js`'s grammar, or `Page`'s own save path beyond what Store.flush changes.
- No new npm dependency. Never write the owner's name.

## Report

On your task log, then end your turn: branch name, commits, test output (pass/fail lines), the shot path, and anything you decided differently and why.
