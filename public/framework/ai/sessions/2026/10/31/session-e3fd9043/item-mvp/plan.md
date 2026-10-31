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
