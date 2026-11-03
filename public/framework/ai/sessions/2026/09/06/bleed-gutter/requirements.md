# bleed-gutter — a bled grid of framed things pays the gutter back, on every page, once (Sonnet)

The owner, 2026-09-06 11:10: *"on the doodles page, a bleed grid needs padding, the items are butting the viewport."*

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; the `layout` skill's "Spacing and bleed — the 3440 rules" (**bleed is for paint; a framed box never bleeds; cards ride the padded track; `previews()` / `walls()` pay the gutter back for exactly this**) — the rule is written and it was broken again today, which means the RULE is not enforced by the CSS, and that is the cause to fix; `public/notes/doodles/page.js` and `doodles.css` (the page in question); `core/Page/Page.css` `@layer util` (the `bleed` block margins and how `.page-previews` pays the gutter back — read `Page.css:25–50` and the `.page-previews` rules before touching anything); `framework.css` (`.grid`, `.flex`, the pad tokens). Skills: `new-task` (this dir, group `layout`), `css`, `layout`, `finish-task`.

## Two fixes

1. **The page.** The doodles wall is a wall of framed tiles (a photo crop beside a drawing), so it rides the padded track: the right word is `wide`, not `bleed` (a bled wall that pads itself back is the same width as `wide` in a page grid, and `wide` says what it means). Change the doodles page; if `doodles.css` has a `--column` sized for the bled width, re-check it at 1280 and 3440 (the readme warns the column must clear the whole photo-plus-drawing pair).
2. **The cause, in core.** Any `.bleed` that is also a `.grid` or `.flex` (a wall of boxes) gets `padding-inline` equal to the page's horizontal pad, in the same layer and place where `.page-previews` already does it, so a framed tile can never sit at x:0 again. Paint that must reach the edge opts out with the existing word for that if one exists (read `css-scopes.txt` and `framework.css` for `flush`/`edge`); if none exists, propose one in your report and do NOT invent it — leave the mosaics you find as findings.

## Prove it — before and after, the whole site

Grep every `page.js` and `.css` under `public/` for a `bleed` applied to a grid or flex (`bleed grid`, `grid bleed`, `.bleed.grid`, `.ac("bleed")` near a wall) — list the pages. Crawl them, plus `/notes/doodles/`, `/`, `/framework/`, `/imagine/`, `/notes/`, at 400 / 1280 / 1920 / 3440 with the three invariants of the `layout` skill: **no text or framed box at x:0**, no prose past the measure, no sideways scroll. The count of framed boxes at x:0 before → after is the number in your report; after is zero except paint you name. Pixel-diff `/`, `/framework/`, `/imagine/` before/after — they should be 0 unless they carried a bled wall, in which case say which. Screenshots of the doodles page at 1280 and 3440 in your task dir.

## Fences and budget

Write: `public/notes/doodles/page.js`, `public/notes/doodles/doodles.css`, `core/Page/Page.css` (the one rule, beside `.page-previews`'s payback; nothing else in `@layer util`), this task dir. Never other note dirs, never `framework.css` unless the payback rule truly belongs there (say why), never `core/Page/Page.class.js`. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/commit. Budget ~120k tokens. Report in ≤ 6 plain lines: the rule you added (one line of CSS), framed-at-x:0 count before → after, the pages that changed, the paint you left.
