# Review 2: file moves (Files.js, ModuleMove.mjs) and the line readers

An independent review by a reviewer who did not write the code. Brief: `brief-R2-review.md` (session scratchpad). Scope: `b56933e46..HEAD`
(`1d4c330cb`). No code was changed. Repro scripts and temp repos: `review2/` in the session scratchpad (`setup.sh` builds a small git repo with
a page `notes/trip/`, a parent, an importer, a `page.jsonl` with a class link, and some prose; `t1`..`t7` run against copies of it, never the real tree).
The first review (`review.md`) is not repeated.

## Findings, most severe first

### 1. A move that fails half-way leaves every link rewritten and cannot be undone
- **Where:** `Server/ModuleMove.mjs:146-148` (`apply`): the link rewrites (`writeFileSync` for every changed file) run first, `relocate()` after.
- **Wrong:** if `relocate` throws (Windows `EBUSY`/`EPERM` because a file in the folder is open, an editor or the indexer holding it), the folder stays
  at the old place but every other file now points at the new one. The manifest was written without `how`, and `Files.move_undo` then
  refuses ("`to` is no longer there"), so the UI has no way back. `Files.move_apply` just says "could not move".
- **Scenario:** rename `notes/trip` to `notes/journey` on Windows while `Trip.js` is open in a tool that locks it. `public/other/page.js` now imports
  `/notes/journey/Trip.js`, which does not exist.
- **Confirmed by run:** `t2.mjs` (relocate made to throw `EBUSY`): folder still at `trip`, `other/page.js` rewritten to `journey`, manifest has no `how`, undo refused.
- **Smallest fix:** wrap `relocate` in try/catch in `apply`; on a throw write each `changes[i].text` back to its original (re-read the old text from the plan, or keep it) and rethrow.
  The same hole exists in `undo` (`ModuleMove.mjs:166-167`): files are restored at the new location, then `relocate` may throw and leave them half-restored.

### 2. Renaming or moving a FILE rewrites no links at all, and the tab does not say so
- **Where:** `Files.js:140-144` (file kind: plain `renameSync`), `Files.js:130` (`move_plan` for a file returns only from/to), `FilesTab.js` `propose` (a file goes straight to `apply_move`, no plan).
- **Wrong:** a folder shows "N links will be updated"; a file shows "X is now Y" with an Undo, while every `import "./Base.js"`, `<img src>`, markdown link or page.js reference to it breaks.
  Dragging a `.js` or `.css` or image onto a folder row does the same in one gesture.
- **Confirmed by run:** `t5.mjs`: `Base.js` renamed to `Core.js`; `trip/Trip.js` still has `import Base from "../Base.js"`, and `Base.js` is gone.
- **Smallest fix:** send a file through the same `ModuleMove` (its `inside()` test already needs `/` or equality, so `Base.js` does not match `Base.js.bak`), or at least run `plan()` for a file and show the count in a confirm row before moving.

### 3. Links in `.jsonl` files and in `children: ["a", "b"]` arrays are not seen
- **Where:** `ModuleMove.mjs:26-27` (`CODE`/`DOC` only: `.js .mjs .css .html .md`); `Files.js:223` (`children_string` only matches a quoted string, not an array).
- **Wrong (a):** the header comment says `*.json/*.jsonl` get "only their import paths" changed, but `files()` never lists a `.jsonl` at all. Outside the dated session folders there are 20 `.jsonl` pages
  with `"class":"/framework/..."` lines (e.g. `ai/tests/*/page.jsonl`, `tasks/page.jsonl`; over 800 `"class"`, 290 `"url"`, 64 `"module"` values in all). Moving the class's folder
  breaks those pages and the move plan counts none of them.
- **Wrong (b):** 101 `page.js` files use `children: ["name", ...]` (for example `public/layouts/labs/mag/page.js`, `ai/sessions/2026/09/25/page.js`). The legacy-string guard looks for `children: "` only, so moving or renaming
  such a child is accepted, and the parent keeps naming a folder that is gone.
