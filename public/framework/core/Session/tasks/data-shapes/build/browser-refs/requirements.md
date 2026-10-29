# Build E: a link to an item in another file works in the browser (not merged)

**Why, in plain words:** a session can point at an item that lives in another file, such as a child session or a task folder. Today only node can follow that pointer (`Task.resolver`, `core/Task/Task.js:454-461`); the browser shows a "loading" stub. The owner wants a task's subtasks to move into the child session while the parent still shows them (asks 35 and 36). So the browser must follow these pointers, and they must keep working when the child renames or moves its tasks. This is needed before plan step 4.

Terms: a **reference** is the pointer; a **backlink** is the reverse list of who points at an item; a **forward** is a note left at an old place saying where the item went.

Read: [../../ids-and-paths.md](../../ids-and-paths.md) §6 (references: absolute, backlinks computed in memory, forwards across files), [../plan-review/review.md](../plan-review/review.md) finding 8 (an id fallback across files), and [../../placement.md](../../placement.md) §5.

## Setup

`git worktree add C:/Code/lew42/worktrees/browser-refs -b worktree/browser-refs integration/data-shapes`, then lock it. Start its dev server through Servex and log the url.

## Scope

1. **The browser resolves a reference to another file:** `Item.open(url)`, one root per url (`Store.for`), then `get(path)`. It's lazy, on first draw or read; it stays live through the same tail; a missing target draws a visible "gone" row. The node path keeps working.
2. **An id fallback:** when the path misses, look the last part (the id) up in the target file's root through an index built on the first miss and never saved.
3. **Backlinks in memory, within one file:** the root keeps a Map from each target to the refs pointing at it, built during replay. Use it to show "where is this shown", and to re-path refs on a move, one line per ref.
4. **A forward on a move across files:** `{moved_to: {url, path}}` at the old place, followed by old refs.
5. **Show it:** on a real session page, a child session's task drawn in the parent as session › task, live, through a reference. A headless screenshot at 1920 and 400.
6. **Tests** for each of the four, through a real Store and real files.

## Fences

- **No session-shape change** (that's plan step 4). The existing `{"task": "<folder>"}` entries and the child-session refs are what you make resolve.
- **Don't merge.** Don't restart Servex or the main dev server.
- **When done:** run `node Server/review.mjs <this task dir> <worktree>`, answer every finding, and land with the branch, url, screenshots, tests and review phrase.
- **Budget:** about $45. Spawn no one but the reviewer. **Finish by about 21:15.**
