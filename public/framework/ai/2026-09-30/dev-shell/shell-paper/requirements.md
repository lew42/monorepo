# Minion C: the paper shell (merge 1) and the ☰ drawer at site level (merge 2)

Load the `minion` skill first, then `code`, `css`, `page`.

**Read first:** the owner's words, last section of `public/framework/ai/2026-09-30/dev-shell/owner-words.md`. The agreed design (picture + table) is `public/framework/ai/2026-09-30/dev-shell/design-2.md`; follow it. The "before" screenshots of AI 2 are in this folder: `1920.png`, `1920-drawer.png`, `400.png`, `400-drawer.png`.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\dev-shell` (branch `worktree/dev-shell`). Start its server with `node Server/worktree-up.mjs dev-shell` from the main tree if http://localhost:54678/ does not answer. Commit there by exact path after each merge-sized piece. Never touch the main tree. Set `windowsHide: true` on anything you spawn. Headless Playwright only (global install: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`); never drive the owner's browser.

**Your fence (the only files you may edit):** `public/framework/core/Shell/**`, `public/framework/ext/drawer/drawer.css`, `public/framework/ext/drawer/menu.js`, `public/framework/ext/drawer/readme.md`, `public/framework/ext/drawer/doc/decisions.md`, plus your own notes in this folder. NOT AI 2 (`/framework/ai2/`), not `dev/`, not `ux/Dictate/`, not `framework.css`.

## Merge 1: `paper: true` on core/Shell (commit it on its own)

A shell with `paper: true` is a nine-grid:

```
 .     head   .
 left  main   right
 .     foot   .
```

- The **paper** is `main`: background `var(--surface)`, a 1px `var(--line)` border, a small radius.
- The **well** is the shell's own background, light gray, from the site's tokens (`--tint` or `--wash` over `--surface`; pick the one that reads as the AI 2 header band's gray). The eight cells around the paper, the four empty corners included, are well.
- The header's and footer's text lines up with the paper's left edge, and the sidebars' tops line up with the paper's top edge. This alignment is the whole point: it shows the regions belong to that paper.
- The gaps between the regions and the paper are one small, even gap (use a spacing token from framework.css).
- Without `paper`, the Shell renders exactly as it does today. Check that the 7 existing demos are unchanged at 1920.
- Below 34em it stacks as today, with the paper still white and the well still gray.
- Add **one demo** to `/framework/core/Shell/` (put it first, it is the idea): a white card with a header, left, right and footer around it, and a nested paper shell inside the card, one size smaller (section level). Add one line to the readme and a note in `doc/decisions.md`.

## Merge 2: the ☰ drawer reads as SITE level (commit it on its own)

The problem, visible in `1920-drawer.png`: AI 2's gray header band (the title and its tabs) runs to the drawer's edge, the ☰ button still floats inside that band while the drawer is open, and the drawer's tab row sits level with the page's tab row. So the drawer reads as part of AI 2, not the site.

Do this, in `drawer.css` / `menu.js` only:

1. **While the drawer is open, hide the floating ☰.** The drawer's own ✕ closes it. Nothing of the site's floats in a page's band.
2. **The drawer looks like the site's other sidebar**, the left nav (the "Framework" logo row, the gray filter band under it). Give the drawer's head the same height and the same gray band, so the two site sidebars read as a pair of bookends around the page.
3. **A clear edge between page and drawer**: the same 1px `var(--line)` the left nav uses on its edge, and nothing of the page's band continuing into it.
4. While the drawer is closed, the ☰ may stay where it is, but it must not overlap the page's tabs at 400 or 1920. Measure this (bounding boxes) and write the numbers down.

Nothing else about the drawer changes: it still pushes the page, it never covers it, and it keeps its tabs, routes and phone rail.

## Proof

Shoot `/framework/ai2/` (closed, and `?drawer=ai`) plus `/framework/core/Shell/` at 400 and 1920 from the worktree server. Save them in this folder as `after-*.png`. Report zero console errors. Put the before and after pairs side by side in `result.md` here, with one line each saying what changed.

If a spec line above is wrong once you see it on screen, deviate and say why in one sentence. Stop when both commits are in. Budget: about $4.

