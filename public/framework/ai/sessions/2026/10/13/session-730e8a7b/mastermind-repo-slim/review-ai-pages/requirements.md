# Fresh-eyes review of today's AI pages: the Inbox, the Sessions page, the session detail, the models page

Budget: $20. Load the `review` skill first (you are the fresh-eyes reviewer), then `sub-mastermind`. You are Opus because the owner judges by looking. Your log is this dir's `task.jsonl`.

## The owner's standards (each one is an acceptance test)

- [ ] Sessions page: no "major fail on layout" (header 50% down, giant empty footer, zero left padding): `../requirements-10.md` ask 6
- [ ] Inbox: "a prioritized view of only the important things, ranked by recency… inbox zero": `../requirements-3.md` ask 2
- [ ] The rail stays when a card opens: `../requirements-9.md`
- [ ] Names the owner knows: `../requirements-8.md` ask 2
- [ ] Level 1 above the fold, checked at 400 / 1200 / 1920 / 3440: CLAUDE.md "Presentation"

## What landed today on these pages

- Inbox: timeline, rail fix, seen/day (inbox-data)
- Sessions page (sessions-page-layout)
- Session detail: Raw links, Coverage tab (session-detail-raw, refine-pipeline)
- Models page (model-switch)

## Deliverable

1. **One review pass per page** with the `review` skill's method: headless shots at the four widths of `/framework/ai/` (the Inbox), `/framework/ai/sessions/` (month default), one session detail page (a 10-13 session with a Coverage tab), `/framework/ai/models/`; each design system's questions answered with a number or a shot (layout: first-row y, footer height, gutters; navigation: back/reload land in the same place, the rail stays; words: names the owner knows; colour/contrast; wrapping at 400 and 3440). The owner's own sentences above are the acceptance test: say for each whether it now holds, with the measurement.
2. **Fix what you find yourself** (the reviewer is the best-placed fixer), in a worktree, smallest working fix, `check_page` at the four widths, smoke clean, `merge.mjs`; anything bigger than an hour is written as the next brief (`doc/next.md` in the page's module) with the measurement that justifies it.
3. **The report**: `review.md` in this task dir (one screen: pass/fix per page, the numbers, before/after shots), linked from each page's module doc; card report; landing line checked with `tail -1`.

Fence: `core/Page/ext/Inbox/**`, `ai/AISession/**`, `ai/sessions/**` (page files), `ai/models/**`, their docs, this task dir. Not `SessionIndex`, not Servex. Opus; Sonnet minions for the fixes if you want them.
