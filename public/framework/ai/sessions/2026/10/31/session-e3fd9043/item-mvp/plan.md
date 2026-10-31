# Item MVP: plan

**Goal:** turn the persistence research into a working, tested Item system on branch `claude/replay-tests` (off `integration/data-shapes-2`), with visual tests the owner can click through, then design the file system integration. Asks: [requirements.md](requirements.md). Research: github.com/mikelew42/research `design/` (D1–D18).

**Rule for open decisions:** take the recommended option, keep it easy to reverse, and record the alternative in the module's doc. A switch for the other way only where it doesn't make every method work two ways.

## What exists today (scout, 2026-10-31)

| Need | Already there | Gap |
|---|---|---|
| Visual tests | `core/Test` (node `Test`, `TestRunner.mjs`), `TestView` (browser steps, one shared panel), `ext/demo/demo.js` `demo(fn, caption)` | no `test(name, fn)` with one rendered block per test |
| Debug view | `ux/Content/Object/DefaultView.js`: expandable `<details>` of an Item's data, lists and refs, live | reuse it as every test's default view |
| Line format D13 | `set_one` calls a method by bare name, steps into children, hops bare ids (legacy) | no `name()` or `#id` keys |
| Save path | `Store.flush`: record files POST `/api/item`, others socket `append`; tail via `live.js` | no seq, ack or client id; two channels |
| Volatile values | `_` keys never saved, `hide()`, `core/Property` | Task's open running span `_ran_since` is lost on reload |
| Snapshots | none (`Compact.mjs` dry run only, `FsFile.clear` has no caller) | load = full replay |
| Files | `files.jsonl` (writer `Server/plugins/PageFiles.js`, reader `core/Page/Listing.js`), `ext/files` explorer, socket `write/ls/rm/move` (`Runtime.js`) | not part of a page's own view; no create or move from the page |
| Plugins | Server `Events.use(plugin)` (hooks "new"); `Page.use(Ext)`; page.jsonl `{"ext": name}` | documented nowhere in one place |

## Waves (most important first)

**Wave 0: Replay Lab on the real classes** (running). `core/Item/replay/` and the characterization tests `core/Item/replay.test.mjs`. Found so far: `Item.replay` and `Item.open` disagree on a plain Item (failing test, not fixed).