- **Confirmed by run:** `t1.mjs`: after renaming `trip` to `journey`, `public/other/page.jsonl` still has `"class":"/notes/trip/Trip.js"` (the plan counted 7 links, none of them this one). `t5.mjs`: `children_string` returns `null` for `children: ["trip"]`, and `move_plan` is accepted.
- **Smallest fix:** (a) add `.jsonl` to the scan but only for non-history files and only for the absolute-url form (`"/framework/..."`), skipping `page.jsonl` `file` lines that `declare` already handles;
  (b) make `children_string` accept `[` ... `]` and read the quoted words.

### 4. The absolute-name match is not anchored, so unrelated paths are rewritten
- **Where:** `ModuleMove.mjs:76-79` (`at(name, i = token.indexOf(name[0]))`: first occurrence anywhere in the token, with nothing checked before it).
- **Wrong:** `/notes/trip` matches inside `Servex/notes/trip/readme`, `https://example.com/notes/trip/` and `/home/me/notes/trip`. All are rewritten in live code and docs, and the dry-run count includes them.
- **Confirmed by run:** `t1.mjs` rewrote `Servex/notes/trip/readme`, `//example.com/notes/trip`, `/home/me/notes/trip` (the first, a comment in `public/other/page.js`; the last, `Server/note.md`). Undo restored them (the manifest holds the columns).
  The risk is highest for short names (a one-word folder under `public/framework/` also becomes a bare-name match for every `word/...` token at the start of a token in prose).
- **Smallest fix:** accept the url form only when the text before the match is empty, `public`, `http(s)://host` or a run of `../`; reject the rest.

### 5. A move that succeeded is reported as a failure when the list catch-up or the parent link throws
- **Where:** `Files.js:149-151` (`declare`, `catch_up` called outside the try that wraps `mover.apply`); the constructor's catch turns any throw into `move_apply failed: ...`.
- **Wrong:** `PageFiles.settle_folder` writes `files.jsonl`/`page.jsonl`; on Windows the very `EPERM`/`EBUSY` that `catch_up` exists for can throw here. The folder is already moved and the manifest written, but the tab shows a red error and no Undo button, and the owner may retry (which then says "nothing named trip").
- **Confirmed by run:** `t7.mjs` (`settle_folder` made to throw): reply `ok:false`, folder moved, manifest on disk.
- **Smallest fix:** try/catch `declare` and `catch_up` in `move_apply` (and in `move_undo`), ignore or log, and still answer `ok:true` with the manifest.

### 6. Case-only rename of a folder is refused on Windows, after the plan said yes
- **Where:** `ModuleMove.mjs:139` (`exists(this.to)` is true when `to` differs only in case on a case-insensitive disk); `Files.js:192` lets it through (it excludes `from` itself from the clash check).
- **Wrong:** `Trip` to `trip`: `move_plan` shows "Rename...", Apply answers "already exists (Windows folds case...)". Files do work (a plain `renameSync`). Reasoned (Linux disk; not run).
- **Smallest fix:** for a case-only change do two steps through a temp name, or skip the `exists` check when `to.toLowerCase() === from.toLowerCase()`; `git mv` handles case on Windows.

### 7. Undo is all-or-nothing and is stopped by an unrelated edit above a rewritten line
- **Where:** `ModuleMove.mjs:159-161`.
- **Wrong:** each edit is checked by (line, column). If the owner adds a line above a rewritten link in `other/page.js`, or edits the same line before it, the whole undo refuses and the folder stays moved. Safe (nothing is written), but the owner
  must rename it back by hand (which does work, as a new move). The second pass (`writeFileSync` loop, line 166) is not atomic: one failing write leaves some files restored and some not.
- **Confirmed by run:** `t5.mjs`: appending a line at the end is fine, a line added at the top refuses with `page.js:3:54 no longer holds ...`.
- **Smallest fix:** on a mismatch, search the line for `e.to` near `col` (or anywhere on the line), restore the edits that still match, and report the ones skipped. Optional.

