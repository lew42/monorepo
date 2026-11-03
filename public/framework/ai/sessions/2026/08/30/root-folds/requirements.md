# Root folds (W3a) — the topic-root above-the-fold pass

## The ask (verbatim)

> TASK W3a — the topic-root above-the-fold pass.
>
> THE AUDIT: the highest-traffic pages fail the owner's rubric — "give a strong overview with
> navigation above the fold" + show-don't-tell. The roots push their one demo below a 1000px
> fold: `/framework/` (a live Panel demo sits below hero+stats+code), `/notes/`,
> `/framework/core/`, and the same pattern on ext, ui, ux, util, dev, audit, faq, research,
> versus roots. THE MODELS (in shots/best/ + live): `/framework/styles/`,
> `/framework/ext/tabs/`, `/framework/ui/card/` — title + one orienting line + a compact demo
> + real nav, all above the fold.
>
> THE WORK: for each root in the audit's list (excluding `/` — a sibling owns the homepage):
> restructure so the fold at 1000px shows (a) the title + ONE orienting line, (b) a COMPACT
> live demo already on the page (move it up; shrink it; never add a second), (c) the section's
> nav (cards/links). Reorder, don't rewrite — most roots have everything, in the wrong order.
> Cut what the fold can't hold down the page, not out. Where a root has 3+ demos (audit lists
> 34 such pages — fix only the roots in your fence), keep the one that shows the most.
>
> VERIFY: every touched root re-graded by the audit's own rubric at 400/1920/3440 (above-fold
> crop each — before/after pairs; the before shots exist in the audit dirs), zero console
> errors, no regression on each root's deeper pages (spot-check 2 children per root).
> Keepers + `links`. Report: roots touched (N), grades before → after per root, the one demo
> each fold now shows, cuts.

## Fence

The `page.js` of: `/framework/`, `/notes/`, `/framework/core/`, `/framework/ext/`,
`/framework/ui/`, `/framework/ux/`, `/framework/util/`, `/framework/dev/`,
`/framework/audit/`, `/framework/faq/`, `/framework/research/`, `/framework/versus/`.
Nothing else — not core/Page internals, not the demos themselves, not the homepage.

## Before (audit.json, worst-of-three-widths)

Every one of the twelve grades **2/3 at all three widths**: (a) title+line yes,
(b) nav yes, (c) something shown — **no**. `faq` carries 3 demos, `versus` 2, `core` 1.

## Rules

Never kill/restart :80 (down — use a private `$env:PORT='8095'` node server, tear down after).
Never drive owner tabs. No stash, no commit. Screenshots to the scratchpad; keepers here.
