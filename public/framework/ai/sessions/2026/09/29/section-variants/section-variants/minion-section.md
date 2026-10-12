# Minion brief: `ui/section`

Load the `minion` skill first, then `code`, `css`, `new-css-class`, `new-page`.

**The owner's words** (read the whole file — the section part starts at "By the way, I think I asked,
you know, if we could put a wrapper around sections"):
`C:\Code\lew42\monorepo\public\framework\ai\2026\09\28\ai-2-rhythm-tabs-sections-and-sidebar-va\owner-words.md`

The key sentences: "let's create a new UI element … it's called a section … just a subtle border
with the name of that section as … a hover effect … maybe top left. Maybe bottom right … maybe the
section name should be the class name … if there's two classes on the section, then we identify it
by their class names … as we're browsing the site, we're kind of automatically learning the class
names … that doesn't have to go for every element."

## Where you work

Worktree `C:\Code\lew42\worktrees\section-variants` ONLY (its server: `http://localhost:58245/`).
Never write in `C:\Code\lew42\monorepo`. Commit in the worktree by exact path when it works.

**Fence (only these):** `public/framework/ui/section/**` (new), `public/framework/ui/page.js`
(append `section` to `children:` the same way `background` is appended — do NOT add it to BANDS,
read the comment there), `public/framework/styles/css-scopes.txt` (only if the new-css-class skill
says so; `ui-` is already reserved for ui/, so `.ui-section` needs no new line).

## Deliverables

1. `ui/section/section.css` + a tiny `section.js` helper (e.g. `section("bleed flex", () => …)`
   that makes `div.c("ui-section bleed flex")` and stamps the label). The label is the element's
   class names other than `ui-section` itself, written as `.bleed .flex`. Show it with CSS
   (`::before`/`::after` from a `data-` attribute or `attr()`), so it costs no extra DOM. Subtle:
   1px border in the line color, the label small, muted, and only visible on hover.
   Opt-in: nothing changes on any element that lacks `.ui-section`.
   Two placements: default top-left; a modifier class (e.g. `.ui-section-br`) puts it bottom-right.
   Every rule inside a CSS layer (see framework.css for the layer order); how the css is loaded
   follows what sibling ui/ components do.
2. `ui/section/page.js` — the demo: 3–4 REAL sections using existing framework classes: a
   `.bleed` band, a flex-wrap row, a catalog grid (find the real catalog/grid class in
   framework.css), a plain `.flow` prose section. Show both label corners. Show first, one
   short sentence per section at most. Include a line telling the reader to hover.
   `readme.md` (index shape) and `doc/` with one short doc.
3. Verify: load `http://localhost:58245/framework/ui/section/` headless (Playwright, headless, a
   script in your scratchpad named `section-probe.mjs`), zero console errors, hover a section and
   screenshot at 1920 and 1280 into
   `C:\Code\lew42\worktrees\section-variants\public\framework\ai\2026-09-28\section-variants\walkthrough\shots\`
   as `section-1920.png`, `section-hover-1920.png`, `section-1280.png`. Look at them.
   Also load `/framework/ui/` and confirm it still renders.

Any process you start: `windowsHide: true`; never a visible window. Don't start or restart any
dev server. Report back in under 10 lines: files, the url, the shots, anything left.
