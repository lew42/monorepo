# Decisions — streaming pages

## The landing page's hero card — 2026-09-05 UX pass

The page's whole claim used to be three sentences and a static "9 ms" number; a reader
had to click into a child and open a second real tab to see it happen. Tried the owner's
3-column card on `/imagine/stream/` itself: left a title, centre TWO independently
subscribed `Stream("wire")` instances (not the same object drawn twice — two real
sockets on `data/wire.jsonl`, the exact case `ext/JSONL/live.js` names: "a path can have
several readers"), right the live medians and the log's own byte count.

**Kept.** Measured at both widths (`.page-column-body`'s `scrollHeight`, not its own
rect — that box is `overflow-y: auto`, Page.css, so its rect is clipped to the row and
never grows; not the document's `scrollHeight` either, which the columns shell pins to
the viewport regardless of content):

| | 1280 | 3440 |
|---|---|---|
| width used (right ÷ viewport) | 91.6% → 91.6% | 46.0% → 46.0% (unchanged — the column's own width word caps it, not this page: known site-wide) |
| dead space | n/a at 1280 (single column fills it) | 1856px → 1856px (the columns-row band, known site-wide, not this page's) |
| column body height | 1358px → 1326px | 1651px → 1620px |

The hero card alone cost roughly 400–500px. It was paid down by folding the two
mechanism sections below it ("What was already here", "On Cloudflare" — real depth, an
append-RPC measurement and a Durable Object plan, not fluff) into a second `<details>`,
matching the sample above it that was already folded 2026-09-04. Net: the page is
**~2% shorter at both widths** than before the card existed, and the page's one claim is
now demonstrated on the page you land on instead of asserted in prose. Invariants
unaffected: no content at `x: 0`, no prose past the measure, no framed box touches the
column edge — the hero card is a `surface` box inside the normal padded flow, never bled.

Console: zero errors at 1280 and 3440, both before and after (the 1280/3440 *before*
shots did carry one 404 each — `/imagine/decks/thumbs/deck.jpg`, unrelated to the hero
card; see "the deck thumb path bug" below).

## The deck thumb path bug — a stale field and a directory that only works by luck

`stream/deck/page.js` still declared `shapes: ["1:s", "62:s 38:l"]` after
`imagine/decks/deck.js`'s own 2026-09-05 refactor removed `diagram()` and the `shapes:`
reader that fed it in favour of a real screenshot preview — this deck was the only page
in the repo still declaring it, and it drew nothing because nothing reads it any more.

Separately, `Deck.preview()`'s thumb path is `base + "thumbs/" + this.name + ".jpg"`,
where `base` is `decks/deck.js`'s OWN directory (`new URL(".", import.meta.url)` of that
shared module) — correct for a deck that lives beside it (`/imagine/decks/<name>/`), a
404 for one that does not. `stream/deck/` 404'd on `/imagine/decks/thumbs/deck.jpg`,
found live in a before-shot's console.

Fixed locally: `stream/deck/page.js` now overrides `preview()` with `this.url +
"shot.jpg"` (a still beside the page, matching `wire/` and `blocks/`'s own convention),
and dropped the dead `shapes:` field. **Proposed for `decks/deck.js` itself** (outside
this realm, not edited here):

```diff
- div.c("page-preview-thumb decks-thumb", () => img().attr("src", base + "thumbs/" + this.name + ".jpg")…);
+ div.c("page-preview-thumb decks-thumb", () => img().attr("src", this.url + "thumbs/" + this.name + ".jpg")…);
```

`this.url` is already every `Page`'s own directory (`Page.class.js`'s `this.meta`
derivation), so every deck, in any realm, would find its own thumb without a per-realm
override like this one.

## The delta contract is consumed, not defined here

A sibling effort (`json-pages`, `/imagine/cms/json/`) owns the line format:

```json
{"at": "<ISO>", "op": "set"|"del"|"append", "path": ["a", "b"], "value": <any>}
```

`stream.js` reads exactly that and adds nothing to it. **A delta line is bare** — no verb
key — so it never reaches `JSONL`'s verb table; `Stream.apply()` intercepts anything with a
string `op` and passes everything else to `super`, which means a `log` line beside a delta
stays legal.

⚠ Key order in `push()` is the contract's, kept by `{at, ...op}`. It is not cosmetic: the
whole-file write means the bytes this window produces must match the bytes the server counted.

## The editor does not apply its own edit

`push()` writes and stops. The delta comes back off the socket like everyone else's, and only
then does anything redraw.

- One code path instead of an optimistic one and a real one.
- The server is the only thing deciding order — which is precisely what a Durable Object does
  in production, so the local and the deployed versions have the same semantics.
- The latency number is therefore the *same number* in both windows, and it is real.

The cost is that a keystroke is a round trip. At 9 ms nobody can tell; the text inputs are
uncontrolled anyway, so nothing waits on it.

**Rejected:** apply locally, then reconcile. It needs a second code path, and the reconcile is
where the bugs live.

## Snapshot + log, not a saved document

A cold window fetches `page.json` and replays `page.jsonl` on top. Rejected alternative: save
the state as one JSON file on every edit. That is simpler until two windows have it open, at
which point the last save wins and the other's work is gone. A log has an order.

Compaction — fold the log back into the snapshot — is a button here (`clear()`, which drops
the log). In production it is an alarm.

## Where "anything on a page" actually stops

The claim is as wide as the contract, and the contract carries **JSON at a path**. So:

| streams | does not stream |
|---|---|
| prose (a markdown block) | behaviour — a new interaction is a new `page.js` |
| a token (a colour, a measure) | a new component |
| a size word (`20em`, `34em`) | a stylesheet |
| the block list itself (`append`, `del`) | anything the page did not already know how to draw |

`/imagine/stream/blocks/` demonstrates the left column literally. The right column is not a
gap to be closed by a wider contract — it is the line between **data** and **code**, and a
page that streamed its own code would be a page that reloads.

## Whole-file write, and the bug it caused

The writer is also a subscriber, so its own lines echo back. Adding the echo to the local copy
wrote every line twice on the next edit and the log doubled per edit — three edits made seven
blocks (2026-08-30). Fixed with a `confirmed` / `pending` split in `Stream.parse()`, matched
per whole line (a line carries an ISO millisecond, so it identifies itself).

## The append RPC landed — and the fallback stays anyway

`rpc:append` is wired (2026-08-31), so `push()` sends the line and not the file. The measured
difference is concurrency: two windows, 15 edits each, at once — **30 of 30 lines survive on
append, 11 of 30 on the whole-file write** ([`wire.md`](./wire.md)).

**`confirmed`/`pending` were kept, not deleted.** They were going to disappear with the append.
They did not, because `Stream.send()` still has to work on a dev server started before the
plugin landed, and that fallback needs this window's copy of the file. The cost of keeping them
is ten lines nobody reads on the happy path; the cost of removing them is a page that silently
stops saving until somebody restarts a server.

⚠ **A missing responder never answers.** `async_rpc` waits forever for a reply that is not
coming, so the append races a 2-second timeout and the verdict is remembered on the instance —
one edit pays for the probe, once, and only on an old server.

## Compaction folds; clear throws away

Two buttons, deliberately both. `compact()` writes the replayed state into the `.json` and
**then** truncates the `.jsonl`; `clear()` truncates and lets the old snapshot win.

Ordering is the safety property: truncate first and a window reloading in that gap gets the old
snapshot with nothing left to replay. And a window that *sees* the truncation must re-fetch the
snapshot (`reset()`, `cache: "no-cache"`) rather than reuse the base it loaded with — otherwise
the file on disk is right and that one window quietly rolls every folded edit back out.

**Rejected: compacting on a timer, or above a line count.** A background process that rewrites
your content while you are looking at it is the opposite of a demo you can trust. Compaction is
a moment somebody chooses, and the button prints the counts before and after.

## No merge

Two windows editing the same field: last writer wins, and neither sees the other's letters
until one reloads (the controls are deliberately not rebuilt from state — a control rebuilt
under a caret loses the caret). A Durable Object would make that ordering *correct* rather
than arbitrary; it still would not merge. Merging is a CRDT or OT layer above the log, and it
is not here and not proposed.

## Sizing

Both editor pages are `fill`, not `large`. A streamed **width** is one of the three kinds
demonstrated, and at `large` the live pane measured 296px — narrower than three of the four
widths on offer, so the word streamed and nothing moved. The demo of a size token has to be
wider than the token.

The two panes are a **basis pair**, not `grid auto`. The editor is a control rail and a rail
does not scale; the live pane is the subject and takes the rest. An even split gave the live
pane 305px at 1280 — *narrower than the same page at 400*, where the tracks stack — and
`--column` could not fix it, because the column's font is 13.5px at 1280 and 14.4px at 1920,
so an `em` track changes size along with the width it is being compared against.

Measured 400 / 1280 / 1920 / 3440: live pane 376 / 393 / 976 / 2378, no overflow, no scrollers
that were not asked for.

## Not built

- **Presence** — who else is looking, and where their caret is. It is one more path in the
  same state (`set ["here", <tab>]`) and it would cost a delta per mouse move, which is the
  first thing that would make the log expensive.
- **A lock, or a floor.** The presenter is whoever clicked last.
- **Undo.** The log is the history; nothing reads it backwards yet. Cloudflare's
  point-in-time recovery would give the same thing for free in production.
