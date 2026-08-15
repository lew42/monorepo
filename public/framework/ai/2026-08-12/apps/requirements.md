# Task: application-pattern examples — Figma-like, Blender-like, columns, rail-vs-detail

Session: 2026-08-12 (second session, orchestrated). Your pages live UNDER
`public/framework/ai/2026-08-12/apps/` (this exploration ships as session pages
first; propose promotion targets in your summary). You create new files only —
do NOT edit `ext/demo/*`, `ext/classdoc/*`, `ext/catalog/*`, `styles/*` (sibling
agents own them this session). `ext/layout` additions need a strong case; prefer
consuming it. Do not edit `framework/ai/2026-08-12/page.js`.

## Before writing any code

1. Load the `code-architecture` skill (Skill tool).
2. Read: `ext/demo/exhibit.js` (`demo.page()`, `demo.tree()`), `ext/demo/app.js`
   (`demo.app()` — a real Page tree playing App+Router in a box),
   `core/Page/page.js` + `core/Page/overview/` demos (the existing mini-sites),
   `ext/catalog/` (previews as persistent rail), `styles/layouts/page.js`.

## The goal

Examples that stress the framework toward real application chrome — each one a
browsable demo page built from the existing five blocks (Page, card/wall,
demo stage, layout bar, utility words). Four families:

1. **Figma-like** — left panel with layers + pages, center viewport, right
   properties panel. The properties panel should be REAL: selecting a thing in
   the viewport shows its properties as live toggles/knobs (note `ext/layout`'s
   drawer already does exactly this for utility words — reuse or imitate its
   pattern rather than a parallel one).
2. **Blender-like** — a flexible panel system: recursive split (rows/columns),
   each pane carrying a switchable editor type, drag to resize. MVP first: a
   fixed nesting with a type-switcher per pane already demonstrates the idea;
   drag-to-split is stretch, not required.
3. **Column-based paging** (Miller columns) — click an item in column N, column
   N+1 opens beside it, potentially infinitely deep; horizontal scroll keeps the
   trail. Build it on a real `Page` tree (`children` IS the data); this is a
   natural `demo.tree()` variant.
4. **Rail vs detail** — the navigation question, shown honestly: the SAME tree
   presented (a) with a persistent preview rail (`catalog()`), (b) preview grid
   that swaps to a full detail page, (c) columns from family 3. One page that
   lets the reader feel the difference.

Simple → complex: each family's simplest example is the category; richer
variants are its children (`children:` + previews), so the tree itself organizes
simple-to-complex.

## Structure

`apps/page.js` is your executive summary AND the index (children: the four
families). Each family: `apps/<name>/page.js`, a `demo.page()`/`demo.tree()`/
`demo.exhibit()` assembly, source-as-lesson, caption prose. Variants as child
pages where warranted. A shared `parts.js` for filler content is fine; new CSS
only for genuine layout relationships (panel splits), inside layers, prefixed
classes, files under ~100 lines.

Where a pattern could be modular (a panel on/off, a rail position), prefer a
live toggle over a second variant page.

## Deliverables

- Working pages, all reachable from `apps/page.js` (nothing crawls the
  filesystem — an unlinked page does not exist).
- Every JS passes `node --check` (copy to `.mjs`). Beware backticks inside
  `` css(`…`) `` template literals.
- `apps/page.js` — interactive executive summary (`meta: import.meta`, title
  "App patterns"): what each family demonstrates, live preview cards of the
  children, what the framework was missing / open questions, promotion
  proposals (where each example should live permanently). Model:
  `framework/ai/2026-08-08/page.js`.
- A short `readme.md`: the design calls (question → options → verdict).
- Do NOT commit. Scratch in your scratchpad, never the repo.

## Constraints (the ones that bite)

- No build step; native ESM; real-URL imports with `.js`.
- Never build DOM after an `await` — capture sync, fill in a callback.
- CSS in layers, all four restated; climb the ladder before writing any.
- No new preview/stage/panel *mechanism* — compose the five blocks; if a family
  genuinely needs a sixth block, write the proposal in your summary instead of
  the code.
- No new npm deps. Windows; dev server may already be on port 80 — reuse.
