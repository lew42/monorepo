# Ref: a reference that resolves in the browser and in node

**What it is.** `Ref` (`core/Item/Ref.js`, registered as `"Ref"`) is an Item that holds where another item is, never a copy of it. The design is [ids-and-paths.md §6](../../Session/tasks/data-shapes/ids-and-paths.md); this page is what was built (build E of the data-shapes plan, branch `worktree/browser-refs`).

## How a Ref resolves

1. **Replay makes the Ref and nothing more.** Its two fields are `url` (absent for the same file) and `path`, a dotted path from the file's root (`"tasks.ui.tasks.c3"`). Nothing is fetched until it is needed, so line order can never break it.
2. **The root.** Same file: `ref.root()`. Another file: `Item.open(url)`. A folder url opens the record it keeps (`session.jsonl`, else `task.jsonl`, else `page.jsonl`; the dev server's folder listing decides, so no request 404s). `Item.open` keeps **one root per url**: a second caller, from anywhere, gets the same live object (`Store.for` keeps one Store per url, `store.open()` runs once, and `Item.open` returns `store.host` once one is attached). A `{"task": "<folder>"}` child that `Task.open_ref` already opened IS that root.
3. **The target.** `root.get(path)`. On a miss, the path's last part (the id) is looked up through `root.find(id)`, a deep index built on that first miss and rebuilt only after a list changes (`Item.generation`). It is a hidden property, never saved.
4. **Forwards.** A target holding `{moved_to: {url, path}}` was moved to another file. The Ref follows it (at most `Ref.HOPS` = 8, so a loop ends as gone) and writes its new address as one line, so the next load goes straight there. A forward that leads back to the item it is on means it has arrived (a handoff's reference child, below); a forward that points at itself by mistake is read the same way, not as an error.
5. **Gone.** Nothing found: `target` is `null`, `why` names what was looked for, and `RefView` draws a "gone" row. Never silently empty.
6. **Live.** The Ref listens to its target's `"delta"` and to its root's `"read"` (one event per batch of lines a Store replays, `Store.read`), and emits `"target"`. `RefView` redraws on it.

**Node.** `Item.open` fetches the url, so an absolute http url works (the test serves a temp folder). A relative url has no server to ask in node, so it resolves as gone, unless the item tool already keeps that file live (in Servex): then `Item.open` finds its Store and returns that live root, one object with the tool's (measured, data-shapes integration 2, check 5). If the tool's live-root cap (1,000 files) drops that url, a Ref already resolved keeps the old root and goes stale until its next `resolve()`, which joins the new one. Servex's item tool keeps resolving `{"task"}` references through `Task.resolver`, as before. A sync node hook for Ref (url → lines, like `Task.resolver`) is small to add when an agent tool first needs a Ref answered; it was left out until then.

## Backlinks, within one file

`Ref.backlinks(root)` is a Map from each path to the same-file Refs that name it, made by one walk and kept until a list changes or a Ref changes its address. It is computed, never written (CLAUDE.md law 7).

- `Ref.shown(item)`: where is this item shown (by its path, or by its id after a move).
- `Ref.repath(item, old_path)`: after a move inside the file, each of those Refs gets `{"set":{"path": <new>}}`, one line per Ref, through its own Store.
- **Called by every move to another list:** `List.move` asks `Item.moving` (set by Ref.js) for the old path before and calls `Ref.repath` after, so a drag, the item tool's `move` or a `move` line all re-path. Not on replay (the file already holds those lines), and only while Ref.js is loaded. A reorder inside one list does not change a path, so it does nothing.

**Decided: built by a walk on first ask, not kept up during replay.** Alternative: register each Ref as it is adopted during replay. Same answer, but it must also handle removals and a Ref's own path change; the walk is always right and costs one pass per change. Switch if a file grows to many thousands of items and `shown()` is called per draw.

## Forwards, across files

A move to another file leaves `{moved_to: {url, path}}` at the old place: `item.move_to({url, path})`, the one move verb (`item.move_to(list)` is a move inside the file, which re-paths the Refs that named the old path). No list of referrers is stored in the target's file (that would be a two-file write that can drift). Alternative: stored backlinks per target; wins only if a site-wide "what links here" must be instant, and then node should build it as an index file, as search does.

`move_to({url, path})` writes the forward only: the lines themselves are carried by the file mover (node), so "move, re-path, forward" is one call only inside a file (`move_to(list)`). **The handoff writes one.** `move_item` (`Servex/agents/page_tools.js`: the item tool's `move` key and `spawn_agent`'s `task: {from, id}`) writes the reference `{task, as}`, then the forward `move_to` answers, as `{"tasks": {"<id>": {"moved_to": {url, path: ""}}}}` (under `tasks`, because a bare `{"<id>": …}` line keeps only Task's FIELDS). So a parent's Ref to a handed-off task (SessionTasks' child rows) follows it to the new folder's root and takes that address. In the browser the reference child *is* that root (Task.open_ref loads the new file into it), so the forward leads back to the same object: `settle` reads that as arrival, not a loop. `Server/TaskDirs.mjs` moves whole folders and leaves its own stub instead (next paragraph).

`Server/TaskDirs.mjs` already leaves a `moved.json` stub `{moved_to}` in a folder whose record moved; a Ref to such a folder does not read that stub yet (a folder ref opens the folder's record, and a moved folder has none). Small to add when a moved folder is first referenced.

## Made by `List.ref()` and `Chat.resurface`

**`list.ref(x)` (`core/List/List.js`, chat-model step 2, `persistence-sync/design/fixes.md` "Adding an item that already has a parent", F7): links an item any list already holds, instead of moving it.** Same file: `{path}` (`Item.Store.address(x, x.root())`); another file: `{url: x.root().store.url, path}`. It builds that Ref and `add()`s it — so it answers the new Ref, never `x` itself. The one way to really move an item is still `item.move_to(dest)` (above).

**`list.add(x)` makes that same Ref on its own (flipped 2026-11-09, the owner's sign-off, under "make the best decision… as long as it's not destructive"): when `x` is a live Item already parented to a List other than this one, `add(x)` returns `this.ref(x)` instead of re-parenting it.** `ref()` stays the explicit, equivalent call. Unchanged: an item with no parent yet, an item already in this same list, a plain object (so replay — which always hands `add()` plain JSON, never a live Item — never turns a line into a Ref), and `move_to(dest)` (it reaches `List.move` directly, never `add()`, so it still really moves).

Superseded: the 2026-11-02 rewording below, kept as history — it reverted the original F7 build because the owner had not signed off and no census had been checked; both are now done.

**Reworded 2026-11-02 (vscode-mastermind; CLAUDE.md "ask before" a core API's meaning changes): `list.add(x)`'s OWN default is unchanged.** The original F7 plan had `add()` itself switch to a Ref whenever `x` already belonged to another list — built, then reverted the same day, because that is a change to what every existing caller of `add()` means, and the owner had not signed off on it. `ref()` is the explicit, additive way to get the same Ref today; `add()` keeps re-parenting an owned item exactly as it does on `compliance/dev` (the pre-existing gap: the item's `parent` moves, but the first list still lists it too) until a census of every caller (`public/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/plan.md`, decision 2) is checked against the owner and `add()`'s default is flipped as its own, separate merge.

**`Chat.resurface(message)`** (`core/Session/Chat/Chat.js`, the owner, 2026-11-01): reading an old message again should put it back at the bottom of the conversation, but the log itself is never rewritten — the original line stays exactly where it was said. `resurface` calls `this.ref(message)` to add a same-file Ref at the bottom of `session.messages`, then sets `resurfaced: <the new Ref's id>` on the original, so a view can dim the original or draw an arrow from it to the Ref. Two lines (the Ref's `add`, the original's `set`), but written with no `await` between them: `Store.append` (`core/Item/Store.js`) queues both in the same tick and flushes them in ONE microtask, so they travel in one network write — a crash can only lose both, never leave the Ref without its mark (or vice versa). A true cross-line atomic guarantee (one line, not two) would need `Item.as_call`, which is built for a single item's own, deterministic verb; `resurface` touches two different items (the list and the original message), so it is documented here instead of forced into that shape.

## Where it shows

The session page's Chat tab (the tasks box, `core/Session/SessionTasks.js`) lists each child session's open tasks as "child › task" through Refs, eight at first, then "+ N more". One heading per child session ("child ›"), its tasks under it, so a long child title is said once. It redraws when a child's record reads a line, so a child's change shows in the parent within a frame; a Ref emits `"target"` only when its target, title or state changed, so a read that touched nothing shown redraws nothing.

Two things to know. A child's Refs are drawn only after the child's own row has opened its file (`Task.open_ref`): a Ref opening it first made a second root for that url and left the row a snapshot, seen on a slow load (2026-10-28). And here the Ref resolves back to the child row's own live object (`Item.open` answers `store.host`), so on this page it proves the wiring, not that a Ref alone keeps a row live; that standalone path is what `Ref.test.mjs` covers (one load, no tail). Nothing is written: the Refs are in memory, built from the existing Session entries (no session-shape change; that is plan step 4).

Measured on session-e00f55c9 (2026-10-28, worktree server): 100 open child tasks drawn; a title change and a `start` appended to the child's `session.jsonl` reached the parent's row in 7 to 19 ms (headless, three runs), and 4 to 5 ms after the review's changes. Shots: [the task's doc/](../../Session/tasks/data-shapes/build/browser-refs/doc/).

## Also changed with it

- `Store.open()` runs once per Store (two readers of one file no longer stream it twice); a failed open is not kept, so the next open tries again (`Item.open` likewise).
- `Store.read()` emits `"read"` on its host after a batch, so a view can redraw when a replay changes things without a `"delta"` (Task's replay puts fields directly).
- `Store.address(node, host)`: the dotted path a Ref stores.
- `Item.class_for(lines)` and `Item.root_from(lines)`: `Item.open(url)` on a url nothing else names opens it as what its lines say (a session record is a Session, any other `{assign}` record a Task).
- In the browser, a `{"task": "<folder>"}` child whose folder holds `session.jsonl` counts as a child session (`Task.is_child_session`), as node's `session_resolver` already said.
