# even-columns — N equal columns computed from the room, fixed navigation, and pages that slide

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one mode, one number, one transition). Clear beats brief by far. Prioritize (the mode first, the animation second, the docs third).
**Length budget:** the lab row is one screen beside the two that exist; the columns doc gains one section; your landing report is one screen with the N table and the jank number.
**The reader is the overwhelmed newcomer.** Shown, not told.

## The owner's words (2026-09-17, 22:40)

> I want to focus on "N even columns". I think it was a mistake to use different sized columns, at least initially. The N should be computed on window resize to compute based on the columns min/max or recommended width, and available screen (or container?) space. For example, if we have 3k pixels, and each column wants to be 1000 px, then we can render 3 of them. Instead of continuous Miller columns, we want fixed (non janky) navigation. In order to avoid jumps, we could try to animate the pages sliding left/right? Look into how to animate pages.

And this morning: "If the navigation reflows and jumps a hundred or 300 pixels down the page, you don't even know that's the same thing."

The mastermind's decision, per the owner's rule that architectural questions get the best decision and the alternative presented: **build it as an additive core mode, switch the Finder demo to it, and leave `/imagine/` on the old mode with the numbers that show what switching would do.**

## What exists

- `core/Page/doc/columns.md` — the row, the six width words (`small hug default large fill full`), the phone regime under 32em, the crumb strip. `Page.css` line ~300 is the elastic `flex: 1 1 0`; today's nav-jump numbers and the stable-row lab: `/imagine/design/navigation/` and `ai/2026-09-17/nav-stability/proposal.md` (read both first; the lab already has "today" and "stable" rows and a button that presses both).
- Demos: `/framework/core/Page/overview/columns/finder/` and `…/columns/uses/{docs,inbox,workbench,split}/`.

## Deliverables (each ticked against the sentences above at harvest)

1. **The mode.** A host opts in — decide the spelling yourself and say why in the log (`this.columns({ even: true })` or `columns: "even"`; the house rule that a new name on `Page` is proposed first is satisfied by the owner's sentence today). Under it every open column is the SAME width: `N = max(1, floor(available / recommended))`, `width = available / N`, where `available` is the host's own inline size (a `ResizeObserver` on the host, not `window.resize` — the owner asked "screen or container?"; the answer is container, and the window is one container) and `recommended` is one token, `--page-column-recommended`, defaulting to the existing default ceiling `clamp(40em, 42cqi, 46em)` so a 3440 room gives 3 and a 1280 room gives 1 or 2 — put the table in the doc. Widths change only when the room changes, never when a column opens.
2. **Fixed navigation.** When more than N columns are open, the row shows the newest N; the older ones are off to the left, reachable through the crumb strip (already there). Nothing already visible changes x or width when a column opens — the nav-stability measurement (open a child, re-measure every open column's x/width and its nav links' y) reads 0 at 1280 / 1920 / 3440; and at 400 the existing phone regime is untouched.
3. **Sliding pages.** Research, then pick, then measure: (a) a CSS `transform: translateX` transition on the row (~250 ms, `prefers-reduced-motion` → none), (b) the View Transitions API (`document.startViewTransition`) with a named transition per column, (c) FLIP. Prototype the two cheapest in the lab, measure jank headless (count frames over 50 ms during the slide via `PerformanceObserver` long tasks or a rAF timestamp loop) and pick the one with fewer long frames; one paragraph in the columns doc says which and why, with the numbers. Apply the winner to the mode.
4. **Show it.** The nav lab (`/imagine/design/navigation/`) gets a third row, "even columns", built from the real mode (the existing two rows are built from core's own classes — follow that), pressed by the same button, with the same two readouts (0 / 0) and a third: "N = 3 (1147px each)". The Finder demo switches to the mode. `/imagine/` does NOT switch: put its would-be numbers (N and px at 1280 / 1920 / 3440, and how many of its 27 children would sit off-screen at each) in the doc as the next step.
5. **Docs:** `columns.md` gains "Even columns" (the mode, the table, the slide); `decisions.md` the dated record; the lab's `decisions.md` the row.

## Rules

- Load `code` (parts as static subclasses; every method a seam), `layout` (Q1 under a columns host; `fill`/`large` traps), `css`, `new-css-class`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/even-columns/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/framework/core/Page/**` (Page.css, Page.class.js or the columns part, doc/), `public/framework/core/Page/overview/columns/finder/**`, `public/imagine/design/navigation/**`, your task dir. Nothing else — not `/imagine/page.js`, not framework.css.
- ⚠ Core is shared by every page and by other minions' private servers: make each core edit in ONE write, load a page headless within a minute and read the console; if broken, `git checkout -- <that one file>` at once (you are its only editor tonight) and try again. Never leave Page.css or Page.class.js broken between two edits. Every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. The owner's server (port 80) is NOT running; start your own: `PORT=8104 node server.js` from the repo root, in the background; kill it by PID when you land. `ui-test` has the headless recipe; `.page.active-page` is `display: contents` — measure `.page-column-body`.
- Two numbers that must agree: the lab's readouts and your headless measurement of the same click; N computed by the mode and N from the table in the doc, at three widths.
- **Resolve, don't park.** Findings as `log` lines; timestamps from the clock.
- Landing: `outcome` = a headline (the mode's spelling, N at 1280/1920/3440 for the Finder, nav 0/0, the slide winner with its long-frame count), the links (the lab, the Finder, the doc), one screenshot of the lab's third row at 1920, what was left and why. One screen.
