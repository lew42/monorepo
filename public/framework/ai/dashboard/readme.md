# Dashboard — a grid of live previews, stalled first

The owner's own words: "`/framework/ai`'s default tab could show a grid-like dashboard that
includes the inbox, but also the log next to it, in a responsive way." This tab is that
dashboard: five small tiles, each a live preview of a real view elsewhere on the site, arranged
in the same responsive grid [`ext/panel2`](/framework/ext/panel2/) ships (`.panel2-grid`) —
several columns on a wide screen, one on a phone, no breakpoints written by hand.

## The five tiles, in order

1. **Stalled** — top priority, shown first. A task nobody has touched in a while.
2. **In flight + queued** — what's building right now, each with a progress bar.
3. **Inbox** — the top 5 things that need the owner, same ranking the Inbox tab uses.
4. **Log** — the 5 newest cards, with whatever the Inbox tile is already showing left out.
5. **Sessions** — the top 5 rows from the [Sessions tab](/framework/ai/sessions/).

Every tile links to its own full view ("See all"). None of them is a second copy of its data —
each reads the exact same source its full-size page does; `doc/decisions.md` names every one and
says why. All five poll on the same 20-second cadence (paused while the tab is hidden), so this
page stays current without a reload.

## Why this tab sits right after Inbox

Weight 0, ahead of Log (weight 1) and every other tab — this is the ONE page that already shows
what Inbox and Log show, side by side, so it earns a place closer to the front than either on its
own. Inbox itself is always first regardless of weight (`ai/overview.js`'s own rule), so Dashboard
is effectively the second thing a reader can reach.

## Where Stalled and In flight get their rows

Both read `/framework/ai/tasks.json` — a file a sibling task, `stalled-and-budgets`, owns and
writes (one row per task from the last 7 days, `state: stalled | building | landed | ...`).
"Queued" in the tile's own heading isn't a fourth state the file can hold — a task is "building"
the moment it opens, and the tile just reads "queued" for one still waiting its turn (no
`landed_at` yet) versus "in flight" for one actively being worked. The code only ever checks
`state === "building"`; the queued/in-flight split is presentation, not data. That
file doesn't exist yet as of this tab shipping, so both tiles show "No data yet" instead of
guessing at a shape — they poll the same url every 20 seconds, so they start showing real rows the
moment the file appears, with no reload and no code change needed here.

## Watch out

- **The outer shell needs `wide`.** A plain page's own track is a narrow reading column — a grid
  of tiles left on it measured one column wide no matter what `.panel2-grid`'s own `--column`
  said. `.ac("wide")` on the outer `Panel2` is the one line that fixes it (see `page.js`'s own
  comment, and [`/framework/ai/sessions/`](/framework/ai/sessions/), which needed the same fix).
- **The Inbox tile reads `watch_needs()`, not `Inbox.Compact`.** The two are different things that
  happen to share a name — `doc/decisions.md` has the full reasoning and what was checked before
  choosing this.
- A grid of unevenly-tall tiles leaves ragged gaps under the short ones on a wide screen — a known,
  accepted limitation of CSS grid (no reliable masonry yet), written up in `doc/decisions.md`.

## More

- [This tab, live](/framework/ai/dashboard/)
- [`doc/decisions.md`](./doc/decisions.md) — exactly which function each tile reuses and why, the
  `dash-` css-scopes.txt reservation note, and the Inbox.Compact decision in full
- [`ext/panel2`](/framework/ext/panel2/) — the header/grid chrome this tab is built from
- [Sessions](/framework/ai/sessions/) — the tab the Sessions tile previews
- [System](/framework/ai/system/) — the AI system's own quick-links index (what the owner also
  calls "Overview"); this task left it unedited, see its own task log for why
