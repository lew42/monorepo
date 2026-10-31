# Files and pages: one system (design, 2026-10-31)

**Status: phases 1, 2 and 3 built (2026-10-31).** Phase 1 is `core/Page/FilesTab.js` + `PageListing.live` (`Listing.js`), tested by `Listing.test.mjs`. Phase 2 is `Server/plugins/SocketServer/Files.js` plus the controls in `FilesTab.js`, tested by `Server/plugins/SocketServer/Files.test.mjs` (see "Phase 2 as built" at the end). Phase 3 is rename and move, tested by `Files.move.test.mjs` (see "Phase 3 as built"). Ask (the owner, 2026-10-31, decisions-log): a page is a path, the UI should work like a file explorer (create, move, rename, delete, drop a file in), and items, pages and plain files should feel like one Notion-like system that uses the real file system. This doc says how, using what already exists (law 6). Written for a coder who has not seen the rest.

Read first: [../readme.md](../readme.md) (what a page is on disk), [subpages.md](subpages.md) (how a child is declared), [streaming.md](streaming.md) (how a line reaches the screen).

## 1. The model in one picture

```
/notes/                      a PAGE is a FOLDER; its url is its path
  page.jsonl                 the page's own log (line 1 builds it; later lines are its items)
  files.jsonl                the folder's file list (only when there is a page.js; see below)
  photo.png                  a FILE: a plain file in the page's folder
  budget.pdf                 a FILE
  c3.jsonl                   an ITEM with its own file   (D9 shape 2)
  trip/                      a CHILD PAGE: a folder with its own page.jsonl or page.js
    page.jsonl
  c7/                        an ITEM with its own folder (D9 shape 3): same as a child page
    page.jsonl
  doc/                       a plain folder (no page): listed, not a page
  _removed/                  things "deleted" from the UI, moved aside (never rm)
```

