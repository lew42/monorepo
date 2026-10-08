# Minion B — Page extends Item: `page.pages`, `page.content`, the callers, and the live demo

Load the `minion` skill first, then the `code` and `page` skills.

**The owner's words (2026-10-02):** "Page extends item? I thought we already agreed on that." Approved; build it.
Design: [page-item-design.md](../../../2026-09-30/proposal-flow/page-item-design.md) — **the TOP section ("LATEST … fourth pass") rules**: a list is a PROPERTY, not a parent. `Item = Events(Object)` has no list methods. A Page IS an Item and HAS two lists: `page.pages: LiveList` (its sub-pages) and `page.content: LiveList` (its visible blocks). There's no `get pages()` alias: `pages` IS the LiveList.
Parent brief: [../requirements.md](../requirements.md). Decisions: [../task.jsonl](../task.jsonl) (the fourth pass wins over any older decision).
Minion A built `core/Events/Events.js`, `core/List/List.js` + `LiveList.js`, `core/Item/Item.js` + `Store.js` and `item-core/test.mjs` in the worktree. Read them all first, plus A's `item-core/task.jsonl` for its caveats. Where A's real names differ from this brief, use A's.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\page-extends-item` (branch `worktree/page-extends-item`, server http://localhost:59417/). Commit after each finished piece, by exact path. Never write the main tree except your own task.jsonl.

## Fence
- `core/Page/Log.js`, `core/Page/Page.class.js`; small additive seams in `core/Item/*` and `core/List/LiveList.js` (name each in your log)
- `Page.children` callers, but ONLY where the shim (3) cannot carry them; the `Page.Store`/`store()` rename callers (5); `ai2/card.js` + `ai2/outline.js` (the `items` rename only)
- `ext/filesystem/*` (FsFile, the FsDir → Dir rename, readme, doc/decisions.md) and the FsDir callers `ext/files/explorer.js`, `ext/files/files.js` (11)
- The demo `core/Item/live/` (new), and `core/Item/page.js`'s `children:` to declare it
- Tests and shots in `ai/2026-10-02/page-extends-item/page-on-item/`

**When to reach for which** (use this sentence in any doc you touch): a **List** for plain ordered data; a **LiveList** when something must watch it change; an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a URL.

## Deliverables

1. **`PageLog extends Item`.** The chain becomes `Page extends PageLog extends Item`, so `page instanceof Item` is true.
   - Delete PageLog's own `on`/`emit` so Events' versions are used. Before deleting, grep for anything that reads `page.listeners`.
   - Page's `set` is Item's. PageLog keeps only a thin override: it pushes to `jsonl_lines`, emits `line` once per OUTERMOST line, then calls `super.set(obj)`.
   - `put(key, value)` writes to the instance (`this[key] = value`) and keeps the `unknown` tracking. `get(key)` reads `this[key]`.
   - `bubbles()` returns false, because a page is a boundary.
   - `static new_id()` returns undefined. A page's id is its folder name: `naming()` sets `this.id ??= this.name`.
   - Keep the constructor's `super()` call with no arguments, followed by `assign(...)`.
   - Census page configs that pass `id`, `data`, `pages` or `content` keys, and say what you did with each one.
2. **Composition removes most name clashes, so Page keeps its own methods:** `Page.add(name, child)`, `Page.move(url)`, `open`, `walk` and `find`.
   - Do not rename `move` to `relocate`: reordering sub-pages is `page.pages.move`, so nothing clashes.
   - Only `set` and `store` still clash with Item: `set` is unified in (1), and `store` is moved in (5).
