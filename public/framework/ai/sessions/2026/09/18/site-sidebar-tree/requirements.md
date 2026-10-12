# site-sidebar-tree — the site's own left sidebar becomes the tree: persistent, resizable, deep, the desktop shell

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (consume `ux/Tree`; delete the flat list's own code where the tree replaces it). Clear beats brief by far. Prioritize (the tree in the sidebar first, resize second, the workspace note third).
**Length budget:** the sidebar is the sidebar — nothing to explain on screen. Your landing report is one screen with the stability numbers and the before/after shots.

## The owner's words (2026-09-18, 12:30)

> I do think that's the essential kind of desktop, to help fill the horizontal space on my giant 3440 monitor. Persistent left navigation is just a really easy way to have one part of the screen stay and the other part switch — it is essentially vertical tabs. However, using a tree as the navigation provides a lot more flexibility on a deep, multi-level nested system. Hopefully we got the tree working as the navigation. [...] Maybe it's more like predefined workspaces where the tree is a tree of things on a specific page, and when you click one it opens an editor that has a main workspace and a column for a right sidebar for the properties — fixed defined areas, and that right sidebar can be contextual.

## What exists

- `core/Sidebar` (`Sidebar.js`, `Sidebar.css`, `readme.md`, `doc/`) — the framework's main nav: a flat link list in groups (Core, Styles, Extensions …). Read it and its decisions first; measure its width today at 1280 / 1920 / 3440 (`229 / 243 / 274px`, a doc says).
- `ux/Tree` (last night): `new Tree({ nodes, adapt: true })`, `Tree.from(page)` builds rows from a page's `children` recursively, lazily for data-sourced pages; branch rows are links; fold on the chevron; keyboard. Its readme and `doc/decisions.md`.
- `/layouts/shell/` (last night): a sidebar that never moves, resizable 12rem to half the room by its edge, the width remembered with `this.store()`, a top strip at 400 — `public/layouts/shell/Shell.js` has the resize handle and the sticky track; copy the mechanism, do not import the lab.
- The make-the-call rule: decide, build, document the alternative.

## Deliverables

1. **The site sidebar renders the tree.** `core/Sidebar` builds its rows with `Tree.from(<the root page>)` in `adapt: true` mode (the path you are on, its siblings and its children; everything else folded) so the whole site is reachable five levels deep without the list getting long; the groups the sidebar shows today (Core, Styles, Extensions …) stay as the first level. The current page's row is marked as it is today. Nothing about routing changes. Delete the list-building code the tree replaces; report lines removed.
2. **Persistent and resizable.** The sidebar is sticky in a full-height track (it never moves when the page beside it scrolls or changes — prove with the nav-stability measurement across five page switches at 1280 / 1920 / 3440: its x, width and first five rows' y, 0px change), resizable by its right edge between 12rem and half the room, the width remembered under one store key, double-click resets. At 3440 the default width may be larger than today's 274px — decide a default that reads well (the shell lab used 18rem) and say why. At 400 keep whatever the sidebar does today (measure and say).
3. **The workspace note** — not built, decided: in `core/Sidebar/doc/decisions.md`, one dated section: the owner's "predefined workspaces" (tree of things on a page → main area + contextual right sidebar) is what Make already is (`/imagine/paging/make/`: tree · page · settings, selection-driven) and what the shell lab shows; the site-wide shape is sidebar tree + page; a page that wants a right properties column opts in the way Make does. Two sentences on the alternative (nested columns per sub page) and when it wins.
4. **Docs:** `core/Sidebar/readme.md` (Use: the tree, adapt, resize; Watch out: the store key, the 400 form), `doc/decisions.md`.

## Rules

- Load `code`, `layout` (the shell is two regions; the sidebar is a rail — `em` widths belong to a rail; the box rule), `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-18/site-sidebar-tree/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you. Write your choices as `decision` lines.
- **Fence:** `public/framework/core/Sidebar/**`, your task dir. Nothing else — not `ux/Tree` (log what it lacks), not `core/Page` (another minion is in it right now), not `/layouts/shell/`.
- ⚠ The sidebar is on every page of the owner's live site (port 80 is running; never touch it; LiveReload pushes your edits to the owner's tabs): make each edit in ONE write and load a page headless within a minute on your own server (`PORT=8118 node server.js` from the repo root, background, killed by its real Windows PID when you land). Never `git stash`, never `find /`, never drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here — drop the slash.
- Crawl 20 pages across the site at 400 / 1280 / 1920 / 3440 after: zero console errors, the current page marked, every first-level group present. Two numbers that must agree: first-level rows before and after.
- Landing: `outcome` = a headline, the stability numbers, before/after shots at 1920 and 3440, lines removed, the default width and why, the links, what was left and why. One screen.
