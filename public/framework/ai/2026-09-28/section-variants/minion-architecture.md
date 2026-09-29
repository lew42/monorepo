# Minion brief: who owns the rail (variants E and F)

Load the `minion` skill first, then `code`, `page`, `new-page`.

**The owner's words:** `C:\Code\lew42\monorepo\public\framework\ai\2026\09\28\ai-2-rhythm-tabs-sections-and-sidebar-va\owner-words.md`,
the section "Continued (about 11:00 PM)", its first half (up to "we don't really have it yet").
Key sentences: "one way to handle the left and right sidebars is to have an app level sidebar that
you swap things out of. Another option would be to have each page kind of render their own and
maybe be able to hide a parent sidebar, but hiding the parent means that you then have to make sure
you show it at the right time … maybe we do just add and remove the active classes." And: "the left
sidebar nav could be a tree, and you could, you know, make it bigger or smaller. Just like VS Code."
And on selection: keep it in localStorage, but "if you have, like, two different saving modes … you
thought you had your stuff saved in the file system, it turns out you had it saved in the local
storage."

The owner is exhausted by complexity: **few, big, simple.** Every page leads with ONE sentence
saying what it is, then the thing itself.

## What exists

`public/framework/core/Sidebar/variants/` has an index plus `a b c d`. Each is a stage that takes
over the whole screen (`container()` → `app.$pages`, `hides-nav`) and builds the real `Sidebar`
with a custom `header`. They differ in what the top of the rail says (logo → where, word → what).
Read `page.js` and `b/page.js` first.

## Where you work

Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (server `http://localhost:58245/`).
**Fence:** `public/framework/core/Sidebar/variants/**`, and new shots in
`public/framework/ai/2026-09-28/section-variants/walkthrough/shots/`. Nothing else; never
`task.jsonl`, never `Sidebar.js`, `framework/page.js`, `app.js` or the Router.

## Deliverables

1. **E — the app swaps the rail** (`e/page.js`). One rail that lives in the app; each page, when it
   becomes active, hands it a header and a tree. Show it working: a stage with a live rail and two
   or three buttons/links for pretend pages (e.g. Framework, Core, Sidebar) that swap what the
   rail shows. Under it, the ~10 lines of code that do the swap.
2. **F — each page owns its rail** (`f/page.js`). Each pretend page renders its own rail; the
   parent's rail is hidden while a child is active, by the `active` class (CSS like
   `.x-page.active > .x-rail` shows, others hide). Show the same three pretend pages working, and
   the ~10 lines. One line naming the risk the owner named: the parent's rail must come back at
   the right time.
   E and F must look identical to the user, so the difference is only in the code shown under each.
   Put them side by side if they fit at 1920 (two stages of equal width), else one above the other.
   You may make E and F one page, `rail/page.js`, "Who owns the rail?", with the two side by side;
   that is better if it fits.
3. On E/F (or the rail page), the tree is resizable: say "drag its right edge" (the real Sidebar
   already resizes). And one short "Selection" note: a selection kept in localStorage survives a
   reload but is not in the files; two ways of saving can make you think something is saved when
   it isn't. Name the trade-off; don't solve it.
4. Every variant page (a–d too) leads with one plain sentence saying what it is, before the quote.
   Keep the quote, move it after. The index groups the cards in two rows: "What the top of the rail
   says" (A–D) and "Who owns the rail" (E and F, or the rail page).
5. Verify headless (Playwright, `rail-probe.mjs` in your scratchpad): zero console errors on every
   variant page and the index; click each pretend-page button and confirm the rail changes.
   Shots at 1920 to `walkthrough/shots/`: `variant-rail.png` (or `variant-e.png` + `variant-f.png`)
   and a fresh `variants-index.png`. Look at each.

`windowsHide: true` on any process. Don't start or restart any server. Commit by exact path.
Reply in under 8 lines.
