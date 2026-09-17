# Importance — what matters most inside a topic, ranked by pairwise judgment

Humans and bots propose questions, options and caveats under a topic, then answer one
question over and over — *which of these two matters more?* — and the ranking falls out of
the answers. Importance is always relative to a **context**, so the same question can rank
first under one topic and last under another. The data is three committed `.jsonl` files,
so git history is the audit trail. A judgment cast in one window is on screen in every other
open window **9 ms** later, with no reload.

## Use

Two screens, and the second is the whole contribution loop.

```
/imagine/importance/                  you are at a node; its children, ranked, with the counts
/imagine/importance/?at=c1            a node reached from two topics says so, and opens both
/imagine/importance/judge/?at=car     two items, "which matters more?", ← → or 1 2
```

From the command line — the same rows a click writes, into the same files:

```bash
node public/imagine/importance/importance.mjs rank    --context car
node public/imagine/importance/importance.mjs propose --kind question --text "Is the timing belt done?" --author bot_7 --context car
node public/imagine/importance/importance.mjs edge    --src c1 --rel qualifies --dst q5
node public/imagine/importance/importance.mjs judge   --context car --a q1 --b q2 --winner q1 --judge bot_7
node public/imagine/importance/importance.mjs check
```

## Watch out

- **One caveat under two topics is ONE node with two edges, never a second node with the
  same words** — copies drift, and each copy carries half the judgments. `importance.mjs edge`
  is the verb; the context view marks the node *also in …*. [`doc/decisions.md`](./doc/decisions.md)
- **Judgments are append-only** — there is no edit and no delete path in the code. A bad row
  is answered by a later row (`retracted`) or by dropping that judge's `weight` to 0.
  [`doc/storage.md`](./doc/storage.md)
- **A node nobody has judged says "unranked", never 0%** — 0% is a real score somebody
  earned by losing. The count always travels with the number. [`doc/scoring.md`](./doc/scoring.md)
- **`winner` holds a node id**, not the literal `"a"`/`"b"` the owner's table shows; the
  reader accepts both. [`doc/storage.md`](./doc/storage.md)
- **The writer does not apply its own line** — it arrives back off the wire like every
  other window's, so the server is the only orderer. A page that writes must therefore be
  subscribed to what it writes to. [`doc/live.md`](./doc/live.md)
- **A control is never inside the streamed region** — `.imp-live` is emptied and rebuilt on
  every batch; the reason field, the judge name and the propose form sit outside it, because
  a control rebuilt under a caret loses the caret. [`doc/live.md`](./doc/live.md)
- **Writing needs the dev server** — `rpc:append` only exists on localhost, and only on a
  server started after 2026-08-31. Off localhost `live()` *is* one fetch, both pages are
  read-only and say so, and nothing about the static host changes.
- **A judge card shows no score until you pick** — a pair that arrives carrying "100% of 3"
  against "0% of 1" has printed the answer on the question. Both scores appear the moment
  the pick is in, and the next pair waits behind a control. Not missing data.
  [`doc/decisions.md`](./doc/decisions.md)
- **The pick keys judge from the name box, and are text in the reason box** — `1 / 2 / ← / →`
  are swallowed where you type your name (the digit used to land in the name and reach the
  committed file as the judge); the reason line is prose, so a `2` there is a 2.
  [`doc/decisions.md`](./doc/decisions.md)
- **Nothing you READ here looks like a `<button>`** — the ranked names, the two choice cards
  and the rank are `tap()` spans, because the site's skin makes a real button uppercase and
  boxed, which would shout a question you are meant to read. The things that ACT — `Add`,
  `Next two` — are real buttons. [`doc/decisions.md`](./doc/decisions.md)

## More

- [Overview](/imagine/importance/) · [Docs](/imagine/importance/doc/) ·
  [`doc/storage.md`](./doc/storage.md) the format and the shard rule ·
  [`doc/scoring.md`](./doc/scoring.md) the swappable formula ·
  [`doc/live.md`](./doc/live.md) two windows, 9 ms, and the caret rule ·
  [`doc/decisions.md`](./doc/decisions.md) the record and what was left
- Files that matter: `Graph.js` (the three collections, the edges, the one `score()`),
  `importance.js` (the browser's fetch + socket half), `importance.mjs` (the bot's fs half),
  `views.js` (the three screens), `data/` (the car example, committed)
