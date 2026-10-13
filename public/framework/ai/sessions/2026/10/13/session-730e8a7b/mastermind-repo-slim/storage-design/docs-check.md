# Docs check: Page readme, storage.md, storage-slice-1.md

Checked 2026-10-13 against `core/Item/Store.js`, `core/Page/Reader.js`, a file census. Verdict: slice 1 is buildable from the brief; the fixes below are mostly clarity.

1. **storage.md, intro and diagram (newcomer).** It opens with `Store`, `Backend`, `Journal` and `Archive` before saying what a "line" or "delta" is or who "the page" talks to. Fix: add a 3-sentence plain-words paragraph above the diagram: "A page remembers its changes as lines. A Store reads and writes them. A Backend is how the browser reaches the lines; a Journal is where a server keeps them."

2. **storage.md section 1 vs slice-1 deliverable 1 (contradiction on `open`).** storage.md says `open(store)` "read everything into store.read(), then keep tailing"; slice 1 says the base `open` returns `this.load(store)` (no tail). Fix: say in storage.md that the base class loads only and `DevBackend` adds the tail.

3. **storage.md `Backend` listing: `read(since)` / `tail()` mixed with slice-1 verbs.** The "later" members sit in the same class block, so a builder may add them. Fix: move them to a separate commented block "NOT in slice 1" or delete them until `CloudBackend` is designed.

4. **storage.md: `Store` row says `close()` "moves up from Page.Reader" but `Store` has none today (Reader.js line 18 owns it).** Slice 1 item 6 says to delete Reader's `open()`/`close()`. Reader's `open()` is `if (!dev) return this.load(); ...`, which differs from `Store.open()` (line 44). Fix: slice 1 should state which `open()` wins and that Reader's `this.live` field moves into `DevBackend` (the brief already hints at this; name it).

5. **Name collision: `Store`.** `Item.Store` (core/Item/Store.js) is the replay class; `ai/AISession/StoreFolder.js` exists and `Saver`/`page.prefs()` are called "snapshot store" in the table. Fix: add one line in storage.md "Store here always means `Item.Store`; `StoreFolder` and the Saver are unrelated."

6. **Name collision: `Journal` and `Room`.** `worker/room.js` already has `Room` and `RoomJournal` is "generalised Room", but no `Journal` file exists today (grep found none), so no clash in code. Risk is the word "journal" next to "log", "page.jsonl", "JSONL" and `TaskJSONL`: four words for one idea. Fix: define once, "Journal = the server-side home of one page's lines (a JSONL log)", and use it consistently.

7. **Name confusion: `Backend` and `PageLogReader.dev`.** Two checks for "am I on localhost" exist (`Store.open`/`writable` and `PageLogReader.dev`); slice 1 deliverable 5 writes a third in `Store.pick`. Fix: slice 1 should say `pick` reuses one exported constant (for example `Store.dev`) and `Reader.dev` aliases it, rather than leave three copies.

8. **storage.md "Which existing file becomes which", first row.** Says "`Store`, same name, same API" yet section 1 lists new `pick`, `backend`, `close`. Fix: change to "same name, same existing API, three additions".

9. **Slice 1 "Why this slice" claims `Store` is where "every fetch, socket and write" goes.** `TaskJSONL` and `live.stream()` callers bypass it (the fence says so). Fix: add "except `ext/JSONL/JSONL.js`, left alone on purpose".

10. **Slice 1 proof, missing detail you need.** (a) The demo `/framework/core/Item/live/` and `/framework/core/Page/tool/` should be checked to exist (not verified here). (b) No statement of what "echo" test (c) uses to stamp the sent line; a builder must read `Store.js` to guess. Fix: give the exact stub: "append one line, then call `store.read([same text])`; expect the Item's set to run once."

11. **Slice 1 item 5, `_backend ??=` getter.** Store.instances is keyed by url in `Store.for`; a test that assigns `store.backend = new MemoryBackend()` on a shared per-url instance leaks into other tests. Fix: tests should use `new Store(url)` not `Store.for(url)`, or call a `Store.instances.clear()` in teardown.

12. **Page readme: storage paragraph.** Good tip, but line 33 mentions `files.jsonl` and `directory.json` with no link to what a newcomer should do. Also two near-duplicate `Notes:` bullets and the "moved to readme-full" stubs make the file read as unfinished. Fix: link `files.jsonl` to its doc, and merge the three `Notes:` bullets into one line. The storage link on line 39 is bolded like the others; good, keep.

13. **storage.md section 5 and section 4 length.** The page is 220 lines for a "tip"; newcomers hit costs and 16-row Cloudflare history before any example. Fix: add a "Show it" line near the top, e.g. a 5-line `page.jsonl` sample with `{"home":"room"}`, and move sections 4 and 5 to `doc/storage-costs.md` linked from the top bullets.

14. **Missing for slice 1: file/link checks.** Brief says "mark built in storage.md section 1" but the backends are listed inline in a code block, so marking means editing comments. Fix: add a `[built]`/`[not built]` token convention in the block, or a small status table.

15. **Link check (partial).** Relative links `storage.md` and `storage-slice-1.md` resolve (both are in `core/Page/doc/`). `../../../ext/JSONL/readme.md` and `../../../ext/Query/readme.md` from `core/Page/doc/` go to `public/framework/ext/...` correctly. Not checked: the `/imagine/...` links.
