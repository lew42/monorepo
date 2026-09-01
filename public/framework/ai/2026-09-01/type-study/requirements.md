# type-study — task requirements

Verbatim ask (from the design-crawl dispatch, mastermind-design-crawl 2026-09-01):

> **type** (typography) — faces, weights, line-height, measure, hierarchy. What does
> the site's typography actually consist of, is the hierarchy legible (can you tell an
> h2 from an h3 from bold body at a glance?), and where does it fail (walls of
> same-size text, cramped line-height, over-long lines)?

Scope: everything about type EXCEPT font-size distribution / 3440 scaling — that's
`../scale-study/` (read its data, don't re-measure).

Fences: this task owns `public/imagine/design/type/` exclusively. Do not edit
`public/imagine/design/page.js` (hub) or `public/imagine/page.js` — both already
declare/link `type`.

Environment: remote cloud container, overnight, owner asleep. No `claude-usage.py`
here — budget is the session's shared token allowance. Never commit/push (mastermind
does), never touch the dev server lifecycle.

Deliverable: `public/imagine/design/type/page.js` — live specimen sheet, the measure
question (--measure vs characters-per-line.md), hierarchy check with failure crops,
one paragraph of the 3 highest-leverage type moves.
