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