3. **`page.pages: LiveList` replaces the `children` Map as the storage.** Each sub-page's key is its id, which is its folder name.
   - **Stubs.** A sub-page that is declared but not yet loaded sits in `pages` as a stub Page: `{id: name, name, stub: true}`, plus its icon and title when its `file` or `tab` line, or its declaration, gives them. A stub skips `Page.track`, extension setup and `initialize`.
   - **Loading.** When the real page loads (`child()`), it replaces the stub in the same place using LiveList's quiet `replace`. Loading is not a change, so it emits no event and writes no line.
   - **`Page.add(name, child)`** keeps its signature (hundreds of callers) and inserts quietly.
   - **The `children` shim.** `get children()` returns a Map-shaped view over `pages`, so the ~215 existing calls across ~94 files keep working unchanged.
     - Make it `class PageChildren extends Map`, so `instanceof Map` stays true and a page.jsonl line can never set it.
     - `get(name)` returns the page, `null` for a stub, and `undefined` if the name is absent.
     - `set(name, page|null)`: null adds a stub; a page inserts quietly, or replaces quietly if the name exists.
     - `delete` removes quietly.
     - Also support `has`, `forEach((child, name) => …)`, `keys`, `values`, `entries`, `size`, `clear`, and `[Symbol.iterator]` yielding `[name, child]`.
     - Its order is the order of `pages`.
     - `declare()` assigns `this.children = …` for a config `children:` list. That assignment must route through `declare()`.
     - New code and docs say `page.pages`.
   - **Reordering works.** `page.pages.order(["b","a"])`, `page.pages.move("b", {after: null})` and `page.pages.remove("a")` all work, and the rail and tab strip follow the new order.
4. **Store on pages.**
   - `PageLog.Reader extends Item.Store`. Keep the hold-until-line-1 behaviour, `attach` → `report_unknown`, `changed()` → redraw, and `reset()` → `log_forget()`. Its `page` field becomes `host`, with a `page` alias getter.
   - `Page.jsonl(url)` uses `Store.for(url + "page.jsonl")`. A loaded jsonl page's `page.store` is then open.
   - Every LIVE change on that page appends ONE line: a `set`, a verb on `pages` or `content`, or a change in any item below. Lines that are replayed or streamed in never write back.
   - **`page.file(name)`** keeps its line behaviour: the line `{"file": …}` registers the listing.
     - Called from code, it also RETURNS an `FsFile` (from `ext/filesystem`, see 11) for `<folder url> + name`. Its `.store` is `Store.for(that url)`, so there is one Store per file and no second file class.
     - A code call must not add a listing entry. Split the line path from the code path, and say how.
5. **The localStorage helper gives up the name `store`.**
   - Rename `Page.Store` (class PageStore) → `Page.Prefs` (class PagePrefs), and `page.store()` → `page.prefs()`. This frees `page.store` to be the jsonl Store.
   - Update every caller. Afterwards, grep must show zero `new Page.Store(` and zero page `.store()` calls.
   - Callers: ai/v/2/page.js, ai/v/3/page.js, ai/v/3/timeline.js (comment), core/Page/generator/{export,page,specs}.js, core/Search/Omnibox.js, core/Section/page.js, core/Shell/Shell.js, core/Sidebar/Sidebar.js, ext/Saver/LocalStorageSaver.js, styles/system/studies/themes/page.js, imagine/{cms/edit,game,mag/contents,team}/page.js, imagine/paging/{baseline.js,make/made.js,make/page.js}, imagine/platform/topic/{page.js,async/page.js}, layouts/labs/mag/contents/page.js, layouts/shell/{page.js,Shell.js}.
   - Rename core/Page/doc/method/store.md → prefs.md, and fix links to it.
   - Before renaming each `.store()`, check that it really is called on a page.
6. **`page.content: LiveList` of Items.**
   - The legacy content slot (a function, string, address or View) is untouched.
   - **Made lazily.** It is created the first time a content DELTA arrives (a line `{"content": {"add": …}}`, or a code accessor you name) while `this.content` is not a LiveList. Page then makes `this.content = new LiveList({owner: this, name: "content"})` and routes the delta to it. Its events bubble to the page and its store, at path `content/<id>`.
   - **One reusable view.** `render_content()` draws a content LiveList as rows of each item's `view`. The rows are sortable with `ext/Draggable/Sortable` (dynamic import) and are redrawn from the list's own events. This is shared code, not demo-only code.
   - Check the order of `page.content ??= page.log_view` in the jsonl loader, so a content delta is never routed into a method call.
7. **Rename ai2 card's own `items` Map → `outline_items`** (ai2/card.js, 4 sites; ai2/outline.js, 1 site), so no page member is named like a list.
   - Prove that `/framework/ai2/` still draws card outlines.
   - The ai2 `Card extends Page` class stays. The design says a Card is only a look; moving its data into Page is the next task. Log it as a caveat.
