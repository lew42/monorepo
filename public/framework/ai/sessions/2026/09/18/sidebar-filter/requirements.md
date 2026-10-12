# Sidebar filter + one resize helper — the brief

Saved verbatim from the spawning message, 2026-09-18. Source: two merges from the
overlap study (`ai/2026-09-18/overlap-study/overlap.md`, merges 2 and 3, and their
`decision` lines in that task's `task.jsonl`: `overlap-filter-into-sidebar`,
`overlap-shared-resize-grab`).

## The owner's words (2026-09-18)

"We need a few core navigation systems working; the left sidebar nav with filters or
toggles or trees — trees are one of the quickest ways to have folders of nested demos,
pages, documentation." And: "take one implementation and merge it into another and use
that new implementation for all the locations."

## Deliverables

1. **`ux/Filter` in the sidebar.** `public/framework/ux/Filter/` (151 lines, used by
   zero pages) becomes the filter box at the top of `core/Sidebar`'s tree: typing
   narrows the tree to rows whose title matches, keeping their ancestors visible;
   clearing restores the fold state the reader had; Escape clears. Read `ux/Filter`'s
   readme and API first — compose it, do not rewrite it; if it lacks a hook the tree
   needs, add the smallest seam to `ux/Filter` and say so. One toggle beside it if
   `ux/Filter` already offers one (e.g. "show all levels" = adapt off) — otherwise
   none; suggestions, not laws. Prove headless on your private server
   (`PORT=8133 node server.js`, background, killed by its real Windows PID): type
   three letters, count visible rows before and after (two numbers), clear, the fold
   state restored; zero console errors at 400 / 1280 / 3440.
2. **One resize helper.** `core/Sidebar`'s `grab()` was copied from
   `/layouts/shell/Shell.js` today; `ext/grip` ("a rail's resize edge — a strip inside
   the edge it drags") already exists. Read all three; make `ext/grip` the one
   implementation both use (extend `ext/grip` if it lacks the min/max/remember/
   double-click-reset behaviour the two copies have), delete the two copies, count the
   lines removed (the study estimated ~30). Prove both rails still resize, remember,
   and reset, headless.
3. **Docs:** `core/Sidebar/readme.md` (the filter line; the grip line),
   `ux/Filter/readme.md` (its first real consumer), `ext/grip/readme.md`,
   `/layouts/shell/` readme one line; dated entries in the three `doc/decisions.md`.

## Fence

`public/framework/core/Sidebar/**`, `public/framework/ux/Filter/**`,
`public/framework/ext/grip/**`, `public/layouts/shell/Shell.js` (the grab replacement
only) and its readme, my task dir. Nothing else — another minion is swapping the
sidebar's CALLERS to `root:` right now (`ai/2026-09-18/tree-fixes`); never touch a
caller file, and expect `ux/Tree` to change under me (consume its current API).

## Never (this task's own reminders)

The owner's dev server on port 80 is running: never touch it; the sidebar is on every
page — one write per file, verify within a minute. Never `git stash`, never `find /`,
never drive the owner's tabs; an `rg` pattern starting with `/` returns nothing here —
drop the slash.

## Final report shape

One screen: the filter's before/after row counts, lines removed by the grip merge,
the links, what was left and why.
