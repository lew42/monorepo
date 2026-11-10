# Plan review: /live/plan/ui-kit/

Is the first version (cards 1–3) the right smallest thing? Close, but the order is backwards and one piece is underspecified.

1. **Reorder: card 3 (the layout check) is the actual fix, not cards 1–2.** The owner's complaint is regressions nobody catches, not a shortage of card styles; put "measure every changed page at merge, report-only" first, then build variants on top of a gate that already exists.
2. **Card 1 is five variants at once — bigger than the smallest thing.** Ship one new variant (or zero: just prove the existing `ui/card` grounds render in the library with no page CSS) before committing to five; five is the second step once the no-new-CSS pattern is proven.
3. **Card 3 never names where "each page's baseline" is stored.** By [make](the naming/homing law), a new record needs a path before it's built — e.g. `Server/layout-check.baseline.json` or similar — or the phase-2 "fail on new BROKEN" step has nothing to diff against.
4. **Card 3 risks a second screenshot pipeline.** `merge.mjs` (lines ~641–666) already builds a worktree server and runs headless checks (`smoke.mjs`, `NavCheck.mjs`) via `Server/Browser.mjs`'s Playwright context for new/nav pages; `layout-check.mjs` should hook into that existing worktree-base + page list, not open its own browser.
5. **The widths in card 3 (400, 1200) don't match `review.mjs`'s `widthsFor`** (400/1200/1920/3440 picked per diff shape, per the role readme). Reuse that same table so the two checks never disagree on what a page needed.
6. **Card 2 (arrow keys) is UX polish, not consistency enforcement** — it can move to the "next" group with cards 4–6 without weakening v1; nothing in the owner's "sloppy / broken layout" complaint needs keyboard nav to ship first.
7. **The Playwright/node path for DesignTool.analyze headless at merge does exist** — confirmed via `Server/Browser.mjs` already driving `smoke.mjs`'s screenshot step — so this isn't an open risk; the plan should state that reuse directly instead of leaving it implicit.
8. **Card 5's CSS-line-count merge gate has no "report first" phase-in.** `LivePage.css` alone is 282 lines outside `ui/`/`styles/` (card 6), so a hard fail would block unrelated merges immediately; give it the same report-only → fail-on-new-growth treatment card 3 gets, not an immediate hard gate.
