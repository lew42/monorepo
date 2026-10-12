# tree-component — one tree, merged from the three that exist: expandable, adaptive as you drill down, the basis of page drag-and-drop

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one component, the others become consumers or go). Clear beats brief by far. Prioritize (the merge first, the adaptive drill-down second, the docs third).
**Length budget:** the module page is one screen: the tree, live, with a five-level demo you can drag; your landing report is one screen with the comparison table and the links.
**The reader is the overwhelmed newcomer.** Shown, not told.

## The owner's words (2026-09-17, 23:20)

> Search the framework for a tree UI component. We want a tree UI component to be the basis of the page interaction drag and drop. So compare those if they're two separate ones and we want to merge that together so that we can render a tree of navigation links. But they should be expandable and collapsible. Maybe the tree should adapt so that as you drill down in the tree, each selection changes the visibility in terms of siblings and how deep and whatnot. Getting that right, I think, is going to take a little practice.

## What exists (compare these first — a table in your log: rows, expand/collapse, keyboard, drag, selection, data source, lines)

- `public/framework/ux/Tree/` — the class (`Tree.js`, `TreeDrag.js`, `TreeKeys.js`, `drag/`, `readme.md`, `doc/`): graduated from `ui/tree` on 2026-08-21 because it holds row state and selection.
- `public/framework/ui/tree/` — the template (`tree.js`, markup + css, `ui-tree-*` classes) the class still wears.
- `/imagine/paging/make/` — the page CMS's tree (read its `page.js` and the tree part): drag by grip with the EDGE model (top third = above, middle = inside, bottom = below), a star for the default child, + and × on the row, writes through one seam (`made.js`); built on `ext/Draggable`. Read-only for you.
- `core/Sidebar` (the framework's main nav) and `demo.tree()` (`ext/demo`) — say whether either is a tree or a list, and whether it should consume the merged one later (a proposal line, not an edit).

## Deliverables (each ticked against the sentences above at harvest)

1. **The comparison**, as a table in your log and one click down on the module page: what each of the three does, in the columns above. Then the decision (write it as a `decision` line if the verb exists in `ext/JSONL` by the time you land — a sibling is adding it tonight; otherwise a `log` line with the options and the one chosen): the merged tree lives in `ux/Tree`; `ui/tree` stays the markup it wears; Make's tree becomes a consumer in a later task. State the alternative (Make's tree as the base) and its caveat.
2. **The merge into `ux/Tree`** — additive, its current public API keeps working (grep its consumers with `rg "ux/Tree" public --glob "*.js"` and load each after): expand and collapse on every row (a chevron, the keyboard's arrows already in `TreeKeys.js`); **drag-and-drop with Make's edge model** (above / inside / below by pointer third, a visible insertion line, `ext/Draggable`; it emits ONE event `move({ node, into, index })` — the consumer decides what that means: Make will move a page, the shell lab will re-order links; the tree itself never persists); a `default` mark on a row (the star); optional `+` / `×` affordances the consumer turns on.
3. **Adaptive drill-down** — the owner's "each selection changes what you see": a mode (`adapt: true`) in which selecting a row keeps its ancestors, its siblings and its children visible and folds everything else — the tree shows the path you are on plus one level around it, so a five-level tree reads as a short list at every depth. Prove it with the five-level demo: at depth 4 with `adapt` on, count visible rows before and after (a number in the log). Off by default; the owner said getting this right takes practice, so make the mode obvious to change.
4. **Render a tree of navigation links from a `Page`**: `Tree.from(page)` (or the seam you choose) builds rows from `page.children` (a Map) recursively, each row an `<a href>` to the child's url, lazily for a data-sourced page (`children` may be a function now — `core/Page/doc/data-children.md`). The module page shows it on the module's own subtree.
5. **Docs:** `ux/Tree/readme.md` (Use: the three calls; Watch out: the edge model, adapt, the one event), `doc/decisions.md` the record; the module page one screen: the live tree first.

## Rules

- Load `code` (parts as static subclasses; every method a seam), `layout`, `css`, `new-css-class` (`ui-tree-` is the template's prefix; the class's own prefix is what `css-scopes.txt` says — read it); `new-task` before the first edit (your dir exists: `ai/2026-09-17/tree-component/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/ux/Tree/**`, `public/framework/ui/tree/**` (docs and the markup only if the merged class needs one more hook), your task dir. Nothing else — not Make, not core/Sidebar, not ext/Draggable (consume it; if it lacks something, say so in the log with the lines).
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8107 node server.js` from the repo root, in the background; kill it by PID when you land. `ui-test` has the headless recipe: prove the drag (above / inside / below, three shots), the fold, and `adapt` at depth 4.
- Two numbers that must agree: rows rendered from a page subtree and pages in that subtree.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline, the comparison table's verdict line, the links (the module page, the doc), the three drag shots, the adapt count, what was left and why. One screen.