8. **Collision census.**
   - Grep every Page subclass and page config for members named like Item's: `get put set locate emit on off bubbles remove root walk find save delete toJSON store view data id pages content`. Search public/, excluding ai/20*, old/ and new/1/.
   - Log what you found and what you did, and fix any that now break.
   - Known: the ai2 card has `type()` and `attach()`, and pages assign `this.view` (Item's `view` has a setter for this).
9. **The demo** at `/framework/core/Item/live/`, declared in `core/Item/page.js` `children:`.
   - **Data.** Rows are saved in `live/demo.jsonl`, committed with ~4 seed lines (the ux/Content `demo.jsonl` convention). They are held in the demo page's own `page.content` (6), with `page.file("demo.jsonl").store` attached to it.
   - **Above the fold:** the rows (drag to reorder with Sortable), and the buttons:
     - **Add**
     - **Sort A→Z**: writes one `order` line.
     - **Reverse**: writes one `order` line.
     - **Reset**: removes the rows and re-adds the seed rows, in one Append call.
   - **Beside the rows:** the last ~8 lines of demo.jsonl, live, so the viewer SEES one line per change.
   - **One sentence:** "Drag, add or sort, then reload: the list comes back. Open this page in a second tab: it follows."
   - The UI listens to the list's own events.
   - **Off localhost,** it loads the file, edits stay in memory, and one muted line says so.
   - Follow the `page` skill: one takeaway, and a layout checked at 400 and 1920.
11. **The file classes in `ext/filesystem` become the file half of the design** (the owner asked; vscode-mastermind decided, 2026-10-02). `FsFile.js` and `FsDir.js` already exist. FsFile has `read`/`write` but no `append`.
   - **Rename `FsDir` → `Dir`** (the owner's word): `Dir.js` holds `class Dir`, and `FsDir.js` stays as a one-line re-export so old imports keep working. Move the 7 importers (`ext/files/explorer.js`, `ext/files/files.js`, `ext/filesystem/{file_link,FsFile,page,tree}.js`) to `Dir`.
   - **Keep `FsFile`.** `File` is the browser's built-in class (uploads, drag and drop), and shadowing it would break those silently.
   - **`FsFile.append(line)`** writes one JSON line through the dev socket's Append RPC, the same route ext/JSONL uses. It is validated: it must be a plain object, and a path that doesn't end in `.jsonl` is refused with a warning. Send it through `this.store.append(line)`, so each file has one writer and its echo skip. It returns false off the dev server.
   - **A lazy `store` getter on a `.jsonl` FsFile** returns `Item.Store.for(this.url)`. A non-jsonl file's store is `undefined`. Then `page.file("x.jsonl").store` from the design is simply an FsFile.
   - **`ext/filesystem/readme.md`**: record the rename and the File-shadowing reason in one line each, with detail in `doc/decisions.md`.
   - Prove it: in node or headless, `FsFile.append` on a `.txt` path is refused, and on the demo's jsonl it writes one line. `/framework/ext/filesystem/` and `/framework/ext/files/` (and any `/fs/` url) load with zero errors.
12. **Prove it** with headless Playwright. Put scratch scripts in the session scratchpad, named `pei-b-*.mjs`.
   - Add → reload → the same list comes back.
   - A drag writes one `move` line.
   - A sort writes one `order` line.
   - A second browser context sees an add within 2 s.
   - `page.pages.order()` on a page.js page reorders its rail.
   - Zero console errors and zero failed module requests on each of: `/framework/core/Item/live/`, `/framework/core/Item/`, `/framework/core/Page/`, `/framework/`, `/framework/ai/`, `/framework/ai2/` plus one ai2 card url, `/framework/core/Page/jsonl/`, `/framework/ext/Panel/`, `/framework/ext/editor/`, `/framework/core/Page/generator/`, `/layouts/shell/`, `/imagine/paging/`.
   - Run A's `test.mjs` again.
   - Screenshot the demo at 400 and 1920 into `page-on-item/shots/`, and look at the shots.

## Rules
- Keep every existing page working. The static site keeps working: Store never writes off localhost.
- Every Node spawn sets `windowsHide: true`. Stop anything you start.
- Log decisions and caveats in your task.jsonl as they happen.
- End your turn with a one-screen summary: files, census result, test results, shots, and anything not done.
