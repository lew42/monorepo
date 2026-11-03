# efforts — make the effort the top unit on `/framework/ai/`

## The ask, verbatim

> can we work on /framework/ai/ page? seems like the best place to organize all
> our efforts?

Followed by a choice between three shapes, of which Mike picked **"Effort is the
top unit"**: a grouping layer above tasks, where an effort spans days, shows its
tasks, and rolls up state.

## The finding that motivated it

29 task dirs across 7 days: 23 landed, 6 proposed, **0 active**. The index rail
renders all 29 as one flat list grouped by state, so the page reads as a
graveyard of finished work rather than a place that organizes effort.

The missing unit is the **effort** — a thread spanning days. The tasks already
cluster into five, and the concept is *already half in the data*: four task logs
write `"group": "layout-tool"` / `"timeline"` in their launch `assign`, and
`ext/AITask/dashboard.js` never reads it.

| effort | tasks |
| --- | --- |
| `ai-log` | dashboard, improve-daily-task-dashboard, log-feed, manifest-vs-log, sessions, task-previews, jsonl, timeline, ai-dashboard, ai-page, efforts |
| `layout` | layouts, layout-system, layout-tool, layout-space, figma-layouts |
| `panels` | panel, editor-panels, editor-panel-review, persistence |
| `vision` | vision-sonnet, vision-haiku-opus, vision-report |
| `apps` | apps, unify, stage, strategy |

Loose: browser-cli-bridge, dev-toolbar, renames, framework-clock.

## The design

**An effort is a slug, written as `group` in a task's `assign`.** No new entity,
no registry file, no new directory tier — the association already has a home in
the log, and nothing else has to be maintained in parallel.

- If a task dir with that slug exists, it is the effort's **lead** and supplies
  the title; otherwise the effort is just its prettified slug.
- A task with no `group` is **loose** — shown, not hidden, under its own heading.
- Resolution is by slug across all days, because an effort spans days. That is
  the whole point of the unit.

**Scope fence: the index rail only.** A day dashboard keeps grouping by state —
a single day is small enough that state is the useful axis, and effort would
fragment ten tasks into five headings of two.

## Steps

1. Effort model — `group` in the log, resolution and naming rules
2. Backfill `group` across the existing task logs
3. Rail groups by effort, active-first within each
4. Effort header — title, task count, state roll-up
5. CSS — reuse `.ai-group`; add only what genuinely isn't there
6. Verify at 1280 / 1920 / 3440, link the page, land
