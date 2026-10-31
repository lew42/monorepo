# Files and pages: one system (design, 2026-10-31)

**Status: design, nothing built yet.** Ask (the owner, 2026-10-31, decisions-log): a page is a path, the UI should work like a file explorer (create, move, rename, delete, drop a file in), and items, pages and plain files should feel like one Notion-like system that uses the real file system. This doc says how, using what already exists (law 6). Written for a coder who has not seen the rest.

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
| Create child page | "+ Page" button, type a name | `page_add(parent_url, name, title)` | `Subpages.at(parent).add()` (dry run supported) | folder + `name/page.jsonl` line 1; `{"file":"name/page.jsonl"}` in the parent's `page.jsonl`; `PageFiles` adds the same list line once (it compares first) | Tool yes (`create_page`); socket message **new** |
| Create item | "+ Item" in the page's content | none new: `list.add({…})` | the Item `Store` appends to `page.jsonl` ([Item readme](/framework/core/Item/readme.md)) | one `add()` line (own file/folder per D9 adds a `file` field) | Yes |
| Upload or drop a file | drag from the desktop onto the tab, or "Upload" | `upload(dir, name, base64, {part, of})` | `Files.upload`: writes `.name.part` (dot names are ignored by `PageFiles`), renames to `name` on the last part; refuses an existing name | `{"file":"name"}` in the list, by the watcher | `write` exists but sends a utf8 string, so binary files **need `upload`**; no drop code exists anywhere in `framework/` |
| Rename | click the name, type | `move(from, to)` | `Runtime.move` (atomic `fs.renameSync`; refuses an existing target; replies with the reverse move) | `gone` for the old name, `file` for the new, by the watcher | Yes |
| Move | drag a row onto a folder or page row | file: `move`; page: `move_plan` then `move_apply` (section 5) | `Runtime.move` for a file; `ModuleMove` for a page folder | same two lines in two lists (old parent, new parent) | `move` yes; plan/apply **new** |
| Delete | trash button | `trash(path)` | `Files.trash`: `Subpages.remove` for a page, the same move-aside for a file, into `<parent>/_removed/<name>-<time>/` | `gone` line; `_removed/` appears as a folder | Pages yes (`Subpages.remove`); files **new** |

**Not used: `rpc:rm`.** `Runtime.rm` is `fs.rmSync(recursive)`. The UI never calls it (CLAUDE.md: never destructive; git is the undo). Delete means move aside, always, and "restore" is a move back out of `_removed/`.

**How other tabs see any of it.** Disk changes → `PageFiles` (60 ms debounce) appends a list line → `Tail.js` pushes it → every open Files tab recomputes `PageListing.from(entries)` and redraws, and a new `page.jsonl` child line also redraws the sidebar (`seen.has("file")` in `Reader.changed`). The tab that made the change gets the same push; it never edits its own list by hand. Failures come back as the `{ok:false, reason}` sentence `Runtime.move` already uses and show in the tab, one line, with the step that failed (the framework rule).

## 4. Static hosting (Cloudflare)

Read-only, and it already works: 3,925 `files.jsonl` files are committed, so `Page.listing()` fetches the folder's list from the static site. `Reader.dev` is false off localhost, so `PageListing.live` falls back to one `load()` and nothing tails. The tab hides every control (`if (!Reader.dev)`) and says "Change files on the dev server and commit them." Not listed anywhere: folders `PageFiles` does not cover (dot folders, `node_modules`, session cache folders); they answer "No file list". The list has names only, no sizes or dates (open question 5).

**Later, R2 and a Durable Object** (research [phase-1.md](https://github.com/mikelew42/research) section 15): a Durable Object per page plays the dev server's part: it receives the same messages (`page_add`, `upload`, `move`, `trash`), stores file bytes in R2 under a key like `pages/<page>/<name>`, and appends the same `{"file":…}` lines to the page's log, so the Files tab does not change. What does change is moves: R2 has no rename, so moving a page with many files becomes copy plus delete per key; the research recommends flat ids with a `parent` field in the record for the cloud, and a folder tree only as a derived view. The local folder model stays as the owner asked; the cloud twin chooses its own layout behind the same messages.

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
| **1. Read-only Files tab on every page** (the smallest useful step) | `files/` route + `PageFilesTab` + `PageListing.live` + the `Files · N` link; no writes, so it also works on Cloudflare | about a day | open any page's `files/`, add a file in the editor, the row appears with no reload; static site shows the committed list |
| **2. Create, upload, set aside** | `Files.js` plugin: `page_add`, `upload` (chunked base64), `trash`; "+ Page" button, drag-and-drop zone, trash button; test with a real temp dir and a real ws server | 2 to 3 days | drop a PNG in one tab, it lists in a second tab; trash moves it to `_removed/`; nothing is deleted |
| **3. Rename, move, nest** | `move_plan` / `move_apply` through `ModuleMove` with `Server/moves/` manifests; drag rows in `ux/Tree`; D9 `file:` field and `move_to` so an item can become a page | 3 to 5 days | drag a page into another; the confirm row counts the links; Undo restores; both parents' lists are right |

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
