# Build E: references that resolve in the browser (needed before plan step 4), from the integration branch, NOT merged

**Why:** a reference to an item in another file, such as a child session or a task folder, resolves only in node today (`Task.resolver`, `core/Task/Task.js:454-461`), so the browser draws a "loading" stub. The owner's lean (ask 35, fork F2) is that a task's subtasks move into the child session, with the parent showing them in context (ask 36). That needs references that resolve in the browser, and that survive the child renaming or moving its tasks.

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
