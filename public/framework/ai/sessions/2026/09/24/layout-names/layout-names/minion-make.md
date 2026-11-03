# Minion B — Make's leftovers

Load the `minion` skill first. Your task mastermind is `task-mastermind-layout-names`.

## The owner's words (the acceptance test)

> Make's leftovers. The Description field shows nowhere on screen, and drag has no keyboard path. Give the description a place under the title, and add arrow-key reordering to the tree.

## Where you work

The worktree **`C:\Code\lew42\worktrees\layout-names`** (branch `worktree/layout-names`), served at **http://127.0.0.1:52651/**. Edit ONLY there — never `C:\Code\lew42\monorepo`. Commit in the worktree when done (the co-author line from your system reminder). Never push. A sibling minion commits in the same worktree on other files: `git add` only your own paths.

## Found first — fix it before anything else

`http://127.0.0.1:52651/imagine/paging/make/` (and the live site) shows **"Page Load Error — Cannot read properties of undefined (reading 'rc')"** on a direct load at 1920. Find the cause. If it is inside `public/imagine/paging/make/`, fix it. If it is outside your fence (core, ext, ui), do NOT edit it — end your turn early and say exactly which file and line, so your mastermind can route it.

## Deliverables

1. **Make loads** with zero console errors on a cold load of `/imagine/paging/make/` and when opened from `/imagine/paging/`.
2. **The Description shows on screen, under the title.** Today it is a settings field (`settings.js` ~line 63) and is drawn nowhere. Where the made page's title appears in Make's centre view, draw its description as one plain line under it; editing the field updates it live. Reuse existing typography — no new CSS class unless one helps (if one does, run the `new-css-class` skill).
3. **Arrow-key reordering in the tree** (`tree.js`). With a row focused, a modifier + ArrowUp/ArrowDown moves it one place among its siblings (pick Alt+Arrow — the common convention — and say so in a line of help text or a `title`), going through the same `Make.move_to()` path a drag uses, so disk and tree agree. Focus stays on the moved row. Plain arrows keep doing whatever they do today. If Alt+ArrowLeft/Right (outdent/indent) is cheap through the same path, add it; if not, name it as left.
4. **Prove it.** Headless Playwright (the `ui-test` skill; never the owner's tabs): cold load, then focus a row, press Alt+ArrowDown, screenshot; edit the description, screenshot. ⚠ Make writes pages to disk — reorder a row you create for the test and put everything back (or use whatever scratch/demo tree Make offers); "never persist silently" — leave the made tree as you found it. Final shot at **1920×1000** to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\layout-names\after-make.png` (the only file you may write in the main tree).
5. Update `public/imagine/paging/make/readme.md` (a line each, index voice) and the relevant `doc/*.md`.

## Fence

Write: `public/imagine/paging/make/` only (plus the one screenshot above). Nothing else.

## Reply

End your turn with ≤ 10 lines: what changed per deliverable, the commit hash, anything left and why.
