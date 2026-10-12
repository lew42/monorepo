# Scale study

Verbatim ask (via mastermind minion dispatch): "have a minion study scale. when/where do
we use smaller or larger scales? maybe we're missing opportunities here." Driving intuition
from the owner: "if it's 3440, and we have only a few things, they don't need to be small.
layout is scale, visual hierarchy."

## Scope
- Study only — measure font-size spectrum and space utilization across ~20 pages at
  390/1280/3440, find missed-opportunity pages (sparse + small type + huge unused width
  at 3440), build a live scale-ladder demo, land as `public/imagine/design/scale/page.js`.
- Fences: do not edit the `/imagine/` hub or `/imagine/page.js` (already declared child).
  Do not edit outside `public/framework/ai/2026-09-01/scale-study/` and
  `public/imagine/design/scale/` and `public/imagine/design/shots/scale/` (shots dir per
  process brief: `public/imagine/design/scale/shots/`).
- No commit/push (mastermind commits). No npm deps. No editing the dev server.

## Deviation log
- `$USERPROFILE/.claude/bin/claude-usage.py` does not exist in this Linux remote container
  (Windows-only path). Skipping usage-snapshot refresh; window.before recorded as unknown
  (0). Logged here per "never block, log assumptions."
