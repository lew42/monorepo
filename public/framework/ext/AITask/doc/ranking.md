# Ranking — owner items first, and the order the owner put things in

Three things share one idea. **Some items are waiting on the owner**, and those go
above everything else. **Every list here can be put in an order**, and the order is
a line in the log like everything else. **A list item carries a thread**, and each
level of that thread ranks on its own.

## Needs you — the strip at the top

A bot can do almost everything on this site. It cannot log into Cloudflare, it
cannot pay for an account, and it cannot press deploy. When a run hits one of
those, the whole thread behind it stops — so that one sentence outranks every card
on the board, and it has to say **how long it will take**, because "five minutes"
and "an afternoon" are different decisions.

An `ask` or a `decision` says so by carrying `needs`:

```json ai/2026-09-17/sqlite-scout/task.jsonl
{"ask": {"id": "sqlite-status", "at": "…", "topic": "Pages", "status": "landed",
  "needs": {"owner": "Cloudflare login and wrangler d1 create", "minutes": 5}}}
```

Every one of them renders as one line — **the minutes, what it is, and a link to
the work waiting on it** — at the top of [`/framework/ai/`](/framework/ai/) and at
the top of that task's own **Asks** tab. Shortest first, because the five-minute
ones are the ones that get done, and the head says what the whole strip costs
("2 things only you can do · about 7 min in all"). With nothing waiting there is
no box at all, which is the normal state.

**The off switch is `needs.done`** — a date, stamped by a later line on the same
id, and the line goes. A decision has a second, free one: a verdict on it.

⚠ **It is not the ask's own `status`, and the ask above is why.** `sqlite-status`
is marked **landed** — the scout finished its report — while the owner has still
never logged into Cloudflare, which is the whole thing that thread is stopped on.
An ask's `status` is the bot's half of the work; `needs.done` is the owner's half.
Reading one off the other drops exactly the item you most needed to see. The verb
and its fields: [`ext/JSONL`](/framework/ext/JSONL/doc/task-jsonl/).

## Ranking — one drag, one line

Grab the grip in the corner of an ask card or a decision row, drop it where it
belongs, and the whole list's order becomes one line in that task's own log:

```json ai/2026-09-17/ranked-lists/task.jsonl
{"rank": {"list": "asks", "at": "2026-09-18T00:14:55-05:00",
  "order": ["owner-items-first", "threaded-lists", "rank-the-asks",
            "rank-the-decisions", "column-paging-ranked"]}}
```

The rules are the ones [`/layouts/browse/verdicts.js`](/framework/ext/AITask/doc/decisions-tab/)
already set, for the same reasons:

- **The writer does not apply its own line.** The append goes up the dev socket and
  comes back off the wire like anybody else's, so there is one code path and the
  server is the only orderer. (`expect()` is the safety net: if no frame carrying
  the order arrives in two seconds it applies locally and says so in the console.)
- **Append-only.** The last line wins outright; every earlier order stays in the
  file as the record of what the owner thought over time.
- **No second file.** The task log already *is* the record for that task.
- **Off the dev server no grip is drawn at all** — and the order still renders,
  because the order is in the file. The static site is the record, read-only.

**A grip, never the whole card.** An ask card and a decision row both *open* on a
click, and `ext/Draggable` starts a drag on the first `pointerdown` with no movement
threshold — a whole-card handle ghosts the card on a plain click.
[`ux/Tree`](/framework/ux/Tree/) and [`ext/Panel`](/framework/ext/Panel/) both met
this and both landed on the grip; reusing the finding cost nothing.

**Bands.** The Asks wall is one grid per topic, and each grid is its own drop zone:
you reorder *inside* a topic. Dragging across topics would be a change of topic,
which is an edit of the ask, not an order. One drop still writes the whole list,
band after band, so one line always says everything.

**Band order.** Which topic comes first is itself a rank — `list: "topics"`,
`order: ["Layouts", "Design system", "Pages", "AI log", "Ask"]` — grabbed by the
grip on a band's own heading and dropped among the other headings, exactly the
gesture a card uses one level down. It is a *second* `Ranking`, over the topic
*names* rather than the ask objects, because a band's own row is its heading, not
its whole grid of cards: dragging the heading moves that one element immediately,
and the wall of cards under it catches up within the append's own round trip
(~9ms, measured on `/imagine/stream/`) when the line comes back and the tab
redraws whole. Without a rank line the fallback is first-seen order, same as a
topic's own cards; **`Other`** — the catch-all for an ask with no topic — is
always pinned last, ranked or not, so the one undifferentiated band stays the
easiest one to find. On the run this was built against, band order and card
order agree for a reason: the mastermind ranked all 42 asks by outcome in one
pass, band by band, and `["Layouts", "Design system", "Pages", "AI log", "Ask"]`
is just where each band's first card landed in that flat order.

