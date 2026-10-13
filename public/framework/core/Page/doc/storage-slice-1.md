# Storage slice 1: give `Store` a backend, with zero behaviour change

**A brief, ready to spawn** (a Sonnet minion, in a worktree). The design it starts: [storage.md](storage.md). The owner's words: asks 5 and 6 of [requirements-2.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-2.md) ("keep the JSONL system and lean into it now"; "a page system that could store in different ways").

Load the `minion` and `code` skills first. Budget: about $6 and one hour.

## Why this slice

Every fetch, socket and write a page makes goes through `core/Item/Store.js` today, mixed in with the replay logic. Pulling those lines out into a `Backend` object is the one seam every later store needs (Durable Object, archive, demos that never persist). This slice only moves code: every page behaves exactly as before.

## Deliverables

1. **`core/Item/backend/Backend.js`**: `class Backend` with `open(store)`, `load(store)`, `append(lines)`, `close(store)`, `get writable`, `get live`. A plain base: `open` returns `this.load(store)`, `append` does nothing, `writable` and `live` are false.
2. **`core/Item/backend/DevBackend.js`** (localhost): `open(store)` is today's `import("../../ext/JSONL/live.js").then(live => live.stream(store, () => store.changed()))`, keeping the `live` module so `close(store)` can call `live.drop(store)`; `load(store)` is today's `Store.load()` body (the fetch, the html-means-missing check, `store.read(store.parse(text))`); `append(lines)` is today's `FsFile.send(lines)` call (the dynamic import stays dynamic: `FsFile` imports `Item`). `writable` and `live` are true.
3. **`core/Item/backend/StaticBackend.js`** (production): `load(store)` is the same fetch; `open` is `load`; not writable, not live.
4. **`core/Item/backend/MemoryBackend.js`**: holds `lines` in an array; `load(store)` replays them through `store.read()`; `append(lines)` pushes them; `writable` true, `live` false. For demos that must never persist and for node tests.
5. **`Store` (`core/Item/Store.js`) delegates**: `static pick(url)` returns `new DevBackend()` on localhost, `127.0.0.1` or `*.localhost`, else `new StaticBackend()` (the same test `Store.open()` and `writable` use today, written once); a `backend` getter (`this._backend ??= this.constructor.pick(this.url)`) that a caller may assign; `open()`, `load()`, `flush()` and `writable` call it. `read`, `parse`, `attach`, `line_for`, `append`, the echo skip and the helpers below the class do not change.
6. **`PageLogReader` (`core/Page/Reader.js`)**: delete its own `open()` and `close()` and use the backend's (`close()` becomes `this.backend.close(this)` on `Store`); its `PageLogReader.dev` flag stays, because other files read it (grep `Reader.dev` and `\.dev\b` before touching it). Everything else in the file is unchanged.
7. **`core/Item/Store.test.mjs`** (node, in the style of `Item.test.mjs`): with a `MemoryBackend`, (a) an `Item` attached to a Store records a `set()` as one line; (b) replaying those lines into a fresh Item gives the same state; (c) a line the store sent and then receives back is skipped (echo); (d) `StaticBackend` with a stubbed `globalThis.fetch` loads lines and treats an html answer as "no file"; (e) a Store whose backend is not writable keeps the change in memory and writes nothing.
8. **Docs**: in `core/Item/readme.md` one line naming `backend/` and linking [`../Page/doc/storage.md`](storage.md); in [storage.md](storage.md), section 1, mark `DevBackend`, `StaticBackend` and `MemoryBackend` as built.

## Fence

`public/framework/core/Item/Store.js`, `core/Item/backend/` (new), `core/Item/Store.test.mjs` (new), `core/Page/Reader.js`, `core/Item/readme.md`, `core/Page/doc/storage*.md`, your task dir. Nothing else: not `ext/JSONL/live.js`, not `Server/`, not `page_tools.js`, not `ext/JSONL/JSONL.js` (the `TaskJSONL` reader keeps calling `live.stream()` directly). If a change outside the fence looks needed, stop and say so in your task log.

## Proof (all of it, before merging)

- `node public/framework/core/Item/Store.test.mjs`: every check passes.
- `node public/framework/core/Item/Item.test.mjs` (5 assertions today) and `node public/framework/core/Page/Template/Template.test.mjs` (14 checks today): still pass. Both were run on 2026-10-13 and passed.
- **Live append still streams:** in the worktree's site, open `/framework/core/Page/tool/` headless (Playwright, never the owner's tabs), append one line with `page_set`, and screenshot the new card appearing without a reload (the `ui-test` skill).
- **A browser write still lands:** on `/framework/core/Item/live/` (its demo writes through `Item.Store`), make one change headless and check that `demo.jsonl` grew by one line. Revert it with a second change, never by editing the file.
- `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree> /framework/core/Page/tool/ /framework/core/Item/live/ /framework/ai/`: zero console errors, zero failed module requests.

## Watch out

- `Store.js` is imported by `Item.js` (`Item.Store = Store`) and must still load in plain node (checked: `node -e 'import("./public/framework/core/Item/Store.js")'` works today). The backends must not import `location`, `Socket` or `FsFile` at the top of the file: only inside a method, dynamically, as `Store.js` does now.
- `live.stream()` treats its first argument as the reader (`url`, `offset`, `read`, `parse`, `reset`, `load`), so `DevBackend.open(store)` passes the Store itself, not the backend.
- No DOM after an `await`; no new npm dependency; `windowsHide: true` on any process you start.
- One class per file, the file named for the class (CLAUDE.md).