The three ways an item can be stored (research [phase-1.md](https://github.com/mikelew42/research) section 10, decision D9, recommended `class-default`):

| Where | On disk | The parent's page.jsonl says | Shows in the Files tab as |
|---|---|---|---|
| embedded (default) | lines inside the parent's `page.jsonl` | `{"tasks":{"add()":{"id":"c3",…}}}` | nothing (it is content, not a file) |
| own file | `c3.jsonl` beside the parent log | `…"file":"c3.jsonl"` | a data file, badge `item` |
| own folder | `c3/page.jsonl` | `…"file":"c3/"` | a child page |

**The one idea that makes it seamless: an item with its own folder is a page.** A page is an item that has a folder. Promoting an embedded item to its own folder (`move_to`, D9) is how a note becomes a nestable page; the url appears and the files can sit beside it. D9 does not name the record inside `c3/`; this design says `c3/page.jsonl`, so the folder is a page with no extra rule.

**Three files, three jobs, one rule for which holds the list** (the rule is `PageFiles.log_of(dir)`, [Server/plugins/PageFiles.js](/Server/plugins/PageFiles.js)):

| File | Holds | Written by | Read by |
|---|---|---|---|
| `page.jsonl` | the page's items and settings; for a jsonl page (no `page.js`) also its file list | the page's Store; `Subpages.js`; `PageFiles.js` (file lines only) | `Page.Reader` |
| `files.jsonl` | the file list of every other folder (a `page.js` page, `doc/`) | `PageFiles.js` only, on every disk change | `Page.listing(url)` → `PageListing` |
| the folder itself | the real files | whatever put them there (an editor, git, an upload) | `fetch(url)` |

`PageFiles` watches the disk and appends `{"file":"x"}` or `{"file":"x","gone":true}` whenever the real folder changes, whoever changed it. **That is why the UI never has to tell other tabs anything:** every operation below changes the disk; the watcher appends the list line; the tail pushes it to every open tab. One source of truth, no second notification system.

## 2. The Files tab (read-only, live)

A page answers `<url>files/`, a new built-in route beside `md/`, `fs/` and `inbox/` (`Page.child()`), and shows a small `Files · N` link, the way Inbox does. It lists this folder's own entries, one level, from the same listing the router already loads.

```js
// core/Page/FilesTab.js — class PageFilesTab extends Page   (name checked: PageFiles is taken twice already, see below)
class PageFilesTab extends Page {
  // data: Page.listing(url) → PageListing { files, dirs, pages: Map(name → "js"|"jsonl") }
  rows()      // pages first (icon article), then folders, then files; `_removed/` last, dimmed
  render()    // ui/item rows, same as ext/files/explorer.js
  live()      // PageListing.live(url, () => this.redraw())   ← the one new piece of data code
}
class PageListing {
  static live(P, url, changed){        // like fetch_listing, but keeps the Reader open
    const reader = new P.Reader({ url: url + log_file });
    reader.open_headless(changed);     // Reader.open() already tails; with no host it keeps lines in reader.entries
    return () => PageListing.from(reader.entries, …);   // recompute the listing on each change
  }
}
```

**Reuse, not rebuild.** Rows are `ui/item` ([ui/item](/framework/ui/item/)) as in `ext/files/explorer.js`; the right-click menu is `ext/filesystem/menu.js`; opening a file is `file_link()` into the existing `fs/` code browser; a child page row is a plain link to the page. The listing data is `PageListing` as is. **The only new data code is `PageListing.live`:** `Item.Store.read()` already keeps lines in `entries` when there is no host (`core/Item/Store.js`), and `Page.Reader.open()` already tails through `ext/JSONL/live.js` on localhost, so a headless reader that never calls `attach()` gives a live list for free.

**`fs/` stays.** `fs/` is the full-screen recursive code viewer; `files/` is this one folder, with the controls in section 3. The Files tab links to `fs/` ("Open as code browser"). Doc pages keep their own `Files` section (a module's declared source files, `Doc.files_section`); it gets one link to `files/` and nothing else changes.

**Two traps to test.** (1) `files/` becomes a reserved child name like `md/`: put the branch after the listing lookup in `Page.child()` so a real folder named `files` (there is one: `ext/files`) still wins. (2) An empty folder has no log (`PageFiles.settle`), so a brand-new empty folder shows "No files yet", not an error; the first file creates its list.

## 3. CRUD from the UI (dev server only)

Every operation is one socket message on the existing dev socket (loopback only: `Socket.js` refuses these from a LAN peer, `Runtime.inside()` refuses paths outside `public/`). New messages live in one new plugin, `Server/plugins/SocketServer/Files.js` (`class Files`, wired like `Append` and `Runtime`), which **calls the existing implementations** instead of writing new ones.

| Action | Gesture | Socket message | Server code that does it | Lines written | Exists? |
|---|---|---|---|---|---|
| Create child page | "+ Page" button, type a name | `page_add(folder_url, name, title)` | `Subpages.at(parent).add()` (dry run supported) | folder + `name/page.jsonl` line 1; `{"file":"name/page.jsonl"}` in the parent's `page.jsonl`; `PageFiles` adds the same list line once (it compares first) | Tool yes (`create_page`); socket message **new** |
| Create item | "+ Item" in the page's content | none new: `list.add({…})` | the Item `Store` appends to `page.jsonl` ([Item readme](/framework/core/Item/readme.md)) | one `add()` line (own file/folder per D9 adds a `file` field) | Yes |
| Upload or drop a file | drag from the desktop onto the tab, or "Upload" | `upload(folder_url, name, base64, {part, of})` | `Files.upload`: writes `.name.part` (dot names are ignored by `PageFiles`), renames to `name` on the last part; refuses an existing name | `{"file":"name"}` in the list, by the watcher | `write` exists but sends a utf8 string, so binary files **need `upload`**; no drop code exists anywhere in `framework/` |
| Rename | click the name, type | `move(from, to)` | `Runtime.move` (atomic `fs.renameSync`; refuses an existing target; replies with the reverse move) | `gone` for the old name, `file` for the new, by the watcher | Yes |
| Move | drag a row onto a folder or page row | file: `move`; page: `move_plan` then `move_apply` (section 5) | `Runtime.move` for a file; `ModuleMove` for a page folder | same two lines in two lists (old parent, new parent) | `move` yes; plan/apply **new** |
| Delete ("set aside") | archive button on a row, then an inline confirm | `set_aside(folder_url, name)` (named `trash` in the first draft) | `Files.set_aside`: `Subpages.remove` for a page, the same move-aside for a file or plain folder, into `<parent>/_removed/<name>-<time>/` (a file keeps its own name inside that folder) | `gone` line; `_removed/` appears as a folder | **Built** (phase 2) |

**Not used: `rpc:rm`.** `Runtime.rm` is `fs.rmSync(recursive)`. The UI never calls it (CLAUDE.md: never destructive; git is the undo). Delete means move aside, always, and "restore" is a move back out of `_removed/`.

**How other tabs see any of it.** Disk changes → `PageFiles` (60 ms debounce) appends a list line → `Tail.js` pushes it → every open Files tab recomputes `PageListing.from(entries)` and redraws, and a new `page.jsonl` child line also redraws the sidebar (`seen.has("file")` in `Reader.changed`). The tab that made the change gets the same push; it never edits its own list by hand. Failures come back as the `{ok:false, reason}` sentence `Runtime.move` already uses and show in the tab, one line, with the step that failed (the framework rule).

## 4. Static hosting (Cloudflare)

Read-only, and it already works: 3,925 `files.jsonl` files are committed, so `Page.listing()` fetches the folder's list from the static site. `Reader.dev` is false off localhost, so `PageListing.live` falls back to one `load()` and nothing tails. The tab hides every control (`if (!Reader.dev)`) and says "Change files on the dev server and commit them." Not listed anywhere: folders `PageFiles` does not cover (dot folders, `node_modules`, session cache folders); they answer "No file list". The list has names only, no sizes or dates (open question 5).

**Later, R2 and a Durable Object** (research [phase-1.md](https://github.com/mikelew42/research) section 15): a Durable Object per page plays the dev server's part: it receives the same messages (`page_add`, `upload`, `move`, `set_aside`), stores file bytes in R2 under a key like `pages/<page>/<name>`, and appends the same `{"file":…}` lines to the page's log, so the Files tab does not change. What does change is moves: R2 has no rename, so moving a page with many files becomes copy plus delete per key; the research recommends flat ids with a `parent` field in the record for the cloud, and a folder tree only as a derived view. The local folder model stays as the owner asked; the cloud twin chooses its own layout behind the same messages.

## 5. Notion-like nesting

A "page inside a page" is a child folder with its own `page.jsonl` (or `page.js`), declared by one `{"file":"kid/page.jsonl"}` line in the parent. Its url is the parent's url plus the folder name, so the nesting you see in the sidebar and breadcrumb is the folder nesting on disk. Nothing else is stored.

**Dragging page A into page B moves A's folder to `B/A/`.** This rewrites every link, so it is a scripted move with a dry run and a manifest (CLAUDE.md), not a bare rename:

```js
// 1. drop on a row proposes; nothing moves yet
const plan = await socket.rpc("move_plan", "/notes/trip/", "/notes/europe/trip/");
//    → { ok, files: 14, paths: 31, sample: [...], refused?: "…already exists" }  (ModuleMove.plan(), dry)
// 2. the confirm row says "14 files, 31 links change" and offers Move / Cancel
// 3. Move writes the manifest and does it
const done = await socket.rpc("move_apply", "/notes/trip/", "/notes/europe/trip/");
//    → { ok, manifest: "Server/moves/2026-10-31T….json", undo: {from, to} }
// 4. Undo replays the manifest backwards: ModuleMove.undo(repo, manifest)
```

**Which mover?** Two exist today, which is already a law-6 break: `Runtime.move` (rewrites absolute links and imports from a census, `core/Page/tools/links.mjs`, with a one-minute undo) and `Server/ModuleMove.mjs` (dry run, `--apply --manifest`, `--undo`, also fixes relative paths and docs, uses `git mv`). The design uses **`ModuleMove` for page folders** because it is the one that writes the manifest the rule asks for, and leaves `Runtime.move` for plain files. Two things to check before building, both small: `git mv` fails on a folder git does not track yet (a page made one minute ago), so `ModuleMove.apply` needs a plain `fs.rename` fallback; and its scan of `public/ Server/ Servex/ .claude/` must be timed (if it takes over about a second, the drag shows "Working…" or uses the census instead). It does **not** rewrite a legacy `children: "a b"` string in a parent's `page.js`; `imagine/paging/make/real.js` does (`with_children`). The plan step refuses with a sentence when the old or new parent still names the page that way.

The drag UI is `ux/Tree` with `holds()` returning true, exactly as `real.js` already does (`PagingMakeRealTree`, drag + confirm row + undo); it moves into the Files tab rather than being written a second time. After the move, `PageFiles` sees the rename on both parents and writes `gone` and `file` lines; **verify this in the first move test** (it should, because `fs.watch` reports both paths), and if a parent misses its line, `move_apply` writes it through `Subpages` as `rename` does.

## 6. Phases

| Phase | What | Size | Done when |
|---|---|---|---|
| **1. Read-only Files tab on every page — DONE 2026-10-31** (the smallest useful step) | `files/` route + `PageFilesTab` + `PageListing.live` + the `Files · N` link; no writes, so it also works on Cloudflare | about a day | open any page's `files/`, add a file in the editor, the row appears with no reload; static site shows the committed list |
| **2. Create, upload, set aside: DONE 2026-10-31** | `Files.js` plugin: `page_add`, `upload` (chunked base64), `set_aside`; "+ Page" button, drag-and-drop zone, set-aside button; test with a real temp dir and a real ws server | 2 to 3 days | drop a PNG in one tab, it lists in a second tab; set aside moves it to `_removed/`; nothing is deleted |
| **3. Rename, move, nest: DONE 2026-10-31** | `move_plan` / `move_apply` through `ModuleMove` with `Server/moves/` manifests; drag rows in `ux/Tree`; D9 `file:` field and `move_to` so an item can become a page | 3 to 5 days | drag a page into another; the confirm row counts the links; Undo restores; both parents' lists are right |

Later, not planned here: insert a file into page content as a part; folders without a page get "Make this a page" (writes `page.jsonl`; `PageFiles.settle` then moves the list out of `files.jsonl`); sizes and dates; search across pages.

## 7. Open questions for the owner (each has a recommended answer; work continues on it)

1. **Route name.** `files/` for this folder's own files, `fs/` stays the code browser. *Recommended: yes.* Alternative: make `fs/` a mode of the same view (one route, but the code browser is recursive and full-screen, a different job).
2. **How a binary file travels.** Chunked base64 over the socket (`upload`), 25 MB cap for now. *Recommended*, since the owner prefers the socket. Alternative: an HTTP `PUT` on the dev server (simpler for big files, a second channel).
3. **Dropping a file whose name is taken.** Keep both: `photo (2).png`. *Recommended.* Alternative: ask replace or keep.
4. **Where move manifests live.** `Server/moves/<time>.json`, committed (they are the undo). *Recommended.* Alternative: next to the moved page.
5. **Show size and date in the tab?** Not in phase 1. `files.jsonl` lines stay `{"file":…}` so `PageFiles` can keep comparing them (adding a size would write a line on every save). Phase 2 reads size on demand with a `HEAD` request. *Recommended.*
6. **Is a dropped file also added to the page's content?** No: the Files tab is the list; a later "Insert into page" button adds a content part. *Recommended*, because automatic mentions would put clutter in the owner's pages.
7. **Is an item with its own folder a page automatically?** Yes (`c3/page.jsonl`). *Recommended*, it is what makes nesting seamless; alternative is a separate `item.jsonl` record name, which would need a second rule in `PageFiles`.
8. **`_removed/` growth.** Never emptied by the UI. *Recommended*; a cleanup would be a separate, scripted, owner-approved job.

## Names checked (law 8)

`PageFiles` already means two different classes (`Server/plugins/PageFiles.js`, the list writer; `ext/files/fs.js`, the `fs/` browser), so the new view is `PageFilesTab` in `core/Page/FilesTab.js`, and the server plugin is `Files` in `Server/plugins/SocketServer/Files.js`. If the owner prefers other words, only these two names change.

## Phase 1 as built (2026-10-31)

- Rows are `ui/item` links; file rows use `file_link()`, page rows link to the page, plain folders are not links (they have no page). Names only, as decided in question 5.
- `PageListing.live(P, url, changed)` returns `{ listing, reader, close() }`: its own `Reader` on the log `Page.listing` found (`files.jsonl`, or `page.jsonl`), never attached to a page. The tab is a config for `add()` (`PageFilesTab.route`), the same shape as `PageInbox.route`, not a `Page` subclass: less code, one pattern.
- **Doc pages are not covered.** `ext/Doc` declares its own `files` tab (the module's source files), and a declared child wins in `Page.child()`, so `core/Item/files/` shows that browser, not this list. The doc's idea of "one link from the Doc Files section" cannot work at the same url; a Doc page needs a different route name (or the Doc section grows a folder list) once the owner decides.
- The chip is added to every page render, ancestors included, like the Inbox chip.
- Checked on the dev server (a file made and deleted with `fs`, rows appeared and went with no reload, for a `page.js` page and a jsonl page) and on a static server under a non-localhost host name (committed list, no tail).

## Phase 2 as built (2026-10-31)

**The server, `Server/plugins/SocketServer/Files.js` (`class Files`, wired in `Server/run.js` beside `Append`).** Three messages, each answered `{ok: true, …}` or `{ok: false, reason: "a sentence"}`:

- `page_add(folder_url, name, title)`: `Subpages.at(folder).add()`. The name is `a-z0-9-` only (Subpages' rule); the tab makes it from the title ("Trip Notes" becomes `trip-notes`).
- `upload(folder_url, name, base64, {part, of})`: parts arrive in order; each is appended to a dot file `.<name>.<random>.part` (PageFiles ignores dot names), and the last part links it to `<name>`. The link fails if the name exists, so a clash becomes `photo (2).png`, then `(3)`: both are kept and the answer says `kept_both: true`. A disk that cannot hard-link (FAT, exFAT, some network drives) gets a copy instead (`COPYFILE_EXCL`, which also fails if the name exists), so uploads still work there and still never overwrite. Over `Files.MAX_BYTES` (25 MB) or out of order: refused and the `.part` is removed (the only thing the plugin ever deletes: its own half-written temp file).
- `set_aside(folder_url, name)`: a child page goes through `Subpages.remove` (which also writes the `gone` line); anything else is renamed into `<folder>/_removed/<name>-<time>/` (a file keeps its name inside). `page.js`, `page.jsonl`, `files.jsonl` and `_removed` themselves are refused, in any capitals (`Page.jsonl` is the same file on NTFS and macOS).

**Every path is checked** (`Files.folder`, `Files.check_name`): the folder url may not contain `..`, a dot segment or `node_modules`; it must exist, be a folder and (symlinks resolved) really sit under `public/`; a file name is one name, no slashes, no leading dot, nothing Windows cannot save: none of `: * ? " < > |`, no trailing dot or space, and no Windows device name (`CON`, `PRN`, `AUX`, `NUL`, `COM1` to `COM9`, `LPT1` to `LPT9`, with or without an extension: `nul.txt` counts; `console.txt` does not). Only a local peer can send these (`Socket.js` refuses them from the LAN).

**The tab** (`FilesTab.js`, dev server only; on a static host none of this draws): a `+ Page` button opens an inline name form (the folder name is previewed as you type; Enter creates, Escape cancels); a dashed drop zone with a "Choose files" button (a drop anywhere on the tab works; a dropped folder is refused with a sentence); an archive button on every row (not `_removed/`) which opens an inline "Move x into _removed/? Nothing is deleted." with Set aside and Cancel. The controls live in their own box that the tail never redraws, so a half-typed name survives other tabs' changes. The result of the last action is one line under the zone. The list itself changes only through the tail, as designed.

**Tests.** `node Server/plugins/SocketServer/Files.test.mjs` (real ws server, real folder under git-ignored `public/data/`, the real `PageFiles` watcher): create, byte-identical three-part upload, clash keeps both, set aside moves and loses nothing, eleven escape attempts refused, the protected names in any capitals and the Windows device names, plus the cap, out-of-order parts, a symlink and a disk without hard links (faked: `fs.linkSync` throws). Browser: two real tabs on the dev server, drop a PNG in A and it lists in B without a reload, set aside, shots at 420 and 1200 px (the scratch script is not committed; it needs a dev server whose file watcher has room, see the caveat).

**Caveat found while testing.** `Server/watch.js` is one recursive `fs.watch` on all of `public/` (about 33,000 entries); on Linux that costs one inotify watch each, and two dev servers on one machine can exhaust the shared limit, after which new files are not listed (the drop works, the row never appears). Windows is unaffected. The unit test waits for the real watcher and, if it stays silent, asks `PageFiles` to catch up and says so.

**Names.** The first draft said `trash`; the owner's word in the brief is "set aside", which is what the row says, so the message is `set_aside`.

## Phase 3 as built (2026-10-31)

**What you can do.** Every row in the Files tab has three buttons: Rename, Move and Set aside. Rename turns the row into a name box (Enter asks, Escape cancels). Move opens a small folder browser under the row (click a folder to look inside it, "Move here" picks the one you are looking at). On a desktop you can also drag a row onto a page or folder row. A **file** is renamed or moved at once. A **folder or page** first shows a plan under its row ("1 link in 1 other file will be updated so they keep working", with a few examples), and moves only when you press Rename or Move. After either, the result line has **Undo**. Other tabs follow through the same live list as before (nothing tells them directly). On a static host none of these controls draw.

**The server, four new messages in `Server/plugins/SocketServer/Files.js`** (each answers `{ok: true, …}` or `{ok: false, reason: "a sentence"}`):

| Message | What it does |
|---|---|
| `move_plan(folder_url, name, to_folder_url, to_name)` | A dry run, writes nothing. A rename is the same folder with a new `to_name`. For a folder: `files`, `paths`, `links` (the ones in OTHER files), `outside_files`, `sample` (old to new), maybe a `note`. For a file: just `kind: "file"`. |
| `move_apply(…same…)` | Does it and answers `{manifest, from, to, …}`. A file is a plain `fs.renameSync`. A folder goes through `ModuleMove.apply`. |
| `move_undo(manifest)` | Replays the manifest backwards. Refuses if the thing is no longer where the manifest says (so a second undo is refused) or if a file the move rewrote has changed since. |
| `list_folders(folder_url)` | The folders inside one folder, pages first; the only message that accepts `/`. Feeds the "Move to…" browser. |

**The manifest.** One JSON file per move in `Server/moves/` (committed, they are the undo; the doc's recommended answer to question 4). A folder move's manifest is the one `ModuleMove` writes (every file and every old to new edit with line and column), plus `extra`: the two parents, the names, and whether the old parent had declared the page. A file move's manifest is `{at, kind: "file", from, to, extra}`. The file is written **before** the folder moves, so a crash half-way still leaves the record.

**Refusals (all one sentence, nothing moved):** the name is taken in the target (compared without capitals, as Windows and macOS do); the target is outside `public/` (the url is checked, symlinks resolved); a folder into itself; a name with a slash, a leading dot or a Windows device name; a new folder name that is not letters, digits, `-`, `_` and `.` (a folder is part of a url); `page.js`, `page.jsonl`, `files.jsonl` and `_removed` as source or target; a symlink as source; and **a parent whose `page.js` still names the page in a legacy `children: "a b"` string** (handled by refusing, as designed: nothing rewrites that string; the sentence says which `page.js` and which name). A target parent that lists its children by name and not `auto` gets a `note` in the plan: the moved page is on disk and in its list, but not in its menu until the name is added.

**`ModuleMove.mjs` changes.** (1) `git mv` fails on a folder git does not track (a page made a minute ago, anything git-ignored) and outside a repository: it now falls back to a plain `fs.renameSync` (`relocate()`, recorded as `how` in the manifest). (2) `undo` works out every restored file first and only then writes, so a file that changed since the move stops the undo with nothing half-restored. (3) `summary()` is the count the plan shows. (4) `apply(manifest, extra)` stores the caller's notes.

**The parents' lists.** After a move the two parents' lists are brought up to date by the server itself (`Files.catch_up`: `PageFiles.settle_folder`, then `Tail.changed` for each log), instead of waiting for the file watcher. The watcher still runs and finds nothing left to write. This is deliberate: the design said to verify that the watcher reports both parents; on Linux it can silently run out of watches (the machine this was built on had none left), and a rename that does not show in the tab looks like a failed one. When the old parent had declared the page (a `{"file":"kid/page.jsonl"}` line in its `page.jsonl`, which is what `+ Page` writes), the move also appends the `gone` line there and the `file` line in the new parent, through `Subpages`' own append. Undo does the reverse.

**What a move does not rewrite (said plainly).** `ModuleMove` reads code, css, html and markdown under `public/`, `Server/`, `Servex/` and `.claude/`. A link written inside a `.jsonl` record (a note in some page's `page.jsonl` that mentions `/notes/trip/`) is history and is not rewritten, as before. A file move does not rewrite links to the file either (links to folders are the common case; the plan for a file says so by being short).

**Speed.** The scan reads every code and doc file in the four folders: about 1.4 s on this repo, run twice (plan, then apply), and it blocks the dev server while it runs. The tab shows "Working…". If it ever hurts, run `ModuleMove` in a child process (`node Server/ModuleMove.mjs … --json`); not needed yet.

**Not built.** The "tree" of the doc is a folder browser (click in, "Up"), not an expandable tree: it works at 420 px and needs no tree component. Dragging a row onto a folder row works on a desktop only (touch has no HTML5 drag; the Move button is the touch path). Moving a row out of `_removed/` (restore) is not offered in the tab. D9's `file:` field and `move_to` (an embedded item becoming a page) are not part of this phase.

**Tests.** `node Server/plugins/SocketServer/Files.move.test.mjs`: real ws server, real folders under git-ignored `public/data/` (so `git mv` really fails and the fallback really runs), the real `PageFiles` watcher, and the real `ModuleMove`. Rename a file; rename a page and its links change; the dry run changes nothing; move a page into another and both parents' lists are right; undo restores every byte; a clash, a path outside `public/`, a legacy children string and a changed file all refuse. Browser: three real tabs on a scratch tree (rename, picker, drag, undo, clash, file rename; the other tabs follow), shots at 420 and 1200 px; the script is not committed.
