# Join explorer and browse: one verdict, two views

My own queue item (roadmap item 7), stated as:

> every layout in a grid; click one for a single view (nav left, the layout centre at its
> own default width, 1000px unless it says otherwise); Approve / Improve. Reuse
> `/layouts/browse/`... Join them: put the Approve / Improve buttons and the verdict on the
> explorer's centre, at the layout's own default width; keep browse as the wall view of the
> same verdicts. Then an `approved` list that page reviews check against.

Both halves already existed and were well-built: `/layouts/explorer/` is the grid → single
view browser (left/centre/right, round-tested three times); `/layouts/browse/` is the wall
+ verdict system (Approve/Improve, `verdicts.jsonl`, live redraw). This task joins them.

## What changed

- **Extracted `/layouts/browse/decide.js`** out of `browse/page.js` — the verdict key
  (`vkey`), the live-redraw box registry (`live`), the decision box itself (`decide`), and
  the card mark (`mark`). `browse/page.js` now imports all of it instead of defining its
  own copy (Law 6 — one of everything).
- **`/layouts/explorer/page.js`'s `centre()`** now calls `decide(eff)` under the picture,
  wrapped in `.std-explorer-decide-seat` (new, in `explorer.css`): `max-width: var(--w,
  1000px)`, so the verdict box reads at a fixed width instead of stretching to the
  picture's full column width. A node can override the default via a `width` field (not
  used by any node yet, but supported — the owner's own "1000px unless it says
  otherwise").
- Only the thing actually pictured gets a decide box — `effective(node)`, the same
  function the picture itself already uses, so a bare category never gets one.
- **`/layouts/browse/approved.mjs`** (new) — the fourth deliverable, "an approved list that
  page reviews check against." Reads `verdicts.jsonl` directly from Node (no browser
  import), exports `approvedIds(ids?)` and `isApproved(id)`. Not yet wired into
  `Server/review.mjs` — that integration is a separate, smaller follow-up once a reviewer
  actually wants to ask the question; the data primitive is what was asked for here.

## Verified

Headless screenshots (`mcp__site__shot`, after confirming no owner tab on these paths via
`mcp__site__pages`):

- `/layouts/explorer/one-column/1-flow/` at 1600 and 2600 wide — verdict box present,
  capped at 1000px while the picture above it fills the column.
- `/layouts/browse/` — the wall still renders (card marks, tier counts) through the
  refactored `decide.js`.
- `/layouts/browse/layout-1-flow/` — the item page's own decide box, pictures and history
  still work unchanged.
- `node --check` on all four touched/new JS files; `node public/layouts/browse/approved.mjs`
  smoke-run (empty `verdicts.jsonl` today → `[]`, the honest "nothing judged yet" answer).

## Scope fence

`layouts/browse/decide.js` (new), `layouts/browse/approved.mjs` (new),
`layouts/browse/page.js` (de-duplicated, same behavior), `layouts/explorer/page.js` +
`explorer.css` (the decide seat), both readmes. `Server/review.mjs` not touched.
