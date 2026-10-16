# Live: page.js and page.jsonl in one folder

**Hybrid works, with a catch.** The router finds `/live/` by importing `page.js`; it never loads a `page.jsonl` beside a `page.js` as the page itself (`core/Page/doc/loading.md`). So `page.js` draws the page and `Live.js` reads `page.jsonl` itself with `JSONL.live`, folding `log` lines and `content.add` cards (the same trick as `PageInbox`). The page tools only append lines to the file, so they work unchanged.

**Tradeoff.** A pure `page.jsonl` page would get the tools' full model for free but is not found without the parent naming it, and cannot drop the default chrome. Here `Live.js` understands only `log`, `title` and `content` add/remove; other deltas are ignored until needed.

## Why the phone stopped (2026-10-15)

The dev `Socket` only opens on `localhost`, `127.0.0.1` and `*.localhost` (an RCE guard, `framework/dev/Socket/Socket.js:51`). On the phone (LAN IP or tunnel) it is disabled, so `JSONL.live()` falls back to ONE `fetch` and never updates. Fix: `Live.js` has a `Tail` that, when the socket is disabled, asks only for the new bytes of `page.jsonl` (a `Range` request, whole lines only) every 3 s while the tab is visible, and again on becoming visible, on focus, on `online` and on `pageshow`. Off the phone the socket stream is unchanged and resubscribes from its offset after a reconnect. `?poll` on the url forces the Tail, to test it on localhost.

**Tradeoff:** off localhost this is a timer, against the stream rule, because a public stream means opening the socket to the LAN. Order: strictly by `ts`, newest first; a line with no `ts` is placed at the last `ts` seen before it, then by line order. Nothing is dropped.

## Why the phone stopped, again (2026-10-15 late)

The `Tail` fix works (headless tab over `10.0.0.135:3104`: a new line shows in 3 s). The phone tab had been opened before it landed, so it still ran the old `Live.js`, and an open tab never fetches new code. Fixes: `Tail.fresh()` reloads the tab once when `Live.js` changes (ETag), a line that names a card id now edits that card, `json` code blocks are pretty-printed and other code wraps. The old tab needs one manual refresh.

## Scrapping a rough card (the owner, by voice, 2026-10-16): considered, not now

/live only ever appends lines, so throwing away a rough card is awkward: the card stays until a `clear` blanks the whole screen. The owner is open to fixing this, but not now. Two options:
- **Rewrite the last line.** The owner's suggestion. Simple, but it is a rewrite, and the rule is to append, never rewrite.
- **A `drop` line naming the card id.** `Live.js` hides that card. History is kept, and it fits the append rule. This is the leaning, if it is built.
