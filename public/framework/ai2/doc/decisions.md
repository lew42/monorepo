# Decisions — AI 2

Every fork in the road, with the alternative named. Written 2026-09-22 when the page was first
built (`ai/2026-09-22/inbox-model/`), and again the same evening when it became a rail and a
page (`ai/2026-09-22/ai2-master-detail/`).

# The rebuild — a list on the left, one page on the right

The owner, after an hour on the first build: *"as a new card is added, the whole thing gets
pushed down. It's jumpy. We do not want jumping things. We need a left sidebar that previews
the things, and then when we click on one it stays selected and then I have a persistent page."*

## A card is a REAL routed page, not a `selected_id`

The obvious build is the one the old board has: keep a `selected_id`, call `history.pushState`
on a click, and listen for `popstate` to put it back. That is about 120 lines on `ai/v/3/`, and
every one of them is a thing that can disagree with the url.

Instead, each card is a real page. A row in the rail is a plain `<a href="/framework/ai2/<id>/">`;
`route(id)` on the AI 2 page claims that segment and returns a `Page`; the page sets
`this.$pages` to the right-hand column, which is core's own word for *where my children mount*.
Everything else follows for free: the framework's `Router` does the navigating, `mark_links()`
marks the row you are on, Back and Forward work, and a pasted url is an ordinary cold load.
About 30 lines, and the url cannot drift from the selection because there is only one of them.

**What it cost.** Two things had to be said out loud that the hand-rolled version never needs:

- **`leaf: true` on the AI 2 page.** `route()` memoises each card page into `children`, and the
  site's sidebar walks that map — so one click put `zzz-seed-3` in the nav rail under AI 2. The
  framework's word for "I present myself, not my children" fixes it and also stops the page
  pre-loader descending into card pages nobody asked for.
- **`mark_links()` after the rows arrive.** The Router marks every link it can find during
  `activate()`, and at that moment the list is empty because its logs are still in flight. On a
  cold load of a card's own url the right card opened on the right and nothing was marked on the
  left. `mark_links()` is callable bare for exactly this.

## Three mechanisms against jumping, not one

Each removes a whole category of movement, and none of them is a workaround for another.

1. **The page on the right is a separate page from the list.** A repaint of the rail cannot
   reach it. Measured: three cards posted two seconds apart moved the selected page's top edge
   by 0.00px.
2. **The rail and the page each scroll inside themselves.** The window never scrolls, so nothing
   can grow underneath you.
3. **A row only enters the list when the list is quiet** — scrolled to the top, pointer
   somewhere else. Otherwise it waits, a pill appears, and the DOM order is frozen until the
   owner presses it. The sort is applied at that moment and at no other, which is what makes
   "no existing row ever moves under your pointer" true rather than merely likely.

**Alternative considered:** keeping the reader's scroll position by measuring the height of
whatever was inserted above them and subtracting it. That is the usual fix, it is what a chat
window does, and it is wrong here — it keeps the pixels still but silently changes what the
list contains under a pointer that is about to click. Holding the rows back is honest.

## Newest first, and nothing else

The first build sorted unread-first, then newest inside that. That is itself a jump generator:
every card you open drops out of the top of the list the instant you read it, and every card
anyone marks read reshuffles the rows around whatever you are pointing at. A clock order cannot
do that, because when a thing happened never changes. Unread is still carried by the dot, the
left edge and the count at the top.

## The links were blue because the theme is scoped to prose

Every link on a card measured `rgb(0, 0, 238)` — the browser's own default. The cause is not a
missing rule or an `ai2-` rule resetting `color`; it is that `framework.css` styles links as
`:where(p, li, td, th, dd, blockquote, .md) a`, **scoped to text on purpose**, so that every
anchor that is really navigation — a sidebar row, a tab, a crumb, a preview card — can opt out
by having a class. A card's links live in a bare `div`, so no rule reached them at all.

The site's class for a link that is not inside prose is `.page-link` (`core/Page/Page.css`:
`font-weight: 600; color: inherit`). The fix is one word in the markup. No `ai2-` rule restates
the theme, which is the whole point: if the theme's link colour changes, these change with it.

## Nothing scrolled, and nothing said so

The shell is a two-column grid at `height: 100%`. A grid's implicit **row** is `auto`, which
means it grows with its content however tall the grid itself is told to be. Measured: `.ai2` was
a correct 900px while the rail inside it stood 23,429px, ran off the bottom clipped by the
page's own `overflow: hidden`, with no scrollbar anywhere and nothing in the console.
`grid-template-rows: minmax(0, 1fr)` pins the one row to the box and the rail's own
`overflow-y: auto` then has a height to work against. One scroller on the page now — the rows —
which is the one that was meant to.

