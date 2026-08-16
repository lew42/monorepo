One task, as a row: a state dot, title, category tag, step segments, links,
and right-aligned figures — the row every listing in `board.js` is made of.
Also exports `segments()` (the notch bar, reused verbatim by
`AITask.checklist()`) and the state constant `DOT`.

## The bridge is one ternary

`card(t)` checks whether a declared child's own `preview` differs from the
inherited `Page.prototype.preview` — if so, the child draws its own row;
otherwise `manifest_card()` runs. This is the entire mechanism that lets a
task like `task-previews` (a design note about this exact bridge) draw a
custom card instead of the generic manifest one, with no registry and no
flag.

## The tag is the effort, and it is a link

A card wears its `group` as a pill linking to
`/framework/ai/effort/<slug>/` — the board filtered to that effort
(`dashboard.js`'s `effort_board()`). A task claiming no group is **untagged**
rather than filed under a fake `loose` slug, which would be a url that could
collide with a real effort of that name.

⚠ It has to lift itself above the card's own link: `.ai-card-title::after`
spreads an invisible sheet over the whole row, so anything that must stay
separately clickable carries `position: relative; z-index: 1` — the tag and
the `.ai-links` row are the two things that do.

## `show_day` is gone

`card()` used to take a second argument that prefixed the row's status line
with its date, because a listing that reached across days had no other way to
say which one. The dated list heads each run of cards with its day, so the
parameter had no truthful caller left and went — along with `day_of()`, which
now lives once, in `board.js`.

## The counter counts what the bar fills

`steps_of()` prints `done/total`, not `step/total`, so the number and the notch
bar beside it say the same thing — and so a card agrees with the detail page's
"N of M done", which has always read `done`. A running task therefore shows one
*fewer* than the step it is working on; the step's own name is right next to it,
which is what says where it is.

Note that a landed task never reaches this line at all — `steps_of()` returns
early on `landed_at`, so the bar and counter belong to running tasks only.

## A quiet task says so in the figures column

`figures()` appends one more `[value, label]` pair — `2h 0m` / `quiet` — when
[`quiet()`](/framework/ext/AITask/) finds a *running* task whose newest log line is
over half an hour old. It rides the column that already exists rather than getting
a badge of its own: a stalled task is a fact about the row, the same kind of fact
as its spend, and the alternative was a new marker with new styles for something
the card could already say.

**⚠ It is computed at render time, so it is only as fresh as the last redraw.** On
the board that is every streamed batch, which is often enough — but a card that
nothing redraws will keep saying "45m" while the clock runs on.

## `current()` reads the manifest, not a status field

There's no explicit "what's happening right now beyond `now`" field — 
`current(m)` falls back to `m.agents?.findLast(a => !a.outcome)?.task`,
reasoning that the latest dispatched-but-unfinished agent *is* the live
sub-task, since agents are appended at dispatch time in manifest order.

## Improvements

1. **`figures()` and `AITask.figures()` compute overlapping numbers
   independently** — the row's `[value,label]` pairs here, the detail page's
   three tables there — both reading `m.agents`/`m.tokens`/`m.cost_usd` but
   through separately-written logic. Both already lean on `spend()` from
   `stats.js`; the remaining agent-counting (`done`/`total`) could move there
   too for one source of truth. *(medium, useful)*
2. **`when()` renders a malformed stamp as the literal string "Invalid
   Date"** — `7:55 PM → Invalid Date` is on the live board right now, from one
   task whose `landed_at` never parsed. The row is otherwise correct, so the
   card is the only thing that notices. Falling back to `"…"` would hide a bad
   log line rather than fix it; the honest fix is a validator where the line is
   written. *(simple, useful — decide which end owns it first)*
3. **The tag's url is a hardcoded string** in this file while `route()` in
   `framework/ai/page.js` claims the matching segment — two halves of one
   contract, and nothing fails loudly if either moves. *(simple, speculative)*