**Footnotes.** The same `rank: {list: "asks"}` line may also carry **`fold`** —
how many cards of *every* band show before the rest tuck under an "N more" bar
the reader opens (`{"rank": {"list": "asks", "order": [...], "fold": 6}}`). The
owner's own words for it: *"a lot of the things I've asked are side tangential
things, footnotes further down the page."* The folded cards are not removed from
the grid or nested inside the bar — they stay ordinary grid items with their grip
still live, and CSS alone hides them (`display: none` past the cut), so opening
the fold costs nothing to build and dragging one of the still-visible cards is
the same gesture it always was. No `fold` field: no fold, which is the default —
every existing run renders exactly as it did before this landed.

**A wrapping grid and a column ask the cursor different questions.** In a column of
rows the drop lands before the first row whose vertical midpoint the cursor has not
reached. In a wrapping grid it is reading order: a card is "after" the cursor if it
starts on a lower line, or shares the cursor's line and its own midpoint is to the
right. Which rule applies is read off the layout — two rows sharing an `offsetTop`
means the box wraps — not off a flag the caller has to remember to set.

## Threaded — what it means here

**An item's thread is the list that hangs under it.** An ask's thread is the tasks
serving it; a task's thread is the decisions it made. Ranking applies at each level
separately: the asks inside a topic, the decisions inside a task.

That is all the word claims. There is no cross-level ordering and no score that
travels up — a topic is not ranked by its best ask, because the two lists answer
different questions.

## Column paging over the thread

[`/imagine/importance/ranked/`](/imagine/importance/ranked/) is the thread as
columns: **topics → asks → the tasks serving them**, each column a ranked list
drawn from one run's log, every row numbered with its place. Click a row and its
thread opens beside it — core's own columns
([`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/)), with the children
of each level arriving as data (`children()` as a function).

Measured at 1280: opening a topic column and then an ask column moved the row's own
crumb strip **0px by 0px** both times — the navigation does not shift when a column
opens. The counts agree with the Asks tab's: 5 topics of 13 · 7 · 7 · 6 · 1 = 34
asks.

It is **read-only**. The log it reads is the mastermind's own and is being written
while you look at it; the drag that writes an order belongs on a task's own page,
where the log belongs to the page showing it.

⚠ **The demo asks for `columns({ even: true })` and does not get it**, because
`Page.column_host()` is `chain().find(page => page.columnar)` — root-first — and
`/imagine/` became a columns host first. The row is /imagine/'s and runs /imagine/'s
elastic mode. The line stays on the page because it is what the page asks for and
what it gets standing alone; making core support a **nested** host is a core change
and the owner's call. The even mode itself is live at
[the Finder](/framework/core/Page/overview/columns/finder/).

## The alternative: pairwise judgment

[`/imagine/importance/`](/imagine/importance/) already ranks things a different way
— it shows you two and asks *which of these matters more?*, over and over, and the
ranking falls out of the answers.

**Why not that, here.** These lists hold 5 to 34 items and have one judge. The
owner already knows the order; they just need to say it, and a drag says a whole
order in one gesture on the list they were already reading. Pairwise needs a second
screen, cannot be nudged ("move that one up"), and costs about *n log n* answers to
say what one drag says.

**When it would win.** A list too long to hold in your head; several people ranking
the same list who disagree; or a ranking that has to survive an argument — pairwise
keeps the judgments, so the ranking can be recomputed and defended, where a drag
keeps only the answer. If asks ever span weeks rather than a night, that is the
point to revisit it. The two are not exclusive: `rank` is one line in the log, and a
pairwise screen could write exactly the same line.

The choice is an open `decision` on
[this module's own task](/framework/ai/2026-09-17/ranked-lists/), with Approve and
Improve on it.

## What is deliberately small

- **No cross-list ranking.** `list` is one of `asks`, `decisions`, `tasks`, `topics`;
  there is no global order over everything in a day, because nothing reads one.
- **The fold count is one number for the whole tab**, not one per band — a band
  with fewer cards than the fold just never grows the "N more" bar. Nothing yet
  asks for a different cut per topic.
- **The Asks tab redraws on a rank line, not on every append.** Rebuilding the wall
  re-fetches every serving task's manifest and closes whatever sheet the reader had
  open, so `AITask.asks()` compares a signature — the ranks plus the set of items
  waiting on the owner — and redraws only when something the tab *shows* changed.
- **The drop moves the card in the DOM before the line comes back.** That is the
  gesture finishing, not the record: nothing is written from it, and the order still
  arrives off the wire and redraws the tab.
- **No keyboard reorder yet.** The grip is a pointer gesture. `ux/Tree`'s roving
  tabindex is the pattern to copy when a list here needs one; nothing has asked.