## The pill floats; it is not a row

Sat in the flow above the rows, the "3 new cards ↑" pill's own arrival pushed every row down
36px — the control whose entire job is to prevent a jump was causing one, measured (the first
row's top went 150.75 → 186.84 the moment three cards were held back). It is
`position: absolute` over the list now, in a box of its own so that "the top" means the top of
the rows and not the top of the rail, where the composer is.

## The composer loses its engine name in a 22em rail

`ux/Dictate` draws its engine, its status and a "stop after a pause" checkbox, none of which
shrink. At full size in the rail the composer stood 268px tall — a third of the rail spent
before the first card. It is 0.85em now and the engine name is folded away: which engine is
transcribing is a setting, not something you read while talking. The status stays, because it
is the difference between "listening" and "broken".

## Today's landings are subscribed, not fetched

They were one `fetch()`, on the reasoning that the day log is history the moment the day rolls
over. But a task landing at 7pm is not history — it is the thing the owner most wants to watch
arrive — and it did not: a landing appended while the page was open never showed up until a
reload.

The obvious fix, re-fetching on the dev socket's `data` event, does not work, and the reason is
worth writing down: the server routes any `.jsonl` change to `Tail.changed()`, its own
line-streaming wire, and never broadcasts it as a reload at all, so the `data` event never fires
for one. Measured — the tab had fetched the file and `changed()` was not called once.
Subscribing is the wire that carries it, and it is the same one the board and the verdicts
already use. All four logs are now one shape.

## The rail is `em`; the gutter at 3440 is accepted

A rail is sized by its own text, so `--ai2-rail` defaults to `22em` — 331px at 1280, 396px at
3440 — and the grip writes px over it, remembered in `localStorage` and reset by a double-click.
The card's prose holds `--measure`, so at 3440 the page on the right is 2,756px wide with 720px
of text in it. Widening the measure is not the fix for that (it trades dead space for an
unreadable line length) and centring is not either — the layout skill's rule is that a capped
region centres only when the whole page does, and here a left rail sits beside it. The gutter
is accepted, and the splitter is the knob for anyone who disagrees.

# The first build

## The page has no chrome at all

The owner counted the rows above the first card on the old board and called the whole thing
too much: *"there's a lot of UI for something that I'm not actually looking to do."* So there
is no view switch, no toolbar, no head links and no agent strip here, and the page's own big
"AI 2" heading is hidden too — it says the same word the rail already highlights and cost a
third of the first screen. What is left is the box you talk to and the cards.

**Alternative considered:** keeping a small filter row (unread / today / flagged). Rejected
for now — three of the six deliverables are about making the cards themselves carry their
state, and a filter is easy to add later to a page that has nothing to move out of its way.

## There is no Approve, and only one flag

*"Putting in an approve button on everything seems just a little bit — I'm not going to
actually click through approve on everything. I kind of want a way to red flag certain parts."*

So the only thing a card can be told is that it is wrong, and saying so is one press and one
sentence. Opening a card is what marks it read; nothing else does, because an inbox you have
to tidy by hand is the thing being replaced. The flag goes out as the `improve` verdict the
old board already wrote, on the route that already reaches the mastermind and rings it, so
nothing new had to be built for the message to arrive.

## Every source is merged into one list, keyed by id

*"So I can see all the things I'm saying being turned into structured ideas on screen in real
time"* — and separately, what the agents actually landed. Those are two questions with one
answer, so they are one stream, and a board card and a landing that share a name stay one card.

**Alternative considered:** a tab or a column per source. Rejected: it is the arrangement the
old board had, and the reason "what I said" and "what happened" felt disconnected there.

## One column, two at 1280, and then one more at each step — RETIRED 2026-09-22

Superseded the same evening by the rail and the page above: there is no wall of cards any more,
so there is nothing to choose a column count for. Kept because the measurement is still true of
any card wall on this site.


Two columns at 3440 would be about 1,600px of card each, which is nobody's reading width. A
column is the thing you add when a screen has room left over, never width. Measured card
widths with the dev rail open: 500px at 1280, 540 at 1920, 570 at 2560, 790 at 3440.

**Alternative considered:** `auto-fit` from a minimum column width, which is normally the
better word. Rejected here because it measures the container, so closing the dev rail would
silently move the step the brief names — and the brief's own proof is that it is at 1280.

## `refill()` compares the whole record, not a list of fields

A repaint that changes nothing should touch no DOM, so each card keeps a signature of what it
is currently showing. The first build wrote that signature as a hand-listed array of the
fields `face()` reads — and left out `proposals`. The result: a card that gained a "first
sketch" never redrew. No error, no warning; the feature simply was not there, and it was found
by posting a real proposal line and watching nothing happen.

A list like that has to be edited every time the face learns to draw one more thing, and the
day it is not, the bug is silent. The signature is now `JSON.stringify(it)` — the card's whole
record. `items()` returns plain data, so this is correct by construction, and at three hundred
small objects a repaint it costs nothing measurable.

## An entry with no id gets one from its clock, not its position

Servex mints ids now, but the oldest lines still inside its rolling window — and the first
lines of the static `prompts.jsonl` fallback — were written before it did. The first build
named those `prompt-0`, `prompt-1` by their position in the list. That is a rolling window, so
`prompt-0` means a different sentence every time an older line falls off the end, and a flag
the owner put on one sentence would quietly reappear on another. It is now built from the
entry's timestamp (`entry_id`, exported from `inbox.js` so that anything checking the page
uses the page's own rule rather than a restatement of it).

## The selection flag is clamped into the window

The flag that appears over a selected span was placed 38px above the selection. A
`position: fixed` button at a negative top is simply gone — no error, no overflow flag — so
selecting anything near the top of the screen made the card's one gesture silently do nothing.
It now goes above the selection when there is room and below it when there is not, and stays a
flag's width clear of both side edges. Found by driving the page, not by reading it.

## The composer's box takes its own line

The obvious arrangement — box, mic, Send, all on one row — does not survive contact with
`ux/Dictate`: it draws its own engine name, status and "stop after a pause" checkbox, none of
which shrink, so a `flex: 1` textarea beside it was handed what was left and came out 28px
wide with one letter in it. A full-width box with its controls underneath has no such fight in
it, and is the shape every message box already has.

## `compose.js` is copied from the old board, not imported

Seventy lines, copied from `ai/v/3/compose.js` minus its `edit()` gate (the box *is* this page;
a page whose one control hides itself is a blank screen) and its fallback to the old one-shot
assistant preset (Servex is the one destination now, and when it is down the page says so).

The reason to copy rather than import is the same reason that file copied its own six lines
from `ext/Ask/reply.js`: a page the owner works in all day does not take a dependency on the
page it is replacing, which is being changed and deleted around it.

# Open

- **`css-scopes.txt` needs one line for this module.** Every class here is `ai2-`, the census
  finds it nowhere else on the site, and the prefix is not yet reserved — but
  `public/framework/styles/css-scopes.txt` was outside this task's write fence. The literal line
  to add, so the next agent who can write that file does not have to work it out:

  ```
  ai2-         /framework/ai2
  ```

# Round 2 — the composer, the author, and the card you talk into

The owner's addendum the same evening, items 6, 8, 15, 17, 18 and 19. Items 7, 13, 14, 16 and
20 are deferred.

## Nothing is marked read by looking at it

*"when I click on them, they're disappearing — becoming read when I click on them. No no no. I
need them all unread again."* Opening a card wrote a `read` line; it does not any more, and
`Says` no longer replays the `read` lines already in `verdicts.jsonl`, so every card is unread
again. Nothing was deleted — the file still holds them — and read/unread comes back later as an
explicit control, never as a side effect of looking.

## The composer is one line, and it cannot grow

277px, the owner measured. It is **78.7px at 1280 and 73.3px at 400** now, and the composer
itself is exactly one control tall.

Three things hold that height, and all three are needed. The box is a single-line `<input>`,
because a `<textarea>` can be dragged taller. The microphone is `position: absolute` INSIDE the
field's right end rather than beside it. And everything `ux/Dictate` draws that does not shrink
— its engine name, its status, its "stop after a pause" box — is **moved bodily** into a
popover behind a `⋯`, positioned out of flow, so opening it moves nothing. Measured: the block
height and the first row's top are identical open and shut, while listening, and across five
streamed sentences.

**The trap that cost the most here.** The popover was hidden with `display: none` — and
`@layer util` beats `@layer theme` at any specificity, so `.flex { display: flex }` on Dictate's
own markup won. The popover stayed laid out, invisible, covering `+ New card` and `notes`: both
buttons reported `checkVisibility() === true`, and `elementFromPoint` at their own centres
returned `SPAN.ux-dictate-engine`. A real click did nothing. `visibility: hidden` plus
`pointer-events: none` is the escape, because neither is a property any utility sets — and the
usual advice ("drop the utility from the markup") is not available when the markup belongs to
another module.

## A card you talk into

*"I should be able to create a new card and then talk to that card, so the transcription is
baked into that card."*

`+ New card` appends a real `card` line to `ai/board.jsonl` and navigates to it. Writing it to
the board rather than remembering it here is the whole reason it needs nothing else built: the
board is already streamed into this page line by line, already merges a later line with the same
id in place, and is already what every other reader of this repo looks at. So the card appears
in the rail by the route a minion's card takes, the assistant can evolve it by appending another
line with the same id, and it survives a reload with no browser storage at all.

Every sentence sent from a card's own composer carries `re: <that card's id>`, and `items()`
folds a prompt whose `re` names a known card into that card's transcript instead of making it a
card of its own. Measured: a sentence from the card's composer posts `re: topic-…`, the same
sentence from the rail's composer posts none, and replaying it down the live stream adds no row.

**`ux/Dictate` posts every finished utterance itself**, to Servex, with no `re` — so a composer
that also posted from its `on_text` callback would log every dictated sentence twice.
`ComposerMic` overrides the one method that builds the entry (`log_prompt`), which is how a
dictated sentence carries `re` without editing `ux/Dictate` at all.

**And the microphone stops when you leave.** A card page's view is cached: it stays in the DOM,
deactivated, with its own composer and its own `re`. A mic left running there would go on
posting into a card the owner has navigated away from, silently. Found by the proof run, which
resolved two `.ai2-foot` composers on one page and picked the wrong one.

## The transcript footer

*"I don't like that my words disappear… that card could have, in a footer, the transcription —
the last paragraph always on screen."*

A card's page is a three-row grid: the back link, the ideas, the footer. The ideas scroll in
their own box; the footer is a fixed height pinned to the bottom, with the words scrolling
inside it, the grey guess always last, and the one-line composer under them. Measured: the
ideas' top, the footer's top and the footer's height are identical across five streamed
sentences, at 1280 and at 400.

**The bug only the screenshot caught.** Each region now names its own grid row
(`grid-row: 1/2/3`). Left to fall into the template in source order, `.ai2-back` is
`display: none` above 40em, creates no grid item, the other two shift up a row, and the FOOTER
inherits the `1fr` — 749px tall, starting a third of the way down the column. Every number in
the proof still read "unchanged", because it genuinely never moved.

## Every row says who

One word per row and per page — `you`, `assistant`, `mastermind`, or the minion's own name —
and `you` wears the accent, because whether the owner said it is the question the author line is
really being asked. The mastermind's `Note:` cards read as notes in the rail as well as on their
own page, and a `notes` word beside the count narrows the rail to only those.

**The `notes` word is not a url**, unlike the board's view words, and that is a real limitation
rather than a shortcut: `route()` claims every path segment as a card id, so
`/framework/ai2/notes/` would open a card called "notes". The url-backed views are item 14,
deferred with 7, 13, 16 and 20.

# ai2-nested (2026-09-23) — per-card storage, sub-cards in a third column, the footer

The owner: *"split the remaining area in two: the preview column resizable, the detail page
taking the rest, with a measure; the sub-items within that card open to the right of it... dig
down and moving back up is important."* Full survey: [`doc/persistence.md`](./persistence.md).
Full brief: [`requirements.md`](/framework/ai/2026-09-22/ai2-nested/requirements.md).

## The stream stays Servex's; the state (once a card has one) is a directory

Decision `card-storage-2` (2026-09-22 20:05) already drew this line — this task built it, not
re-decided it. What was said into a card is an append-only fact and stays one, written only
through `Servex/Log.js`'s single writer, now under the name `cards/<slug>` beside `prompts`.
What a card *is* — fields, sub-pages — was left for the directory (`ai/cards/<slug>/`) and
`core/Page`'s existing `data:`/`page.json` rung, which needed no new code at all (landed
2026-09-18). Nothing forced 300+ near-empty directories into existence: one appears only when a
card actually gets a page, per the original decision.

## `cards/<slug>`, not `cards-<slug>` or one shared file

`Log.js`'s naming check (`NAME`) never allowed a `/`, on purpose — a log name becomes a
filename, and a slash was the traversal risk it was built to rule out. The alternative to
extending it was flattening every card's log into one giant shared file with the slug as a
field, which throws away the two guarantees `Log.js` exists for: one open stream per file, and
`Log.append()`'s own per-file naming index. A second, narrower pattern (`CARD_NAME =
/^cards\/[a-z0-9][a-z0-9-]{0,63}$/i`) keeps the traversal rule (still no `..`, still one
extra literal segment, not an open door) while letting `place()`'s own `path.join` nest the
file under `logs/cards/` instead of flattening the whole directory. Proven with a traversal
attempt (`cards/../../etc`) refused at 400, never written.

## The route Express couldn't give `/log/:name`

`:name` in an Express route never matches a `/`, so `cards/<slug>` needed its own three-line
route beside the existing `/log/:name` ones, not a change to them — same body, same `cors`, same
409-on-refusal, only the name handed to `Log.append()`/`Log.tail()` differs. No ordering
conflict with the generic route: a two-segment url and a one-segment pattern can never both
match the same request.

## The live wire, without touching `Stream.js`

Servex's SSE stream only broadcasts log names on an explicit list (`Stream.follow(log, names)`),
by design — re-broadcasting every session transcript on the machine to every open tab was
rejected once already. `follow()`'s own code only ever calls `names.includes(name)`, so handing
it `{ includes: n => n === "prompts" || n.startsWith("cards/") }` — a plain object, not an array
— gets every card's live events onto the one open `EventSource` with no new method and no edit
to `Stream.js`, which sits outside this task's fence. `inbox.js`'s own `prompt_stream()` became
`log_stream(name)`, generalised the same way: one shared `EventSource` per Servex base, demuxed
by log name, so opening several cards' own logs never opens several sockets.

## Talking into a card double-posts — `/log/prompts` unchanged, `/log/cards/<slug>` new

The fast assistant and the Dispatcher (`Servex/agents/Assistant.js`, `Dispatcher.js`) only ever
watch `prompts` — routing a spoken sentence somewhere else would leave "nobody answered." Both
are outside this task's fence, so `compose.js`'s `send()` and the microphone's own `log_prompt()`
now post the SAME entry twice: once to `/log/prompts` (unchanged — the assistant keeps hearing
it), once to `/log/cards/<slug>` when a card (or sub-card) is selected, fire-and-forget, never
blocking the first post's own "sent" note. The alternative — one write, read by everything —
needs the assistant's own log-watching moved or duplicated, which is real work belonging to
Servex's agents, not this task.

## A sub-card's `re` carries `<slug>/<sub>`; its file is still the PARENT's

Deliverable 6's own words: *"a sentence talked into a sub-card lands in `ai/cards/<slug>.jsonl`
with `re: <slug>/<sub>`."* A sub-card is not a second log file — `CARD_NAME` only ever allows
one segment after `cards/`, on purpose, so a task doesn't have to decide how deep the nesting of
FILES goes. The nesting lives inside the entry's own `re` field instead: `sub_rows()`/`sub_row()`
(`inbox.js`) read a card's whole log through the same, unmodified `fold()` every other reader of
these logs trusts, and split it into rows by event `type` (`task`, `proposal`, `refined`) or,
for a transcript paragraph, one row per `prompt` entry — a sentence is not a sub-card, a spoken
turn is.

## The slug is the card's own id, not yet the assistant's locked name

The brief's own words: "the slug is the assistant's locked name, kebab-case, unique — the naming
checks already exist." Building that full integration (the assistant minting and locking a name
through `Log.js`'s `name`/`rename`/`approve` mechanism, on card creation) belongs on the
assistant side (`Servex/agents/Assistant.js`), outside this task's fence. `migrate-cards.mjs`
and the routes both use the card's own `id`, sanitised to kebab-case, as its slug for now — every
id already seen in practice (`open-mic`, `padding-law`) already reads as a locked name; only an
auto-minted `topic-<base36>` id is ugly rather than wrong. Logged as a fast-follow.

## The third column reuses `core/Page`'s `$pages` seam, not its columns mechanism

`core/Page`'s `column()`/`$pages`-per-column machinery (`/imagine/paging/`, the 2026-08-26 column
pages) is built for a page that KNOWS its own column count and widths up front, declared as
`page-column-*` classes on real DOM regions core itself creates. A card's third column is
conditional (open only when a sub-card is routed) and lives in a completely different container
(`.ai2-sub`, a sibling of `.ai2-detail`, not a child of either page). What carried over is the
one seam that already generalises: `page.$pages` is nothing more than "where my children mount,"
and a `Page` object never assumes that box is inside its own view — so the card page simply
points its `$pages` at the shell's `.ai2-sub` div instead of a region inside itself, and
`core/Page`'s own Router, `mark_links()` and cache-per-view all keep working exactly as they do
for the rail → detail hop. What that borrowing does NOT give for free: the grid growing a third
track, and the empty-state visibility rule, both CSS, both `ai2.css`'s own job (see the next
section) — `core/Page`'s columns mechanism solves that for its own, declared-up-front columns,
and re-declaring AI 2's two ad hoc regions as real `page-column-*` regions to get it would have
been the sitewide, cross-cutting change the Fence explicitly reserves for a proposal, not this
task.

## The real bug, found only by measuring: `.active-ancestor` needed the SAME rule as `.active-page`

`.ai2-detail:has(> .page.active-page) > .ai2-empty { display: none; }` was written when a card
page was always either the true leaf or nothing was open at all. It is no longer either, once a
sub-card exists: the card page stays mounted and becomes `.active-ancestor` (not `.active-page`)
the moment its own child becomes the true leaf, in a DIFFERENT container. The rule stopped
matching, `.ai2-empty` reappeared above the still-mounted card, and pushed its entire content
down by its own rendered height — every field in the proof read "unchanged" (nothing in the
content itself moved) until the screenshot-equivalent (a bounding-box measurement) showed the
title row at y 45 before, y 130 after. Fixed with `:is(.active-page, .active-ancestor)`, the
arrangement contract's own words (`core/Page/Page.css` uses the identical pattern repeatedly) for
"is any of this mine." Same shape as the FOOTER bug two sections up — a region visibility rule
written against one shape of "what is active" stops matching the moment a second shape exists,
silently, with every number still agreeing.

## The footer: one control height plus one rung of padding

The owner, 2026-09-22 19:54: *"way taller than it needs to be, grey background that abruptly
stops with a border on top; it should be flush or bordered properly."* Two separate things were
adding up: `.chatbox-log`'s flat `5.5em` reserved almost three lines even for a card nobody has
spoken into, and its own padding (`0.5em`) did not match `.ai2-full`'s (`var(--pad)`), so the
grey ground's inset read as arbitrary rather than a deliberate edge lined up with the column
above it. Fixed: `.ai2-foot`'s padding is `var(--gap-25) var(--pad)` — a real "rung" (the
framework's own word for the `--gap-*` tokens) on the block axis, matching the column's own
inset on the inline axis; `.chatbox-log` is a `clamp`-like floor/ceiling (`min-height: 1.5em`,
`max-height: 3.5em`) instead of a flat reservation. Measured: the footer is 64–70px tall now
(both widths), down from roughly 180px combining the old fixed script height and its composer.

## One scrollbar: the site-wide region, scoped off for this one page

`core/Page`'s `.pages { overflow-y: scroll }` is deliberate and permanent for every OTHER page —
a real, reserved gutter so navigating never shifts content sideways. AI 2 does not want it: its
own columns already scroll inside themselves, so the outer region's own gutter was the second,
always-empty scrollbar the owner saw. Scoped off with `.pages:has(> .page--ai2) { overflow-y:
hidden; }` — nothing else on the site loses its gutter. `.ai2-detail`'s own `overflow-y: auto`
was the SAME bug one level in: the mounted card page manages its own scroll at a fixed
`height: 100%`, so this region's content never actually overflows, and `auto` there was a second
region showing an empty scroll track the instant a card page's real content was a pixel taller
than estimated.

## Proven, not asserted

Headless, both widths, against a scratch Servex substitute (`Log.js` + `Stream.js`, real and
unmodified, never the live one) seeded by `migrate-cards.mjs` from real historical data
(`board.jsonl` + the real Servex prompts log, read only — never written to): cold deep link into
a card; the table of contents renders; clicking a row opens the third column at
`/framework/ai2/<slug>/<sub>/`; the detail column's own top does not move; talking into the
sub-card lands in `cards/<slug>` with `re: "<slug>/<sub>"` intact; the back link closes the
third column; the footer and the one-scrollbar measurements. 27 checks, both widths, all green.

# The overview (deliverable 7, 2026-09-23) — the default view is four columns by importance

The owner, 00:25: *"where would you put a report? We have so many dashboards that no matter
where you put it, it gets buried: new items push old ones down."* This landed FIRST, ahead of
1–6, on the mastermind's own instruction (11:57 the same day): *"the four-column overview is
what lands and is proven before anything else."*

## Two views, no url of its own for either

The rail + a card's own page (everything `board()` in `page.js` already builds) is the SECOND
view now; the overview is the front door. Neither toggle is a navigation with its own address —
only a CARD's own url is real, same as it always was. `overview.js` is built unconditionally,
every load, right beside `board()`, both mounted inside one `.ai2-shell` wrapper
(`display: contents`, so it costs the grid nothing); CSS alone decides which one paints, off two
signals: a manual class (`.ai2-mode-inbox`, flipped by "open the full inbox" / "← overview") OR
the framework's own mark that a card is active inside `.ai2-detail`. The alternative — a real url
segment (`/framework/ai2/inbox/`) or a query param checked once in `content()` — was rejected for
the same reason a query-param toggle was accepted earlier in this same file for the site's own
`ai/page.js` V1/V3 picker and then found fragile there: `content()` runs once, before the Router
necessarily knows what it is navigating to, and a toggle that depends on reading `location` at
that exact moment inherits every race `ai/page.js`'s own comments document fixing twice already.
A plain CSS class has none of that: it is applied by a click, after the DOM already exists.

## One data pipeline, two views

`board()`'s own `paint()` already recomputes `items()` on every log change; `on_list(fn)` is one
line added to its return value, called with the same list every time. `overview.js` never opens
its own copy of `Board`/`Says`/`day_log`/`prompt_stream` — needs-you, reports and landed are all
three the SAME list, filtered three ways. `live` is the one column with real data of its own:
Servex's agent registry (`GET /agents`, cors-enabled — `/api/agents` is not, and a cross-origin
fetch to it is silently refused by the browser before Servex ever answers), the usage snapshot
(`/framework/ai/usage.json`, read only), and the last few `agent` events off the SAME
`EventSource` `inbox.js` already opens for `prompts`/`cards/<slug>` — a second `addEventListener`
on one connection, not a second connection.

## A new arrival waits behind a pill, per column

The rail already solved "a new arrival must not reorder what you are reading" once; `column()`
in `overview.js` is that same mechanism, written once and used four times, rather than four
copies of it. A column with nothing in it collapses to nothing (`ai2-ov-collapsed`), generalised
from the owner's own words about `needs-you` specifically — the other three rarely go empty in
practice, and the rule costs nothing extra to apply everywhere.

## Proven

Headless, both widths, against a fresh scratch Servex substitute each run: the overview is the
default and the rail is not showing; all four columns exist (one collapsed when its list is
empty); needs-you shows flagged items with a working clear control; reports shows `Note:` cards;
live shows the registry and three usage bars; "open the full inbox" and "← overview" flip the
view without a navigation; clicking a report opens the card and the second view takes over, the
overview hidden. Two screenshots, 1280 and 400 (`ai/2026-09-22/ai2-nested/overview-*.png`). One
assertion (a report → card navigation, specifically at 400px, in a long test run) was flaky under
heavy load from dozens of sequential headless browser launches earlier in the same session — the
identical assertion at 1280px, and a final clean single-pass smoke test on a fresh scratch server
and a fresh port, both passed; the flake is logged as a test-infrastructure finding, not a
product one.

## A card is a folder, written only by Servex (2026-09-24)

Each card is a folder dated by the day it was created, `ai/2026/MM/DD/<slug>/page.jsonl`, and only Servex (`Servex/cards/Cards.js`) writes into it, so two writers can never tear a line. The alternative was one index file per day, `ai/2026/MM/DD.jsonl`; it was rejected because a card can then never own attachments or sub-files beside its log. The design is in [`Servex/cards/readme.md`](/Servex/cards/readme.md).

<a id="groups"></a>
## Groups: a line on the member, the rise worked out in the page (2026-09-24)

**Membership is one `{"group": id}` line appended to the member** — a task's `task.jsonl`, or a card through `POST /card/append` — and the latest line wins, so a thing can be moved. The alternative was a list of members inside the group's own card; rejected, because two agents filing two things at once would then both rewrite one list. **A group's place in the rail is computed in the page** from its members' own latest lines. The alternative, a Servex `Cards.on()` listener appending an "update" line to the group card for every member change, was not built: tasks are not cards, so it would only see half the members, and it needs a Servex restart. **The Live card sits right under the groups**, always in sight, and everything else waits in a closed "Not filed yet" fold; the alternative, the Live card inside the fold, would hide the usage meters. **Previews are whole** — the "rows must not change height" rule is retired by the owner's newer ask; the quiet-list pill still keeps new rows from jumping in. **A card's task page is drawn outside the box the card redraws**, and rebuilt only when the SET of members changes, not their order, because rebuilding refetches every page and closes the tab the reader had open. Detail: [`groups.md`](./groups.md).

<a id="cost-and-fill"></a>
## Cost on every preview; the detail page fills the column (2026-09-24)

The owner, 2026-09-24: "What took so many tokens? I want to see token cost on the AI dashboard previews and detail pages. The detail pages are still too small: they should fill the rest of the page area, and only content/flow should use --measure."

**Dollars, not tokens**, because each model charges a different price per token; the figure is `Server/task-cost.mjs`'s, never computed here. **A group row shows its sum in place of its "N tasks" count**, not beside it: all three words wrapped three group titles and pushed the Live card below the fold at 1920×1080. The alternative, a second line under each group, costs the same height. The count is one click away, since the group's card lists every task. **A group's card opens with a two-column table**, each task's name with its mastermind / minions split under it, then its total. Four columns made the names one word per line in a half column at 1280. Rows sort by cost, largest first. ⚠ **What the table draws is part of `draw_sig()`** (`cost_model()` feeds both): the card-page-flicker fix skips a redraw whose signature has not changed, the card first draws before the group's task logs load, and without cost in the signature the table never appeared on the live site. **Who spent it, agent by agent with each model, lives once**, in the task page's Report tab (`ext/AITask/cost.js`), which the card embeds. It is not repeated in the card's head.

**The card page is one track wide.** A card page is a `.page`, and core's page grid put everything in its 640px main track at the left of a 1,312px column (1920). Now the page is `minmax(0, 1fr)`, the measure sits on the card's own text, the chat and the task pages' prose (`ai.css` caps those itself), and the tables, the steps bar and the task pages run the full width. **With a sub-card open, the card and the sub-card split the room half each.** Until now the card clamped to its measure and the sub-card took the rest. The alternative, the sub-card at a fixed width and the card taking the rest, reads the ask the other way round; say if you want it.

# The element audit, 2026-09-25

The owner: "Every pixel on every column of every page needs to be as simple and useful as
possible." Every element on the rail, a card and Live was weighed (keep, move to a menu, fold, or
remove). The table, with a reason for each:
[`ai/2026-09-25/ai2-lead/audit.md`](/framework/ai/2026-09-25/ai2-lead/audit.md). The short
version: the bars are short and say what they count, the header's controls are one Actions
menu, the tabs show only when Tasks has something, a card is a three-number grid over one
filtered list with to-do first, and Live opens no chat until you click. Walkthrough:
[`/framework/ai/2026-09-25/ai2-lead/`](/framework/ai/2026-09-25/ai2-lead/).

# The rail is one timeline; a card made for you opens on your screen (2026-09-25)

- **One timeline.** Groups, the Live card and cards share one list sorted by last-updated only; each row shows its time top-right. A card's time is its newest sub-card's; a landing merges into the card of the same name; two rows with the same title under two minutes apart are one. Alternative rejected: groups pinned on top (the owner: "they seem sticky").
- **Focus.** `{"type": "focus", "ref": "<card id>"}` on the Live card's log (`append_log`, name `cards/live`) sends every open AI 2 page to that card. It is live-only, never replayed, and ignored after two minutes. Alternative rejected: a new Servex route. The Live log already streams to every open page, so no restart was needed.
- **A clock from the future counts as unknown.** A hand-typed day-log time (21:10 -07:00 for a 15:53 -05:00 landing) pinned its row to the top.

# The workspace view: an experiment behind a url switch (2026-09-28)

- **The switch is the url, `?view=workspace`, flipped by a full navigation.** The rail's `workspace` word reloads the same page with the switch flipped, so a card never redraws from one layout into the other. Alternative rejected: a pushState and a re-render of the open card, which can leave a half-switched card on screen. While on, every AI 2 link you click keeps the switch (`workspace.js` `keep()`), and so does every navigation AI 2 makes itself (`workspace.url()`).
- **Off changes nothing.** Proven against the committed files, served in place of the edited ones: the card, its head, its tab strip, its panel, its chat and the rail measured the same box at 1920 and 3440 on System design, the example card, a group, the Now card and the root. Task log: [`ai2-workspace`](/framework/ai/2026-09-28/ai2-workspace/).
- **The nav and the page centre together, as one unit.** The owner asked for a page "horizontally centered with a left sidebar of its own". Alternative rejected: the nav flush left and the page centred in the rest, which leaves a wide gap between them at 3440.
- **`floating.js` is one file with its stylesheet inside it** (added once to the document, in `@layer site`), so it moves into core/Page's Layout tab in one step. Alternative rejected: `floating.css` beside it.

# The rail's rhythm: the default padding, one step (2026-09-28)

- **Every rail row is padded by `--pad-card`,** the word `.card` wears: 16px in a 351px rail, more if the grip widens it. It was `0.55em 0.7em` by hand, on the theory that a row is a control, and the rows ran together. The default padding system was not broken; AI 2 never used it. Alternative rejected: the `.card` class itself, which adds a border and radius on four sides where the rail's rows sit flush, one hairline apart.
- **`.ai2-rows` is a size container,** so `--gap` inside the rail follows the rail, not the window (it was 24px at 1920 and 43px at 3440 in a 351px rail). Every part of a row sits one `--gap-35` below the one before, frozen on the row as `--ai2-step` so a smaller-type part does not shrink its own step.
- **Title leading 1.35, and the dot, icon and time sit at the top,** not centred on a tall wrapped title. Measurements: [`ai2-rail-rhythm/why.md`](/framework/ai/2026-09-28/ai2-rail-rhythm/why.md).

## Open

- Reserve the `floating-` prefix in `styles/css-scopes.txt` (outside this task's fence): `floating-   /framework/ai2/floating.js (moving to core/Page Layout)`.