**Wave 1** (parallel, separate files):
- **A. Visual tests.** `test("name", fn)`: in the browser each test gets its own block; views made inside `fn` render there, and objects it returns render with `DefaultView`; checks show pass or fail in the block. The same file runs in node without the views. Owner: `core/Test`.
- **B. Item core, test-first** (failing test commit, then fix commit, one at a time, quick ones first):
  1. Clear-win fixes: a throwing view listener stops the save; `act`'s mute is global (`Store.muted`) so an unrelated write is dropped; `set()` accepts values that can't be saved (functions, DOM nodes, cycles); `Item.replay` vs `Item.open` (Wave 0's failing test); a replayed child change re-runs the parent's `complete()`; Task's open running span is memory-only (save `ran_since` as data, D18).
  2. D13 line format: read `name()` as a call and `#id` as a list item, keep reading old lines; `act` writes `name()`; refuse data names that end in `()` or start with `#`.
  3. D17 hooks: if a class has `set_<key>(value)`, `set()` calls it instead of the default, and the hook stores with `this.put(key, value)` (the owner's own pattern, so calling it directly also saves). Runs live, from another tab and on replay.
  4. D14 calls: a method saved as one call wraps its body, `return this.as_call("sort_by", [key], () => { … })`: saving is muted for this item only while it runs, one `{"sort_by()": [key]}` line is saved, only for the outermost call and never during replay. `act()` keeps working.
  Owner: `core/Item`, `core/List`, `core/Task`, the mute check in `Store.js`.
- **C. Socket streaming.** Send every line through the socket (the owner's preference), with a client id, a per-client counter and an ack, and catch up from the last offset after a reconnect; keep `/api/item` as a fallback. Tested here with the real dev server and two browser tabs. Owner: `Store.js` transport parts, `RecordWriter.js`, `ext/filesystem/FsFile.js`, `Server/plugins/SocketServer/`.

**Wave 2:**
- **D. Docs:** one overview of the core API as pseudo-class snippets (Events, Item, List, Page, Task, Store, Property, Test, plugins and extensions), what each method does in one line, linked from `core/readme.md`.
- **E. Snapshots:** a script that collapses a `.jsonl` into a snapshot line (the final values) plus the tail, and a loader that starts from it; the full log is kept.
- **F. File system design:** pages are folders; show a page's files in a Files tab from `files.jsonl`; create a child page, upload or drop a file, rename and move through the socket's `write` / `move` with a scripted manifest. Design doc first; build the listing tab if budget allows.

**Experiments (optional):** a named Item variant (a word, not a number) to try the other strategy, e.g. replaying calls by default, without touching Item.

## How agents work here

- One worktree (`/home/claude/build`), separate files per agent. Stage files by path; never `git add -A` (the dev server rewrites `files.jsonl` files and `npm install` touches `package-lock.json`: noise).
- Sonnet for code and UI, Haiku for audits and scans; the coordinator reviews each diff, runs the tests and pushes the branch (Cloudflare preview `claude-replay-tests-monorepo.lew42.workers.dev`).
- Usage checked before each wave (`node Server/usage-now.mjs` on the owner's PC through Servex). At 17% of the week, 62% of pace when this started.

## Progress (coordinator, 2026-10-31)

Landed and pushed on `claude/replay-tests` (35 of 37 core test files pass; the 2 others need the live site):
- **Wave 0** Replay Lab on the real classes: `/framework/core/Item/replay/`.
- **Wave 1 A** visual tests: `test(name, fn)` with a block per test, `DefaultView` for objects, `test.optional` edge cases; `/framework/core/Test/view/?file=core/Item/act.test.mjs`.
- **Wave 1 B** Item core: save no longer depends on view listeners; `act` mutes only its own tree; `set()` refuses unsavable values; `Item.replay` = `Item.open`; replay never re-saves derived completion; a running task's span is saved (`ran_since`); D13 reading (`name()`, `#id`, old shapes); D17 `set_<key>` hooks; D14 `as_call`.
- **Wave 1 C** transport: every line over the socket with `{client, n}`, ack, resend, dedupe; unsent lines survive a reload; heartbeat; `Store.channel = "item_api"` opts back to Servex's POST.
- **Wave 2 F** files: design `core/Page/doc/files.md`; phase 1 built: `<page>/files/` live read-only list.
- Fix: `ext/Chat/md.js` imported `ext/Markdown` (folder is `ext/markdown`); the app didn't boot on a case-sensitive host. Same line is on michael/dev.

- **Wave 2 D** docs: the core API as pseudo-classes, `public/framework/core/doc/overview.md` (linked from `core/readme.md`); stale `/api/item` and replay-lab texts fixed.
- **Wave 2 E** snapshots: `task.snapshot.json` beside the log (the log is never touched); `Item.open` loads snapshot + tail, else full replay; `Server/Snapshots.mjs` (dry run by default) proves snapshot + tail = full replay before writing. An 8,360-line session: 360–420 ms full replay vs 27–51 ms from a snapshot.
- **Item tests as demos:** replay, line-format, hooks, call, item-core use `test()` / `t.view`; listed under "Click-through tests" in `core/Item/readme.md`.
- **Files phase 2:** `+ Page`, upload or drop (25 MB cap, a clash keeps both), set aside into `_removed/`, all over the socket (`Server/plugins/SocketServer/Files.js`), live in other tabs.

- **Independent review** (Opus, `review.md` in this folder): 8 findings, all fixed, each with a failing test first: Approve starts the agent again (record files go to Servex first, the socket is the fallback); `act()` no longer saves a parent's derived completion; a failed write is retried; a reloaded tab resends its unsaved lines at once; the per-file schema check is back for non-Item writes; `as_call` argument lists round-trip; snapshots keep Items held in data slots and carry a code hash so old snapshots are ignored after a code change; Files refuses `Page.jsonl` in any case and Windows device names.
- **`view.bind`** (D7): `view.bind(item, key, fn)` / `bind(property, fn)`, one draw per frame, released by `remove()` / `empty()`; worked example on the session detail's cost line.
- **Test leak fixed:** `Servex/agents/item_tool.test.mjs` no longer writes to the real `task-moves.jsonl`.
- `Dated.test.mjs` fails in this sandbox at the base commit too (file watchers exhausted by leftover dev servers); not a regression.

Running: every line reader understands `name()` / `#id` (so D13 writing can be switched on); Files phase 3 (rename, move, nest with a dry run and undo).

Not started: switching on `Store.marked_lines` (needs the dozen bare readers updated), Files phase 3 (rename, move, nest), per-person UI state (D18), an Item variant experiment, running `Snapshots.mjs` automatically.

## Open for the owner (work continues on the recommended answer)

1. **`files/` on Doc pages:** `ext/Doc` declares its own `files` tab (source files), so a Doc page's `files/` shows that. Rename one route, or give the Doc section a folder list. Recommended: keep Doc's, and name the folder list `folder/` on Doc pages only.
2. **`Store.marked_lines` is off.** About a dozen readers only read the bare spelling (`core/Item/doc/line-format.md`). Turn it on after those readers are updated.
3. **`as_call` line shape:** one argument is saved as the value (`{"sort_by()": "title"}`), not an array, because the item tool strips `()`.
4. **Existing `set_<name>` methods are now hooks** (`core/Item/doc/hooks.md` lists them).
5. **Servex's live copy and hooks:** record files (`task`, `session`, `page`, `improvements` .jsonl) go to Servex's `/api/item` first (the default, `Store.channel = "item_api"`), so its live copy and its hooks keep working (Approve starts the agent); the socket is their fallback and the road for every other file. `Store.channel = "socket"` skips Servex: no hooks, and Servex re-reads the file on its next `item()` call. Decided after the review (finding 1); see `core/Item/doc/transport.md`.
6. **Dedupe is in server memory:** a server crash between writing and acking, then a resend, can write a batch twice.
8. **Snapshots on the static site:** opening a log that has no snapshot costs one extra 404 request. A site-wide list of snapshotted logs would avoid it. Recommended: leave it until it shows up as slow.
7. **Files design answers taken as defaults:** route `files/`, 25 MB upload cap over the socket, keep both on a name clash, move manifests in `Server/moves/`, names only in phase 1.

9. **`as_call` with no arguments** is saved as `{"name()": {"$args": []}}` so a replay calls it with no arguments (default parameters still apply); trailing `undefined` arguments are dropped.

## Found along the way

- **A test writes to a real log:** a run of the item-tool test (temp module `zz-item-tool-test-<pid>`) appended a line to the real `public/framework/ai/sessions/task-moves.jsonl` (`"by":"test"`). Restored by hand; the test should write its moves log inside its temp folder.
