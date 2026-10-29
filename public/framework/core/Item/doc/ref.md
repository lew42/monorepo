# Ref: a reference that resolves in the browser and in node

**What it is.** `Ref` (`core/Item/Ref.js`, registered as `"Ref"`) is an Item that holds where another item is, never a copy of it. The design is [ids-and-paths.md §6](../../Session/tasks/data-shapes/ids-and-paths.md); this page is what was built (build E of the data-shapes plan, branch `worktree/browser-refs`).

## How a Ref resolves

1. **Replay makes the Ref and nothing more.** Its two fields are `url` (absent for the same file) and `path`, a dotted path from the file's root (`"tasks.ui.tasks.c3"`). Nothing is fetched until it is needed, so line order can never break it.
2. **The root.** Same file: `ref.root()`. Another file: `Item.open(url)`. A folder url opens the record it keeps (`session.jsonl`, else `task.jsonl`, else `page.jsonl`; the dev server's folder listing decides, so no request 404s). `Item.open` keeps **one root per url**: a second caller, from anywhere, gets the same live object (`Store.for` keeps one Store per url, `store.open()` runs once, and `Item.open` returns `store.host` once one is attached). A `{"task": "<folder>"}` child that `Task.open_ref` already opened IS that root.
3. **The target.** `root.get(path)`. On a miss, the path's last part (the id) is looked up through `root.find(id)`, a deep index built on that first miss and rebuilt only after a list changes (`Item.generation`). It is a hidden property, never saved.
4. **Forwards.** A target holding `{moved_to: {url, path}}` was moved to another file. The Ref follows it (at most `Ref.HOPS` = 8, so a loop ends as gone) and writes its new address as one line, so the next load goes straight there.
5. **Gone.** Nothing found: `target` is `null`, `why` names what was looked for, and `RefView` draws a "gone" row. Never silently empty.
6. **Live.** The Ref listens to its target's `"delta"` and to its root's `"read"` (one event per batch of lines a Store replays, `Store.read`), and emits `"target"`. `RefView` redraws on it.

**Node.** `Item.open` fetches the url, so an absolute http url works (the test serves a temp folder). A relative url has no server to ask in node, so it resolves as gone. Servex's item tool keeps resolving `{"task"}` references through `Task.resolver`, as before. A sync node hook for Ref (url → lines, like `Task.resolver`) is small to add when an agent tool first needs a Ref answered; it was left out until then.

## Backlinks, within one file

`Ref.backlinks(root)` is a Map from each path to the same-file Refs that name it, made by one walk and kept until a list changes or a Ref changes its address. It is computed, never written (CLAUDE.md law 7).

- `Ref.shown(item)`: where is this item shown (by its path, or by its id after a move).
- `Ref.repath(item, old_path)`: after a move inside the file, each of those Refs gets `{"set":{"path": <new>}}`, one line per Ref, through its own Store.

**Decided: built by a walk on first ask, not kept up during replay.** Alternative: register each Ref as it is adopted during replay. Same answer, but it must also handle removals and a Ref's own path change; the walk is always right and costs one pass per change. Switch if a file grows to many thousands of items and `shown()` is called per draw.

## Forwards, across files

A move to another file leaves `{moved_to: {url, path}}` at the old place: `Ref.forward(old_item, {url, path})`. No list of referrers is stored in the target's file (that would be a two-file write that can drift). Alternative: stored backlinks per target; wins only if a site-wide "what links here" must be instant, and then node should build it as an index file, as search does.

`Server/TaskDirs.mjs` already leaves a `moved.json` stub `{moved_to}` in a folder whose record moved; a Ref to such a folder does not read that stub yet (a folder ref opens the folder's record, and a moved folder has none). Small to add when a moved folder is first referenced.

## Where it shows

The session page's Chat tab (the tasks box, `core/Session/SessionTasks.js`) lists each child session's open tasks as "child › task" through Refs, eight at first, then "+ N more". It redraws when a child's record reads a line, so a child's change shows in the parent within a frame. Nothing is written: the Refs are in memory, built from the existing Session entries (no session-shape change; that is plan step 4).

Measured on session-e00f55c9 (2026-10-28, worktree server): 100 open child tasks drawn; a title change and a `start` appended to the child's `session.jsonl` reached the parent's row in 7 to 19 ms (headless, three runs). Shots: [the task's doc/](../../Session/tasks/data-shapes/build/browser-refs/doc/).

## Also changed with it

- `Store.open()` runs once per Store (two readers of one file no longer stream it twice).
- `Store.read()` emits `"read"` on its host after a batch, so a view can redraw when a replay changes things without a `"delta"` (Task's replay puts fields directly).
- `Store.address(node, host)`: the dotted path a Ref stores.
- `Item.class_for(lines)` and `Item.root_from(lines)`: `Item.open(url)` on a url nothing else names opens it as what its lines say (a session record is a Session, any other `{assign}` record a Task).
- In the browser, a `{"task": "<folder>"}` child whose folder holds `session.jsonl` counts as a child session (`Task.is_child_session`), as node's `session_resolver` already said.
