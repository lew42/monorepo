# editor-select — one selection scheme over Make's middle, one right sidebar that shows only the selected thing, Panel's floating bar gone, Make's tree on ux/Tree

Load the `minion` skill first. Then this brief, then `ai/2026-09-17/paging-fix/editor-notes.md` (one screen — the shape to build, from a minion who read all three editors tonight).

**Three laws.** Less is more (delete the bar; fewer controls on screen, never more). Clear beats brief by far (a control on screen is about the selected thing, or it is not on screen). Prioritize (selection first, the filtered sidebar second, the tree third, the deletion last).
**Length budget:** Make stays three panes; the sidebar shows a page's, a block's or an element's few rows and nothing else. Your landing report is one screen with the control counts before and after.
**The reader is the overwhelmed newcomer.** Every button, every item, every part — perfectly clear what clicks do.

## The owner's words (2026-09-17, 22:40)

> Look at the playground and panel exts. They were an attempt to make an editor. We have pages CRUD from some of the last work. Maybe we can merge some of these together. The problem is neither the panel nor playground system did a great job manipulating the elements in a simple intuitive way. The number of controls in the toolbar became way too many. Maybe we put everything in the right sidebar, and only have a selection scheme?

And 2026-09-13, of Make: "self-evident demos that are impossible to misunderstand. every button, every item, every part — perfectly clear what goes where, what does what, what clicks do."

## What exists (the notes say it; the numbers)

- `ext/Panel` (3,899 lines): a floating bar down to four buttons, and a right rail (`properties.js`, ~54 rows) that fills from three document events (`panel-focus`, `panel-text`, `panel-item`) — the right shape, but the rail shows every word at once and the selected thing has no name.
- `ext/Panel/playground/`: the shell — a left rail of saved documents, `+`, the url carries the document, the drawer docked open.
- `/imagine/paging/make/` (1,508 lines): tree · page · settings, one write seam `apply()` that rebuilds the tree and writes the smallest set of files; selection only in the tree; its tree is its own 343 lines (no fold).
- `ux/Tree` (merged tonight): `new Tree({ nodes, drag: true, adapt, acts: "default add remove" })`, one `move({ node, into, index })` event, `Tree.from(page)`; branch rows are links (a cleanup minion is adding that word right now — consume the current API; if a branch row cannot be a link when you land, subclass past it as `/layouts/shell/Shell.js` does).
- `made/` — the owner's pages. Copy the whole dir to your task dir BEFORE touching anything (three of four agents wrote into it by accident on 2026-09-13) and restore from the copy at landing if a byte differs.

## Deliverables (each ticked against the sentences above at harvest)

1. **One selection scheme.** In Make's middle pane, click anything — the page, a block, a run of text — and it gets ONE outline and ONE name badge ("page · notes", "block · cards", "text · heading"). Nothing else is ever outlined; the tree mirrors the selection (its row highlights; clicking a tree row selects the page in the middle). Build it on Panel's `panel-focus` contract (a document event carrying the target or `null`) and Panel's focus ring — reuse, do not fork. Escape clears; clicking empty ground clears.
2. **One right sidebar, filtered.** The right pane shows only what the selected thing can take: a page → title, description, icon, the realm's seven words as the one labelled bar, delete; a block → its kind, its one or two words, where it sits (up / down / out); an element → tone, size, align, and nothing about its parents; nothing selected → one line saying "select something on the page". Rows come from Make's `settings_pane()` groups and Panel's `properties.js` rows, filtered by the selection. Every row's consequence is visible in the middle within a frame. Count the rows on screen for each selection kind before and after (the notes' one number: a page about one word showed nine controls and now shows one).
3. **Make's tree on `ux/Tree`.** Replace Make's own tree with `new Tree({ nodes, drag: true, acts: "default add remove" })`, its `move` event feeding Make's `apply()` (the edge model is the same one Make had — it came from Make). The tree folds now. Report lines removed.
4. **Delete Panel's floating bar** (`ext/Panel/toolbar.js` and its css): split-into-columns and split-into-rows become two rows in the sidebar when a panel is selected; close is the sidebar's delete row. Fold the playground's document rail into Make's tree (the playground's saved documents appear as a group in the tree; the playground page becomes a redirect line or a thin wrapper — decide and say). Count every remaining `ext/Panel` consumer with `rg "ext/Panel" public --glob "*.js"` and load each after; nothing else about Panel changes.
5. **Docs:** `make/readme.md` (Use: click a thing, the sidebar follows), `make/doc/decisions.md` (the record: the events reused, the rows per selection kind, what Panel lost, the alternative — a floating bar per selection — and why not), `ext/Panel/readme.md` (the bar is gone; the rail is the editor's), the paging hub's Make card if its line changed.

## Rules

- Load `code`, `layout`, `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/editor-select/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you. Write each choice between alternatives as a `decision` line (the verb exists; `ext/JSONL/doc/task-jsonl.md`).
- **Fence:** `public/imagine/paging/make/**`, `public/framework/ext/Panel/**`, your task dir. Nothing else — not `ux/Tree`, not core, not the rest of `/imagine/paging/` (a critic finished it tonight), and NEVER `public/imagine/paging/made/**` except through Make's own seam in a test you restore.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8114 node server.js` from the repo root, in the background; kill it by its real Windows PID when you land. `ui-test` has the headless recipe: prove select → sidebar → change → middle updates, for a page, a block and an element (three shots), and a tree drag through `ux/Tree` reaching `apply()`.
- Demos never persist except through Make's seam (it is an editor; a write shows a dot, not an alert).
- Two numbers that must agree: rows in the sidebar for a selection kind and the count you report; `ext/Panel` consumers before and after.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline, the links (Make, Panel), the three shots, the control counts before → after, lines removed, the decision lines, what was left and why. One screen.
