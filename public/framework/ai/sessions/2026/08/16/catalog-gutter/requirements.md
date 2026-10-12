# catalog-gutter

Dispatched by `mastermind-layout`, verbatim:

> `ext/catalog`'s content region had no scroll boundary, so the bottom half of
> every `catalog()` page was unreachable. That was fixed an hour ago
> (`public/framework/ai/2026-08-16/catalog-scroll/`) — `unreachable` went from
> 21 findings across 11 urls to zero site-wide, and those pages gained 70–75
> points each.
>
> Regenerating the audit afterwards found the cost: `/framework/ai/` dropped
> 84 → 49 at 3440, picking up a new `gutter: high` — text sitting 0px from
> `div.pages`'s edge. That finding structurally could not have fired before,
> because `.page-catalog-pages` was not a scroll region and `gutter` only
> inspects regions that scroll. `/framework/ui/` shows a smaller version of
> the same shape.
>
> Not a regression in the usual sense: the region always had no gutter, there
> was simply nothing to notice it before it could scroll.

## Task

1. Reproduce: `analyze()` on `/framework/ai/` and `/framework/ui/` at 1280 and
   3440, read the `gutter` finding + selector + `:nth-child()` address, then
   `mcp__site__shot` both widths — confirm text is really against the edge
   before trusting the finding.
2. Give the region a gutter, at the right rung of `css-strategy`'s ladder.
   Check 390/1280/3440 — must not reintroduce clipping on the scroll boundary
   `catalog-scroll` just added.
3. Use the house answer (`--page-pad`, the way `.pages`/`Page.css` already
   solves this), not an invented literal.
4. Verify every `catalog()` caller at 390/1280/3440: `/web/nav/`,
   `/web/layout/`, `/framework/ui/`, `/framework/ai/`,
   `/framework/styles/sections/`, `/framework/styles/elements/*` (+ others
   listed in `ext/catalog/readme.md`'s caller table). Report before/after
   score/grade/high-count; confirm no page lost reachability.
5. Record one paragraph in `ext/catalog/readme.md` beside the scroll fix.

## Fence

Write only: `public/framework/ext/catalog/**` and this task dir. Do not touch
`/styles.css`, `framework.css`, `Page.css`, `ext/LayoutTool/**`, `public/web/**`,
or `ext/Panel/**`. If the correct fix lives in `Page.css` or `/styles.css`,
stop and report the exact declaration instead of editing there.

## Proposed steps

1. Check usage, open task
2. Reproduce: analyze() + shot at both pages, both widths — confirm real vs false positive
3. Read rules.js's gutter rule + Page.css's --page-pad / .pages solution
4. Implement the fix in catalog.css using the token
5. Re-run analyze() on the two named pages, confirm gutter finding gone, no new highs
6. Sweep every catalog() caller at 390/1280/3440 — score/grade/high before+after, reachability check
7. Update ext/catalog/readme.md
8. Land
