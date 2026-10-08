# Land the UI and UX pages' conversion to System

Load the `minion` skill first, then `code`.

**Work only in the worktree:** `C:\Code\lew42\worktrees\ui-system` (branch
`worktree/ui-system`). Server: http://ui-system.localhost/. Never edit the main tree,
except your own log under
`public/framework/ai/2026-09-30/ui-system/system/ui-ux-land/` in the MAIN tree.

## Background

Someone already converted `public/framework/ui/page.js` and
`public/framework/ux/page.js` from `Doc`/`Page` to the new `System` class
(`core/System/System.js`, committed as `4adf0a6d` on this branch) — but the two files
are sitting **uncommitted** in the worktree right now (`git status --short` in the
worktree shows them modified, not staged). Your job is to check that work is actually
right, fix anything that's off, and land it as its own commit.

Read `core/System/System.js` first (the class both pages now use) so you know what
`omit: "parts"`, the Inbox tab, `notes:`, and the tiles are supposed to do.

## What to check on each page

1. **It loads with zero console errors**, at all four widths.
2. **Every url that worked before still works** — every component's own page
   (`/framework/ui/card/`, `/framework/ui/table/`, …; `/framework/ux/Tree/`, …) and the
   two doc pages `/framework/ux/doc/system/` and `/framework/ux/doc/decisions/` (ux's
   `route()` for "doc" was REMOVED in the uncommitted diff, replaced by `notes:
   "system decisions"` — confirm this still resolves those two urls the `Doc`/`System`
   way, i.e. via `notes_section()`/`declare_note()`. If it doesn't, that's a real bug —
   fix it, don't just note it).
3. **The Overview tab** shows: the wall of components (ui) / wall of classes (ux) —
   same content as before, just via `omit: "parts"` instead of a hand-written `bar()`
   override — then whatever each page's own `content()` writes, then the readme at the
   bottom (via `System`'s own `readme()` — confirm `md.details(...)` wasn't just deleted
   with nothing replacing it; the diff removed the explicit `md.details(import.meta,
   "readme.md", "Readme")` call from both pages' `content()` — that's correct ONLY if
   `System.overview_content()` already appends the readme itself, which it does. Just
   confirm it actually renders — look at the bottom of the Overview tab in your
   screenshot).
4. **The Inbox tab** shows up and doesn't throw, on both pages.
5. **ux's `wall(page)` helper** was changed from `[...page.children]` to
   `[...page.parts()]` — confirm `parts()` (a method on `System`) excludes the Inbox/
   Overview/API/Docs/Files tabs and includes only the real classes (Auth, Wizard,
   Tree, …), so the flaggable wall shows exactly what it showed before, no more, no
   less.

Fix anything wrong. If something needs a change outside `ui/page.js` or `ux/page.js`
(e.g. a real bug in `System.js`), don't fix it — write a `need` line in your log, tell
your parent (`task-mastermind-system-class`), and work around it if you can within your
own fence.

## Prove it

`node Server/layout-check.mjs http://ui-system.localhost/framework/ui/
http://ui-system.localhost/framework/ux/ --widths 400,1200,1920,3440 --bands --out
public/framework/ai/2026-09-30/ui-system/system/ui-ux-land/shots` (from the MAIN tree;
`MSYS_NO_PATHCONV=1` prefix in Git Bash). Read every shot, top to bottom. Also check
zero console errors on `/framework/ui/card/`, `/framework/ux/Tree/`,
`/framework/ux/doc/system/`, `/framework/ux/doc/decisions/`.

## Commit

Exact paths: `ui/page.js ux/page.js` (plus anything else you had to touch to make them
correct, named in your log). One commit. Message: what changed and why ("ui, ux: land
the System conversion — <what you fixed, if anything>"). Don't merge. Tell your parent
when committed: hash, shot paths, anything left open with the reason.
