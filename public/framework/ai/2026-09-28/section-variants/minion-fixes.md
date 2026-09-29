# Minion brief: review fixes

Load the `minion` skill first, then `code`. The review's findings:
`C:\Code\lew42\monorepo\public\framework\ai\2026-09-28\section-variants\review.jsonl` (the `finding` lines).
Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (server `http://localhost:58245/`).
**Fence:** `public/framework/core/Sidebar/variants/**`, `public/framework/core/Page/layout/floating/**`,
`public/framework/ui/section/**`, and new shots in `public/framework/ai/2026-09-28/section-variants/walkthrough/shots/`.
Never `task.jsonl` or `review.jsonl`.

Fix these, and nothing else:

1. **Variant C** (`c/page.js`): the word is "Section" but the nav and logo still belong to Core. Make
   it consistent: logo → Core (its parent), word "Section" (the short name, the long title as the
   tooltip), nav `root:` the Section page. Update its sentence to match.
2. **Walkthrough** step 1's "Open it live" goes to `/framework/ui/section/`. Fix the counts so they
   agree everywhere: the index, the walkthrough and its description say "four variants of the top
   of the rail (A–D), plus who owns the rail". Retitle the walkthrough "Section, sidebar variants and
   the floating page, step by step". Add a link to the walkthrough from `ui/section/page.js` and from
   `core/Page/layout/floating/page.js` (one line each at the end).
3. **"Who owns the rail?"** gets an H1 ("Who owns the rail?") first. On **A–D**, put the H1 first,
   then the one lead sentence, then the quote, then the rest. Move the "← Sidebar variants" back link
   under the H1 or to the end.
4. **Floating page** (`floating.js`): the sticky nav sits at `top: var(--pad)` (the same padding the
   page's top has), so when you scroll, the nav's top stays aligned one padding below the viewport
   top. The white page is at least as tall as the well's visible room
   (`min-height: calc(100dvh - 2 * var(--pad))` or similar), so a short tab never leaves a gray void
   below it. Delete the duplicate `padding-top` line (review note 7).
5. **rail/page.js**: import variant A's header instead of the copied `brand_header()` (take the
   root as a parameter if A's needs one).
6. **ui/section**: check that the `.bleed` demo really bleeds to the region's full width inside
   `content()`. If it doesn't, make it (read how other pages use `.bleed`), and make the border a
   touch more visible (the next line token up, still subtle).

Verify headless (`fixes-probe.mjs` in your scratchpad): zero console errors on every variant page, the
rail page, the walkthrough, `/framework/ui/section/` and `/framework/core/Page/layout/floating/`.
Re-shoot: `variant-c.png`, `variant-rail.png`, `floating-1920-top.png`, `floating-1920-mid.png`,
`floating-3440-top.png`, `section-1920.png`, `section-hover-1920.png`. Look at each.
`windowsHide: true`. Commit by exact path. Reply with one line per fix number.
