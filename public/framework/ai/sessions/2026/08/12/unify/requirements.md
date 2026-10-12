# Task: one page system everywhere — ui/ unification, detail-page layout, sub-demos

Session: 2026-08-12 (second session, orchestrated). You own `ext/demo/demo.css`,
`exhibit.js`, `exhibit.css`, `ext/catalog/*`, and `framework/ui/*`. Do NOT edit
`ext/demo/stage.js`, `stage.css`, `responsive.js`, `responsive.css` (a sibling
agent owns them); their public shapes (`stage()` returning `{$stage, $render,
$tools, measure}`, `demo.stage(fn, steer)`) stay as-is. Do not edit
`framework/ai/2026-08-12/page.js`.

## Before writing any code

1. Load the `code-architecture` skill (Skill tool).
2. Read: `ext/demo/readme.md`, `exhibit.js`, `demo.js`, `ext/catalog/`,
   `framework/ui/page.js` + `ui/readme.md` + two or three component pages,
   `styles/sections/page.js`, `styles/layouts/page.js` + `detail.js`,
   `core/Page/Page.css` (`.page-previews`/`.page-preview`).

## Problem 1 — ui/ is the last un-unified section

Sections, page demos, and styles/layouts now share one system: `catalog()` rail +
`demo.exhibit()` detail. The ui/ overview still does its own thing (a `previews()`
wall with token overrides; detail pages that are hand-rolled prose+demo, not the
exhibit assembly). Different pages doing similar things = one of them is always
stale. Unify: ui/ overview onto the same rail/wall pattern the other sections
use, ui/ component pages onto `demo.exhibit()` where the component is a render
(a component page's stage is its live component; def is the markup/function
lesson; the layout bar wired to it). Judgment call per page — a component whose
page is genuinely mostly prose can keep prose, but the render+code assembly
should be THE assembly. Record per-page calls briefly in ui/readme.md.

## Problem 2 — the detail page's layout, mobile → mega

The exhibit (stage, steer bar, source, caption) needs thorough layout work so
render + code use the FULL space on mobile — no wasted gutters, panes stacking
cleanly — and widescreen gets used (e.g. source beside stage when there's room?
your call — weigh it, record it). This is `exhibit.css`/`demo.css` work. Test
mentally at 390 / 810 / 1440 / 3440; the axis doctrine (everything left-anchored,
one axis) is recorded in `core/Page/doc/layout.md` — obey it.

## Problem 3 — sub-demos: Related / Variants

Any demo page should be able to carry child variants: a **Variants** (or
Related) section under the exhibit with preview cards of its children — the
simple example IS the category for the complex ones. Implementation sketch (own
the final call): `demo.exhibit()` gains an optional final section that renders
`this.previews()` / catalog cards when the page has children — reusing the ONE
card system, zero new preview mechanisms. `demo.page()` and `demo.tree()` pass
children through already since they're plain Page config. Show it working in at
least two places (a ui component with variants, or a layouts/sections page).

## Deliverables

- The unified ui/ section, the exhibit layout work, the variants section —
  working, all pages still linked and rendering.
- Every edited JS passes `node --check` (copy to `.mjs`). Beware backticks in
  `` css(`…`) `` templates — including in CSS comments.
- `ext/demo/readme.md`: append a numbered section at the END (a sibling agent
  is also appending — if you collide, merge, don't overwrite). `ui/readme.md`:
  the unification record.
- `public/framework/ai/2026-08-12/unify/page.js` — interactive executive
  summary Page (`meta: import.meta`, title "Unify"): before/after, live links,
  a live variants section demo, per-page judgment calls, open questions.
  Model: `framework/ai/2026-08-08/page.js`.
- Do NOT commit. Scratch in your scratchpad, never the repo.

## Constraints (the ones that bite)

- No build step; native ESM; real-URL imports with `.js`.
- Never build DOM after an `await`.
- CSS: every rule in a layer, all four restated everywhere; de-escalate
  upstream, never specificity-war downstream; component CSS is layout only.
- Files under ~100 lines; comments near zero; readme entries are
  question → options → weighing → verdict.
- One demo system, five blocks — this task DELETES divergence; do not add any.
- No new npm deps. Windows; dev server may already be on port 80 — reuse.
