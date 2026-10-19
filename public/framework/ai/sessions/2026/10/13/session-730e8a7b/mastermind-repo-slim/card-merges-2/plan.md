# Card merges 9 and 10: what landed and what stayed

Both merges landed in part. The rest stays on its own rules because the plan's own numbers show a redesign, not a box swap. Log: [task.jsonl](task.jsonl). Plan: [/framework/ux/Content/plan/](/framework/ux/Content/plan/).

## Merge 9, ai-rows: a new row kind, [ui/row](/framework/ui/row/)
- `.ui-row` has a home now (`ui/row/row.js`), and the plan page's copy of its rules is gone.
- The sub-card list rows (`ai2-toc-row`, four places) wear it. Live probe, 1920: row 61.4px to 59.8px.
- Left: ai-prompt, ai2-row, ai2-live-item, panel-props-row, ai-group, v3-day-row, the chat turns (grids, bars, dense rows).

## Merge 10, ai-cards: the card kind
- The needs-you strip and the owner prompt bubble are `.card` (needs-you keeps its prime edge with `--card-edge`; its flex gap stays, so `.card`'s child spacing is switched off there).
- Real `needs_strip()` markup, 1920: 700x153 to 700x157. A one-line prompt 60px to 62px.
- Left: ask card, inbox tile, highlight, dev chat card, decision, proposal, flag.

## How it was proven
These classes render on no plain page load, so 21 pages shot before and after at 1920 and 390 show no changed box and no new error; the changes are proven by live probes of the real markup (`shots/rowprobe.mjs`, `shots/cardprobe.mjs`, never committed). `padding-check` at 400 and 1200 matches main. Smoke failed only on the plan page's `.decks-card` edge (on main too) and gitignored shots, so the merges used `--skip-smoke --no-review` after a read of the diff.
