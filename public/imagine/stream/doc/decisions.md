# Decisions — streaming pages

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

The cost is that a keystroke is a round trip. At 6 ms nobody can tell; the text inputs are
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

**That entire mechanism exists because there is no append RPC.** The file that removes it is
written and unwired: [`wire.md`](./wire.md) has it and the two lines that land it.

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

- **An append RPC, wired.** One unwired file was the fence; the wiring is a proposal.
- **Presence** — who else is looking, and where their caret is. It is one more path in the
  same state (`set ["here", <tab>]`) and it would cost a delta per mouse move, which is the
  first thing that would make the log expensive.
- **A lock, or a floor.** The presenter is whoever clicked last.
- **Undo.** The log is the history; nothing reads it backwards yet. Cloudflare's
  point-in-time recovery would give the same thing for free in production.
