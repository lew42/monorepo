# element-insets

Dispatched by the mastermind (group: layout), following `element-pages`
(37 orphan `demo()` blocks converted to `demo.page()` children today) and the
`taste-audit` final regen, which found six of those same pages dropped hard
(9-23 points) once `frame-gap` switched from reading declared padding to
`text_bounds()`.

## The ask, verbatim (relevant excerpt)

> `ext/LayoutTool`'s `frame-gap` band used to read a box's declared padding.
> It now reads `text_bounds()` — what `rules.js`'s `cramped` has always done.
> Re-measuring the site with the corrected band dropped six pages hard:
> styles/elements/{lists -23, table -20, media -19, misc -18, text -16, code
> -12}. The diagnosis: "these pages were previously credited for a wrapper's
> declared padding while their actual swatches sat text-tight." Verify that
> before fixing anything — reproduce visually, measure with analyze()/rate(),
> fix at the right rung of the ladder (one shared class if there is one, or a
> framework.css bug report if the offender lives there), re-measure, and
> check whether today's element-pages restructure introduced the tightness
> or merely exposed it (git diff on those six files).

## Scope / file-ownership fence

May write ONLY: CSS and `page.js` files under
`public/framework/styles/elements/**`, and this task dir. Do not touch
`framework.css`, `/styles.css`, `public/framework/ext/**`,
`public/framework/core/**`, `public/framework/styles/layers/**`, or anything
under `public/framework/ext/Panel/`. Do not edit another task's `task.jsonl`.

## Proposal (steps)

1. `git diff` on the six pages' commit history — did today's element-pages
   restructure introduce the tightness or just give it a url?
2. Reproduce visually: `mcp__site__shot` each of the six pages at 1280 and
   3440, look for text touching an edge.
3. Measure precisely: `analyze()` + `rate()` on each page, read `cramped`'s
   findings, the `frame-gap` value, and the offending element's address.
4. Find the shared cause — one class used by all six swatches, or six
   independent problems.
5. Fix at the right rung: one declaration in one place if there's a shared
   class; a framework.css bug report (not a local override) if the offender
   lives upstream of this fence.
6. Re-measure the same six pages: `frame-gap`, `rate()`, `analyze()` score
   and high count, before/after, with screenshots.
7. Land: report whether the finding was real, the shared cause, how many
   declarations the fix took, and whether the restructure introduced it.
