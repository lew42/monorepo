# The catalog — every card kind on one page (builder brief)

You are a minion of `task-mastermind-content-modules`. Load the `minion` skill first, then `code`,
`new-page`, `layout`, `css`, `new-css-class`. Read [requirements.md](requirements.md) beside this file —
deliverable 1 and the owner's words are the acceptance test:

> "Pretty much any box on any page is like a content card, whether it's got a background and padding
> or not. So we need to be more careful about what kind of cards we have, whether we're using the right
> one in the right place, and what it looks like, what it does and how it behaves."

Log milestones to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\content-modules\task.jsonl`
with `node .claude/hooks/append.mjs` (no new launch line). Do not commit.

Worktree `C:\Code\lew42\worktrees\page-cards`, dev server `http://localhost:4817/`. Other teams write
here too: `node Server/hold.mjs on "minion-catalog — ux/Content/catalog"` before your batch, `off` after
you have loaded the page.

## Input

Three census files, 101 kinds: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\content-modules\census\{a,b,c}.json`
(schema in `census-requirements.md`). They overlap: the same kind appears under different names in
different files (e.g. "decision card" in A and the AITask decision renderer in C).

## Fence

`public/framework/ux/Content/catalog/**` only (new). Another minion owns `ux/Content/page.js` and has
already declared `catalog` as a child. Never touch anything else. Classes prefixed `ux-content-catalog-`.

## Deliverable — `ux/Content/catalog/page.js` (+ `catalog.json`, `readme.md`, `doc/`)

1. **Merge** the three files into `catalog/catalog.json`: each kind named ONCE (fold same-job entries
   into one kind with every source listed), with `duplicates` naming the folded aliases and the
   still-separate twins. Keep every field; add `family` (one of: surface words · cards · callouts &
   alerts · chips & badges · rows & lists · panels & dialogs · navigation · controls & widgets · AI log blocks · doc blocks).
2. **The page**, built for the overwhelmed newcomer (CLAUDE.md "Presentation"): at the top, one plain
   sentence and three numbers (kinds, kinds with a duplicate, distinct padding rules). Then a wall
   grouped by family: each kind is a small tile that SHOWS it live (run its `render` snippet — rewrite a
   broken one to a working one, or show a clear "not drawable standalone" placeholder with the reason),
   its name, one-line what, padding + bleed as two short labels, used-in count, and a red "duplicate of X"
   mark when it has one. Click a tile → detail below or on expand: sources (linked to the file via the
   site's files view when one exists), every used_in link, notes.
3. A **"where it breaks"** strip near the top: the 5–8 worst duplicate clusters (the same job under
   several names or several paddings), each one line, linking to its tiles.
4. Zero console errors, zero failed requests. Shoot it at 1920 and 390 with `mcp__site__shot`
   (never the owner's tabs); open the pictures and fix what's wrong.

Report: the URL, the three numbers, the shot paths, and anything you could not draw.
