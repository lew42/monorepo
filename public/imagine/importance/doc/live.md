# Live — two windows, 9 ms, and the caret rule

The owner's brief is humans and bots judging **together**. Two people at the same topic have
to see each other's picks land, so a judgment written in one window is on screen in every
other open window without a reload and without either of them being touched.

Measured on a private dev server, two independently-subscribed windows: **9 ms** from the
keypress in one to the ranked list changing in the other. That is the same number
[`/imagine/stream/`](/imagine/stream/) measures, because it is the same wire.

## How it works — three files, three subscriptions

`Store.open()` makes one `Rows` stream per file — `nodes.jsonl`, `edges.jsonl`, and one per
month shard — and calls `ext/JSONL`'s `live()` on each. The dev server's
`Server/plugins/SocketServer/Tail.js` pushes every appended line to every socket subscribed
to that path; `Store.arrived()` rebuilds the three collections and tells the pages.

`Rows` is nine lines. `ext/JSONL` is built for **verb** lines — `{"assign": {…}}` replayed
onto one object — and these files are flat records, so `apply()`, the single seam every line
passes through, is the entire translation:

```js
class Rows extends JSONL {
    rows = [];
    apply(row){ this.rows.push(row); return this; }
    reset(){ this.rows = []; return super.reset(); }
}
```

Everything else comes along unwritten: the tolerant parse, the content-type guard against
the SPA fallback, the offset bookkeeping, the re-subscribe on reconnect, and the reset when
a file is rewritten rather than appended to.

**Off localhost there is no socket and `live()` *is* `load()`** — one fetch per file, the
page read-only. That is why this is one code path and not two, and why nothing about the
static host changed.

## The three rules this cost us

**1. The writer does not apply its own line.** `append()` sends the line and then *waits for
it to come back*, exactly like every other window. One code path, and the server is the only
orderer — [`/imagine/stream/`](/imagine/stream/doc/decisions/) learned this the expensive way
and it is copied here rather than rediscovered. The one concession: if no frame carrying the
row has arrived in two seconds, the writer applies it itself and says so in the console. A
click that did nothing is the worst failure this page has, and on a working dev server that
timer never fires.

**2. A control is never inside the streamed region.** The context view is two boxes:
`.imp-live` — the trail, the head, the counts and the ranked list — which is emptied and
rebuilt on every batch, and the propose form, which sits outside it and is never rebuilt.
The judge screen is the same split: the two choice cards and the tally line refresh; the
reason field and the judge field do not. A control redrawn under a caret loses the caret and
whatever was half-typed into it.

Proven, not assumed: with a half-typed reason in one window and a half-typed proposal in
another, a third window judged. Both fields still read their full text, both carets still sat
at the end, both were still focused, and both streamed regions had updated 7 ms earlier.

**3. Somebody else's judgment does not move the pair under your hand.** Every judgment
arrives the same way, so the only thing that tells mine from theirs is that *my* append came
back accepted. My own pick advances to the next pair. Somebody else's re-reads the two
scores and rewrites the tally line, leaving the same two items in front of me — and judging
the pair another window just judged is two rows, which is the point.

## Two details that are easy to get wrong

**A month with no file is not an error.** `Tail.subscribe()` answers a missing file with an
empty batch and *leaves the subscription standing*, so the first judgment of a new month
streams to every open window the moment it is written. Nothing needs to notice the month
turned over. The one hole that leaves — a window open *across* the boundary, writing to a
shard it never subscribed to — is closed by `Store.feed()`, which subscribes on demand and
is idempotent.

**One propose is two appends.** The node and its edge are two lines in two files and each
answers with its own frame. `arrived()` coalesces them through a microtask, so the list
redraws once, and never in the state where the node exists but its edge does not.

## Testing it

A hidden tab gets no `rAF`, so a harness that clicks one window must **poll** the other on an
interval from the driver — `waitForFunction`'s default would wait forever while the page
works perfectly. The two scripts that prove this live in the session scratchpad, not the
repo: one drives two windows and shoots them side by side, the other types into two controls
and has a third window judge.