### 8. The scan blocks the event loop 1.3 s per pass, and `move_apply` scans twice
- **Where:** `Files.js:146-147` (`summary()` then `apply()`, which calls `plan()` again), `move_plan` once.
- **Measured:** `t3.mjs`: 1.3 to 1.4 s per `plan()` for `core/Item` (349 files, 768 paths); `framework/ai` is 4,134 files. A move blocks the dev server (and the save of every other tab) for about 2.7 s plus the writes.
  Not a bad stall for a deliberate, rare action, so low.
- **Smallest fix:** `apply(manifestFile, extra, changes = this.plan())` and pass the plan that `summary()` already built.

### 9. Smaller
- `Files.upload` does not refuse `page.js`, `page.jsonl`, `files.jsonl` or `_removed` (only `set_aside`/`work_out` do). Dropping a file called `page.js` into a plain folder turns it into a page; `files.jsonl` seeds a list. A clash with an existing one is kept as `page (2).js`, so nothing is overwritten. Reasoned.
- `Files.move_undo` joins `m.extra.from_parent`/`to_parent` from the manifest without `inside_public` (`Files.js:168-170`), unlike `from`/`to`. The manifests are committed, so a pulled or hand-edited one could aim `declare` (an append to `<path>/page.jsonl`) outside `public/`. Low. Reasoned.
- `LineKey.bare("#a()")` removes only the trailing `()` and returns `#a`. Not a data problem (no such key exists), but the two marks do not combine. Reasoned from `LineKey.js:8-9`.

## Looks right

- **Path safety in `Files.js`:** `..`, dot segments, backslash, NUL, `node_modules`, drive letters, symlinks (realpath), and URL-encoded names (taken literally) are all refused for `folder()`; `check_name` blocks separators, Windows-forbidden characters, a leading dot, a trailing dot or space, and device names; `move_undo` takes only a bare `*.json` name inside `Server/moves/` and checks `from`/`to` with `inside_public`.
  A symlink at the top is refused (`lstat`); symlinked folders inside the tree are not walked by the scan.
- **Move into itself / onto an existing name:** the realpath prefix check catches both the folder and its descendants; the clash check is case-insensitive and ignores only `from` itself.
- **Undo when the moved-again case happens:** a second move of the same folder makes the first undo refuse ("no longer there"); two tabs undoing the same move get "already undone"/"something is now at ...". No data touched in either case.
- **Edit columns:** `col` is measured in the rewritten line and undone right to left; CRLF and non-ASCII text are fine (`\r` stays on the line, JS string indices). Undo after an append at the end of a touched file succeeds and keeps the append (`t5.mjs`).
- **Parents' lists:** `declare` + `PageFiles.settle_folder` do not double a line (PageFiles compares first); the rewrite of the moved folder's own relative imports (`../Base.js`) is re-aimed correctly.
- **`git mv` fallback:** a folder git does not track (or any git failure) falls back to a plain rename, and undo does the same; no half state seen in a temp repo.
- **LineKey readers:** `deep()` returns the same object when nothing is marked, so bare lines read exactly as before (identity kept; 1,086 lines x10 in 56 ms on the biggest real `session.jsonl`). No real `.jsonl` file holds a key starting with `#` or ending `()` (grep over `public`, `Server`, `Servex`; the only hit is the new test fixture).
  `Object.prototype` is not reachable through `#__proto__` (checked). `AIIndex.fold` copies the array but keeps the line objects. The readers that changed (`AIIndex`, `DatedFiles`, `PromptAudit`, `TaskMigrate`, `UndoneAsks`, `TaskLoop`, `SessionTimelineRows`, `ChatV2Model`, `ChatV3`) only read; none writes the unmarked line back.
- **Uploads and set-aside:** parts in order, 25 MB counted per part, `.part` files cleaned up when the socket closes, hard link then exclusive copy so nothing is overwritten, set-aside never deletes and `RESERVED` is compared in lower case.
