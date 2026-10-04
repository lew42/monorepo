# Minion brief: restructure `core/Page/ext/Inbox` into parts-as-statics

You are a minion. Load the `minion` skill first, then `code` (the parts-as-statics pattern this
is fixing) and `documentation`. Fence: `public/framework/core/Page/ext/Inbox/` plus the handful
of files that import from it (`public/framework/ai2/rail.js`, `public/framework/ext/drawer/`
wherever it imports `DrawerInbox`/`Inbox` from here — grep first). Do not touch
`public/framework/ext/panel2/` (a sibling minion's work) or `public/framework/ai/page.js`/
`overview.js` (a later minion's work, once this lands).

Task directory: `public/framework/ai/2026-10-02/panel2-sessions/` (parent task — read its
`task.jsonl` and `requirements.md` first).

## The ask, verbatim (the owner, via the VS Code mastermind, mid-task 2026-10-02)

> core/Page/ext/Inbox breaks the parts-as-statics pattern (code/patterns). Today it has TWO
> unrelated classes:
> - Inbox.js exports `DrawerInbox` (aliased `Inbox`): the drawer's page-notes inbox.
> - Rail.js has `InboxRail`, which ai2/rail.js extends as AIRail. Neither is reachable from the
>   other. ai2/rail.js also names `InboxRail.prototype` `store`, which is a misleading name.
>
> Restructure:
> 1. One `class Inbox` (the data: items, filters, the floor, read/archive), with its views as
>    statics: `static Rail` (today's InboxRail) and `static Compact` (the drawer's and
>    Overview's small view, merging DrawerInbox). AIRail extends `Inbox.Rail`.
> 2. Name properties after their class in lowercase. An instance draws through `inbox.rail` and
>    `inbox.compact`, made lazily. No `inbox_rail`-style names.
> 3. Keep `InboxRail` and `DrawerInbox` as re-exports for one release, and update the readme's
>    Architecture block.
> 4. Check the drawer's inbox, /framework/ai/ and /framework/ai2/ still work (screenshots at
>    400 and 1920).

## Before you start

- Read `Inbox.js`, `Rail.js`, `servex.js` and `readme.md` in `core/Page/ext/Inbox/` whole.
- Read `ai2/rail.js` whole — it's the one place `InboxRail` is subclassed (`AIRail`) and the
  `store` name lives; find every other caller of `InboxRail`/`DrawerInbox`/`Inbox` from this
  folder with a repo-wide grep before you start moving code, so nothing breaks silently.
- This module is claimed by `task-mastermind-panel2-sessions` for this change; a note is already
  on `/framework/core/Page/ext/`'s page inbox telling `@task-mastermind-inbox-ext` (who owns
  `/framework/ai/`'s tabs and wiring) what's coming, in case it's mid-edit on the same files —
  if you hit an unexpected conflict when you pull, stop and report rather than force through it.

## What "done" looks like

1. One `class Inbox` in `Inbox.js` (or wherever makes sense — you decide the file layout, but
   keep the folder small) holding the data: the items, the filters (e.g. the floor/min-score
   used today), read/archive state and methods.
2. `static Rail` on it is today's `InboxRail` class (moved from `Rail.js`, or `Rail.js` now just
   defines `Inbox.Rail = class extends ... {}` — your call, document the choice). `static Compact`
   is a NEW small class merging today's `DrawerInbox` (the page-notes drawer inbox) with what a
   tiny Overview-dashboard card needs: it should take a `{ page }` (same as `InboxRail`) and
   optionally render smaller/denser — the exact visual is a later minion's job (it builds the
   Overview grid on top of `Inbox.Compact`), your job is making the CLASS correct and reusable,
   with a sensible minimal render so it isn't inert.
3. An instance is `new Inbox({ page })` (match `InboxRail`'s existing constructor shape so
   callers barely change); `inbox.rail` and `inbox.compact` are the two views, each created
   lazily on first access (a getter that mounts/caches, not built in the constructor).
4. `AIRail` (`ai2/rail.js`) extends `Inbox.Rail`, not a standalone `InboxRail`. Rename its
   `store` property to something that names what it actually is (read the code to find the
   right word — likely something like `data` or `items`, matching step 2's "name properties
   after their class in lowercase" rule generally, i.e. no more misleading names).
5. `InboxRail` and `DrawerInbox` stay as one-release re-exports (`export const InboxRail =
   Inbox.Rail;` etc.) so every existing import keeps working without edits elsewhere — but also
   actually re-point the real callers (ai2/rail.js, the drawer) to the new names, since this is
   the task doing that migration, not leaving it for later.
6. Update `core/Page/ext/Inbox/readme.md`'s Architecture description (and any other readme that
   describes the two-class shape) to describe the one-class, two-statics shape, with the
   deprecation note about the re-exports.
7. Verify: the drawer's page-notes inbox, `/framework/ai/` and `/framework/ai2/` all still work.
   Take screenshots at 400 and 1920 of at least one page from each (the drawer open on any page,
   `/framework/ai/`'s Inbox tab, `/framework/ai2/`) and look at them yourself before reporting —
   `node Server/layout-check.mjs <urls> --widths 400,1920`.

## Rules

- No build step; resolve urls against `import.meta`; CSS rules stay in their layer if you touch
  any (you likely won't — this is a JS restructure).
- Work in the worktree `C:\Code\lew42\worktrees\panel2-sessions`. Commit as you go.
- Report back to `task-mastermind-panel2-sessions` when done: what changed, the screenshot
  results, and anything you found that the owner's four numbered points didn't anticipate.
