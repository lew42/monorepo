# Task: responsive stage presets + two-up performance

Session: 2026-08-12 (second session, orchestrated). You own `ext/demo/stage.js`,
`stage.css`, `responsive.js`, `responsive.css`. Do NOT edit `demo.js`, `demo.css`,
`exhibit.js`, `exhibit.css` beyond what integration strictly requires — two sibling
agents own those this session. Do not edit `framework/ai/2026-08-12/page.js`.

## Before writing any code

1. Load the `code-architecture` skill (Skill tool). Non-negotiable house style lives there.
2. Read `public/framework/ext/demo/readme.md`, `stage.js`, `responsive.js`, `demo.js`.

## Problem 1 — the stage can only shrink

`stage()` renders at 100% of its container. The drag handle can make it narrower,
never wider — so you can never see how an example behaves at widths above the
container, which on a laptop means desktop/mega behavior is unreachable.

## Feature — resolution presets with computed zoom

Add device presets to the stage tools: **mobile / tablet / desktop / mega**
(suggest 390 / 810 / 1440 / 3440 — say your choice out loud in the readme).
Picking one simulates that width: set the render's width to the preset and compute
`zoom = container width / preset width` so it fits the current parent container —
exactly the math `responsive.js`'s `fit()` already does (`zoom`, never
`transform: scale()` — scale lies about layout size). Reuse/extract that logic
rather than writing a second copy; `responsive.js` already imports from the demo
family, so a shared helper in `stage.js` is the right home.

Decisions you make (state them in the readme, don't ask):
- whether zoom is capped at 1 (mobile preset in a wide container: real-size and
  centered probably beats magnified) — pick one and record why.
- how presets interact with the manual drag handle and right-click reset
  (suggest: drag clears the preset; reset clears everything).
- Update the width readout so it stays honest under presets (offsetWidth already
  ignores zoom — verify).
- The preset control belongs in `$tools` beside the zoom select and must work for
  every stage consumer: `demo()`, `demo.stage()`, `demo.exhibit()`, `demo.tree()`.
  Zero new API on those callers — they get it for free through `stage()`.
- Consider whether the existing manual zoom `<select>` and the preset control
  should merge into one control — fewer controls beats more. Your call; record it.

Mike also floated rendering the stage initially below 100% so there is room to
drag it larger. Weigh that against presets (which mostly obsolete it) and record
the verdict in the readme — likely "presets solve it, initial width stays 100%".

## Problem 2 — two-up drag performance

`demo.responsive()`'s split-handle drag re-simulates on every `pointermove`:
two style writes + `fit()` re-zooms both panes, each a full relayout of a live
render. Fans spin, frame rate drops.

Fix candidates, in order of likely payoff:
1. rAF-throttle the drag (coalesce pointermoves to one `split()` per frame).
2. Skip work when the integer simulated width hasn't changed.
3. A trailing debounce (~100ms) on the expensive re-zoom while the cheap flex
   split tracks the pointer live — only if 1+2 aren't enough; it changes the feel,
   so record what you chose and why.

Measure before/after if you can (a quick `performance.now()` count of layouts per
second of drag is fine); numbers go in the readme.

## Deliverables

- The code, working. Every edited JS file passes `node --check` (copy to `.mjs`
  to check — a backtick inside a `` css(`…`) `` template kills the whole site).
- `ext/demo/readme.md`: append a new numbered section at the END recording the
  design (question → options → weighing → verdict). Update the stage doc-comment.
- Update the demo section's `page.js` docs only if they claim something now false.
- `public/framework/ai/2026-08-12/stage/page.js` — an interactive executive
  summary Page (model: `framework/ai/2026-08-08/page.js`): what changed, with
  LIVE demos of the presets and the two-up (they're just `demo.stage()` /
  `demo.responsive()` calls), links to the files, and open questions. Keep it
  under a screen of prose. `meta: import.meta`, title "Stage".
- Do NOT commit. Leave the working tree dirty.
- Scratch files go in your scratchpad, never the repo.

## Constraints (repeat of the ones that bite)

- No build step; native ESM; import paths are real URLs with explicit `.js`.
- Never build DOM after an `await`. Factory call after `await` = bug.
- Every CSS rule inside a layer; restate `@layer base, theme, site, util;` in full.
- Files under ~100 lines; comments near zero (traps only).
- No new npm deps. No new preview/frame/arrange mechanism — extend the stage.
- Windows: never `pkill`; a dev server may already be on port 80 — reuse, don't spawn.
