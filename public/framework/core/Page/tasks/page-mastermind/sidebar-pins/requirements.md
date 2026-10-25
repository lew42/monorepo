# Sidebar: a "Task queue" link under AI in the site sidebar

**The ask:** the owner (2026-10-24) about [the task queue](/framework/ai/queue/): "there's no link to it". [`queue-page`](../queue-page/) asked for a link under AI in the sidebar.

**Why it is still missing:** the AI page is `leaf: true` on purpose, so the sidebar shows one AI link. Un-leafing it would list all 17 children.

**The change (branch `worktree/sidebar-pins`):**
- A leaf page may name a few children to show anyway: `pinned: "queue"` beside `leaf: true`. `ux/Tree/Tree.js` `node_of()` reads it; `nodes_of(page, names)` loads only those children.
- `core/Sidebar/Sidebar.js` `visible_nodes()` now matches nodes by name instead of by index (a pinned list is a subset of the children). `index()` still walks every child of a leaf page, so the filter box still finds them all.
- `ai/page.js`: one line, `pinned: "queue"`.
- `core/Sidebar/readme.md`: one line.

**Checked:** on `/framework/ai/queue/` the sidebar shows AI ▸ with "Task queue" under it; on `/framework/core/` AI is collapsed with ▸; the filter box finds `/framework/ai/usage/` (not pinned) and `/framework/ai/queue/`; no page errors.
