# Dashboard — decisions

## Each tile's real source, and why it isn't a second copy

| Tile | Reads | Why not a new reader |
|---|---|---|
| Inbox | `watch_needs()` (`ai2/needs.js`) | The exact shared scan the Inbox tab's own score floor (`score_for()`) reads — same ranking, same rows, already sorted highest-importance first. Polls itself (20s, paused hidden); this tile just slices the top 5 and unsubscribes on deactivate. |
| Log | `CardList` (`ai2/inbox.js`) | The same card index the real Log tab's rail (`AIRail`) is built from — read directly, not through the whole rail, which also builds a composer, selection-flagging and live sockets a 5-row preview has no use for. Polls itself every 20s, same as `CardList`'s other caller (`AIRail`). |
| Sessions | `row_view()` + `merge()`, exported from `sessions/page.js` | The identical row this tab's own Sessions page draws, so a fix to one look updates both. |
| Stalled / In flight | `/framework/ai/tasks.json`, polled every 20s | Owned and written by a sibling task (`stalled-and-budgets`); read defensively here, never computed by this task — CLAUDE.md law 7 ("compute, don't recall": a derived fact like "is this task stalled" is code's job, done once, not re-guessed by every reader). |

### Revision, 2026-10-02: the Log tile was first built on `log_board()`

The first version embedded `ext/AITask/dashboard.js`'s whole `log_board()` render — active strip,
compose box and all — cropped to a fixed height. A fresh review caught two real problems: it did
not filter out whatever the Inbox tile was already showing (the brief's own "no duplicates" ask),
and the crop cut a card off mid-way with no visual cue that more existed below a hidden scrollbar.
Replaced with `CardList`, which is the lean data layer under the rail rather than the rail itself —
a real fix, not a smaller version of the same mistake.

## Why the Inbox tile reads `watch_needs()`, not `Inbox.Compact`

The brief named `new Inbox({ page: this }).compact` as the Inbox tile's API. Checked before
building, and checked again after a review held to the brief's literal words: `Inbox.Compact`
(`core/Page/ext/Inbox/Inbox.js`) is the drawer's "Leave a note" box — one page's own coordination
notes, read from Servex's `GET /api/inbox?path=<folder>` (confirmed by reading that route's own
server code, `Servex/agents/inbox.js`: "COORDINATION, NOT CHAT... work on one module," scoped to
one folder, with no score or ranking field at all). Pointed at `page: this` (the Dashboard's own
page), it would show whatever coordination notes happen to sit on `/framework/ai/dashboard/`
itself — today, none — which is a different, much smaller thing than "the top 5 things that need
the owner," the ranked, cross-the-whole-system list `watch_needs()` already is and the real Inbox
tab's own score floor already depends on (`score_for()`, same file).

Kept `watch_needs()` on purpose, even under a review marked `fix`: using the named API literally
would compile and run, but would show the owner an almost-always-empty box captioned "Inbox" right
next to a tab captioned "Inbox" that shows something completely different — a worse outcome than
declining the literal instruction with the evidence written down. If a future need genuinely wants
one page's own coordination notes as a dashboard tile, that is a sixth tile, not a replacement for
this one.

## Why the outer Panel2 needed `.ac("wide")`

Found live, not guessed: a plain `Page`'s own content track is `main`, the narrow reading column
(design/layout's own `--measure`). A `Panel2` instance with no width class just fills whatever box
it's given, so `shell` filled that narrow column — measured 606px wide at a 1920px viewport, one
grid column only, regardless of `.panel2-grid`'s `--column: 26rem`. `.ac("wide")` claims the page's
wide track (main + breakout); re-measured after the fix: 1484px at 1920px, three columns. The
Sessions tab had the identical issue and got the identical fix — `design/layout`'s own commonest
failure, "a grid, table or dashboard squeezed into 52em," confirmed happening to a fresh module on
its first real measurement.

## `--column: 26rem`, not `.panel2-grid`'s own 22rem default

A dashboard tile's content (a task title, an agent name, a progress bar, or a session row with a
source tag) wants more horizontal room than `ext/panel2`'s own 22rem floor assumes for a generic
panel. `.dashboard-tiles { --column: 26rem }` overrides it per the readme's own documented knob —
no edit to `panel2.css` itself.

## Why Dashboard is weight 0

Log is weight 1, System weight 2; Inbox is always first regardless of weight (`ai/overview.js`'s
own hardcoded rule). Dashboard asked for weight 0 — ahead of Log — because it is the one page that
already shows both Inbox's and Log's own top items side by side, which the owner's own request
treats as more central than either tab alone: "/framework/ai's default tab could show a grid-like
dashboard that includes the inbox, but also the log next to it."

## Open: `css-scopes.txt` reservation

`dash-` is free (census: `grep -rhoE "\.dash-[a-z0-9-]*" public` found only this module's own new
rules). This task's fence doesn't reach `public/framework/styles/css-scopes.txt`; whoever next can
write it should add:

```
dash-        ai/dashboard
```

## Open: the ragged grid row

Stalled and In-flight sit on short, empty-state tiles (two lines) in the same row as Inbox (up to
five rows) on a wide screen, which can leave a gap of plain background under the short tiles before
Log and Sessions start on the next row. True CSS masonry isn't reliably available yet (confirmed in
`design/layout`'s own rules); `columns:` would fix the ragged look but reorders the tiles
top-to-bottom per column instead of left-to-right, which fights "Stalled is read first." Left as
the honest result of a grid of unevenly-tall tiles, not a bug — mostly a non-issue once
`tasks.json` exists and the Stalled/In-flight tiles usually hold real rows instead of an
empty-state line each.
