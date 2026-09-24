# Minion brief — build the three core-layout rules (core-columns)

Load the `minion` skill first, then the `css` skill (and `code` if you touch Doc.js).

## The words this is judged against (verbatim)

> 1. Navigation that doesn't jump: apply the 34cqi tuning from public/framework/ai/2026-09-17/nav-stability/proposal.md in core Page.css. The Reader centres at 3440.
> 2. Columns: a fill column gives back the space of columns opened under it, and a column head takes its own --pad. Test in the /imagine/paging/ lab.
> 6. A nested Doc draws as a plain section, with no doubled band (core/new 0, 1, starter; DesignTool/taste).

And the owner, on shared CSS: "we don't want to clobber things; an overnight session just destroyed a bunch of padding on a bunch of containers." **Change the fewest declarations that do the job.** Every page outside the targets must render byte-identical.

## Where

- Worktree `C:\Code\lew42\worktrees\core-columns` — its server is **http://127.0.0.1:53207** (never start/stop/restart any server). Edit ONLY in the worktree, never in `C:\Code\lew42\monorepo`.
- Headless Playwright (global; tested): `import { createRequire } from "node:module"; const require = createRequire("C:/Users/mike/AppData/Roaming/npm/node_modules/"); const { chromium } = require("playwright");` — scripts go in the session scratchpad, named `cc-build-*.mjs`: `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\df827164-9c31-42cf-a111-af266f471402\scratchpad\`
- Before-shots already exist at `public/framework/ai/2026-09-24/core-columns/shots/before/` (with `geometry.json`). Don't touch them.

## Deliverables

1. **Nav: freeze at a third of the row.** In `core/Page/Page.css`, `.page.columns .page-column-body`'s `flex` fallback today is `0 0 var(--page-column-recommended, clamp(40em, 42cqi, 46em))` (shipped 09-18, the proposal's first tuning). Change it to the proposal's third tuning, "freeze at a third of the row": basis `clamp(var(--page-column-min, 16em), 34cqi, <the ceiling>)` where the ceiling is the SAME chain `max-width` reads, so basis and ceiling can't drift. Leave `--page-column-recommended` and the `even` mode alone. Update the comment above it in the file's own style (short, with the why and the alternative). Measure: on `/framework/core/Page/overview/columns/finder/` and `/imagine/paging/`, clicking nav links must move no already-open column (0px), and at 1280 three columns fit.
2. **Fill yields.** The rule `.page.active-ancestor > .page-column-body.page-column-fill` (2026-09-05) still says `--page-column-flex: 1 1 0` — written when the base was `1 1 0`; now it GROWS and can still eat the child's room. Find a `fill` column in the `/imagine/paging/` lab (or its demos) with a child, open the child, and measure: the child must open at its own width (the width it would have with no fill parent). Make it so with the smallest change — most likely the fill parent that has an open child freezes like any other column (drop to the base fallback), and the leaf `fill` still fills. Measure before and after at 1280 and 3440.
3. **Column head takes its own pad.** `.page-column-head` pads on `--page-column-pad-y` / `--page-column-pad-x`. Measure in the lab at 1280 and 3440: does the head's title start at the same x as the column's prose (pad-x), and is its block padding the column's pad-y? If a column retunes its pad (a `--size` level, a small rail), does the head follow? If it already does, change nothing and say so; if not, make the head read the column's own tokens.
4. **Nested Doc = a plain section.** Pages: `/framework/core/new/` (and its sub-pages 0, 1, starter — find them), `/framework/ext/DesignTool/taste/`. A Doc nested inside another Doc draws a second title band. Make a nested Doc render as a plain section — its title as a section heading, no second band / well — with one rule in `ext/Doc/Doc.css` (a Doc.js change only if CSS cannot express "nested"). A top-level Doc page must not change at all.
5. **Log** each change as one line in your reply: the selector, before value, after value, and the measured numbers.

## Fence

Write only: `public/framework/core/Page/Page.css`, `public/framework/ext/Doc/Doc.css`, `public/framework/ext/Doc/Doc.js` (only if needed) — in the worktree — and your scratch scripts. **Do not touch** `core/Page/Page.class.js` (another mastermind is editing render()/render_column()), `framework.css`, anything under `styles/`, any page.js, any doc. Never commit. Never touch the reload hold (the worktree server has no owner watching it).

## Done

Reply with: the four changes (selector, before → after, one measured number each), anything you decided not to change and why, and any console error you saw. One screen.
