# The effort — `group`

A day is the filing system; an **effort** is how the work is actually thought
about — a thread that outlives any one day. `group` names it, and that is the
whole mechanism: no registry, no effort directory, no second file to keep in
step with the tasks it describes.

`effort.js`'s `efforts(list)` groups a flat task list by `t.m?.group`. If a
task dir shares the slug it reads as the effort's lead entry; otherwise the
effort is just its prettified name (`slug.replaceAll("-", " ")`). A task
naming no group lands under `slug: null`, sorted last and titled "loose" —
shown as such rather than hidden, since silently dropping a task from the
rail would be worse than an honest catch-all.

`efforts()` sorts running-first, then most-recently-active
(`by_activity`), for both the tasks *inside* an effort and the efforts
*themselves*. `tally()` produces the `{live, landed, idea}` counts a day's own
`glance()` renders.

## An effort is a filter now, not the board's grouping

`/framework/ai/`'s rail used to *be* the effort list — every task filed under
its thread, liveliest first. It doesn't any more: the board lists by date, one
card per row, because chronology is what a reader scanning a working log
actually wants (Mike, 2026-08-16). The effort survives as the card's
**category tag**: click it and `/framework/ai/effort/<slug>/` shows the same
spine with everything else removed.

That is a smaller job than the rail was, and it fits the mechanism better —
`group` was always one field on one task, and a filter is the smallest thing
that reads it. `effort_groups()` and `dots()` were deleted in the same change;
`efforts()` and `tally()` remain, feeding the compose box's `<select>` and a
day tile's counts.

The `effort/` segment is deliberate nesting. A bare `/framework/ai/<slug>/`
could not be told apart from a typo — the ai index's `route()` would have
turned every miss under `/framework/ai/` into a blank filter page.

## Why a day still groups by state, not date

`dashboard.js`'s day view (`dashboard(page)`) groups by `state()` —
Active/Landed/Proposed. Everything on that page shares one date, so a date
spine there would print the same weekday over every card; state is the only
axis a single day has left. It renders the same one-per-row `list()` inside
each group.

> `group` used to mean *the session that spawned me* — so `browser-cli-bridge`
> sat under `layout-tool` because that session happened to spawn it, which is
> parentage, not subject. Redefined 2026-08-14; parentage is still
> recoverable from `agents[]` and the session ids, and nothing rendered the
> old meaning, so the redefinition cost nothing to make.
