# vary-labs — verbatim ask

TASK — variation trees at `/imagine/vary/`: scrollbars, background hierarchy, child placement.

Replace the stub at `public/imagine/vary/page.js` — you own the dir. Three labs, each a
browsable tree of variations with PREVIEWS AS NAV, each variation its own child page, each
ending in a one-line verdict:

1. **scroll/** — the scrollbar situation. Owner: "if the scrollbar is full-viewport, it's not
   terrible to have scrolling column pages. i don't like having a padded area with a scrollable
   area inside the padding - it feels cramped, wastes space." Build the comparison: (a)
   full-viewport scrollbar with tall column pages, (b) the bad pattern — padded area with an
   inner scroll region inside the padding, (c) a flush inner scroll (scroll region reaching the
   column edge, `bleed`). Verdict per variation; screenshots make the case.

2. **tone/** — background hierarchy across columns: stepping lightness up (wash→tint→surface
   deeper = lighter), stepping down (darker as you go deeper — controlled darker steps via
   color-mix of --ink into --wash; never --well), alternating two tones, and a light→dark flip
   at one depth. Which reads as hierarchy? Consider ONE page with a UI control that switches the
   scheme live (controls-over-files) PLUS a couple of fixed exemplars — both shapes, cheaply.

3. **place/** — placement systems side by side: add-a-column (the default), swap-in-place
   (tabs), and a CAROUSEL — animated cycling of children (CSS transform transitions; respect
   prefers-reduced-motion; auto-advance OFF by default, arrows + dots). Same small content tree
   in all three so the difference is the placement.

FENCE — `public/imagine/vary/**` only.

Prior art (read, don't modify): `core/Page/overview/columns/examples/` (looks/, grids/).
Spec docs read before the first edit: `public/framework/ai/2026-08-29/imagine-program/requirements.md`
(the owner's full mastermind-run ask, S-vary is this task's slice) and `core/Page/doc/columns.md`.

VERIFY headless at 400/1920/3440: every variation renders, the carousel cycles (screenshot
mid-transition + settled; reduced-motion honored), tone control switches live, zero console
errors, no unintended scrollbars outside the scroll lab itself. Keepers at all three widths in
the task dir + `links`. One verdict line per variation in task.jsonl.
