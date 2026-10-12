# Minion brief: the floating page, as a core/Page layout

Load the `minion` skill first, then `code`, `css`, `layout`, `page`.

**The owner's spec** (relayed by servex-mastermind, 2026-09-29 ~12:05 AM; the words themselves
will be appended to the card's owner-words.md):
- A core/Page layout word: the same page, with the top tabs swapped for an INNER LEFT tab nav.
  Start from `public/framework/ai2/floating.js`; it belongs in core/Page, and AI 2 then uses it.
- A **medium-gray "well"** background, a couple of shades darker than the light-gray rails
  (the left site rail, the right chat drawer), so the area reads as its own space.
- **The page content is WHITE.** It fills the width and scrolls on its own, vertically.
- **Padding-top on the container,** so the page's top edge shows below the viewport top, the gray
  flowing around the left nav, over the top and down the right. As you scroll, the top edge moves
  up and gets clipped.
- **The inner left nav is full height, stays put,** with the same padding-top so its top lines up
  with the page's top. Leave its colour alone.
- The pair sits centred in the well, with padding that scales up at 3440 (use the framework's
  clamp spacing tokens; read framework.css, don't invent numbers).
- Crisp: no seams. Screenshots at the top and mid-scroll, at 1920 and 3440.

## Where you work

Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (server `http://localhost:58245/`).
**Fence:**
- `public/framework/core/Page/layout/floating/**`: the new `floating.js` (moved from ai2, same
  API: `floating(box, { nav, content })`, classes `floating-…`) and `page.js` (replace the stub
  with the real demo).
- `public/framework/ai2/floating.js`: becomes a one-line re-export of the core file, so AI 2 uses
  it with no other change. Nothing else under ai2/.
- `public/framework/core/Page/layout/page.js`: only the table row that says "not built yet".
- `public/framework/core/Sidebar/variants/walkthrough/page.js` and new shots in
  `public/framework/ai/2026-09-28/section-variants/walkthrough/shots/`.
Never `task.jsonl`, never framework.css or any shared stylesheet.

## Deliverables

1. `core/Page/layout/floating/floating.js`: the spec above. The well, the white page, the
   padding-top, the sticky full-height nav, centred pair, scaling padding.
2. The demo page `core/Page/layout/floating/page.js`: leads with one sentence ("A page that floats
   in a gray well, with its own tab nav on the left."), then takes over the screen (the way
   `core/Sidebar/variants/b/page.js` does with `container()` + `hides-nav`, or inside the normal
   region if that reads better; your call, say which) and shows the floating page itself. Its
   content shows the layout's **system design**: the parts named in place (well, nav, page), each
   wrapped with `ui/section` (`public/framework/ui/section/section.js`) so hovering shows its
   class names. Enough real content to scroll (the nav's 4 or 5 tabs switch the page's content).
3. `ai2/floating.js` → re-export. Load an AI 2 card with `?view=workspace` (find one from
   `/framework/ai2/`) before and after; shots `ai2-workspace-before.png` / `-after.png`.
4. Walkthrough: add a step "The floating page" (picture: floating-1920-top.png, open it live).
   AND check every existing step's sentence against the page it describes: step 4 (Variant B)
   says "The logo grows bigger and the word drops away", which is false. B's logo goes up to
   Framework, its word is the page's title ("Core"), its nav is Core's own children. Fix any
   other mismatch too.
5. Verify headless (Playwright, `floating-probe.mjs` in your scratchpad): zero console errors on the
   demo, the walkthrough and the AI 2 workspace. Shots `floating-1920-top.png`,
   `floating-1920-mid.png`, `floating-3440-top.png`, `floating-3440-mid.png`. Look at every one:
   the white page's top edge visible below the viewport top at rest, clipped at mid-scroll, the
   nav still in place, no seam between gray and white.

`windowsHide: true` on any process. Don't start or restart any server. Commit by exact path.
Reply in under 8 lines.
