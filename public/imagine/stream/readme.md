# Stream — a page edited in one window, live in every other

A page's state lives in an append-only `.jsonl` the dev server already watches. One window
appends a delta; every other window has redrawn it **6 ms** later, with no reload and no
navigation. Three demos: [the wire](/imagine/stream/wire/), [a streamed deck](/imagine/stream/deck/),
[a streamed region](/imagine/stream/blocks/).

## Use

```js /imagine/stream/wire/page.js
import { wire } from "../stream.js";

this.stream = wire("wire");                       // data/wire.json + data/wire.jsonl

this.streaming ??= this.stream.live(() => this.changed());   // subscribe once
this.streaming.then(() => this.draw());                      // first frame

this.stream.set(["headline"], "typed in another window");    // the editor's half
```

`set` / `del` / `append` each append one `{at, op, path, value}` line — the contract
`/imagine/cms/json/` defines. Read state back with `get(["a", "b"], fallback)`.

## Watch out

- **The editor does not apply its own edit** — it arrives back off the wire. One code path,
  and the server is the only orderer. [`doc/decisions.md`](/imagine/stream/doc/decisions.md)
- **An append is a whole-file write**, because `rpc:write` is the only writer the dev server
  has — which is why `Stream` carries a `confirmed`/`pending` split at all. The fix is written
  and unwired. [`doc/wire.md`](/imagine/stream/doc/wire.md)
- **Never redraw a control from state** — a control rebuilt under a caret loses the caret.
  Redraw the streamed region only.
- **Off localhost there is no socket**: `live()` degrades to one fetch and the page shows the
  last saved state, read-only. No error.
- **A hidden tab gets no `rAF`** — a headless harness that clicks one window must poll the
  other on an interval, or the wait never fires while the page works perfectly.

## More

- [Overview](/imagine/stream/) · [`doc/wire.md`](/imagine/stream/doc/wire.md) what carried it,
  the measurements, the missing append · [`doc/durable-objects.md`](/imagine/stream/doc/durable-objects.md)
  what this becomes on Cloudflare, with prices and limits ·
  [`doc/decisions.md`](/imagine/stream/doc/decisions.md) the record, and where "anything on a
  page" stops
- Files that matter: `stream.js` (the class — snapshot, replay, append, latency),
  `data/` (a `.json` snapshot and a `.jsonl` log per demo)
- Stands on: `ext/JSONL` (the replay and the socket half), `Server/plugins/SocketServer/Tail.js`
  (the push), `/imagine/decks/` (the deck machinery)
