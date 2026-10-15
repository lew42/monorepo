# Live: page.js and page.jsonl in one folder

**Hybrid works, with a catch.** The router finds `/live/` by importing `page.js`; it never loads a `page.jsonl` beside a `page.js` as the page itself (`core/Page/doc/loading.md`). So `page.js` draws the page and `Live.js` reads `page.jsonl` itself with `JSONL.live`, folding `log` lines and `content.add` cards (the same trick as `PageInbox`). The page tools only append lines to the file, so they work unchanged.

**Tradeoff.** A pure `page.jsonl` page would get the tools' full model for free but is not found without the parent naming it, and cannot drop the default chrome. Here `Live.js` understands only `log`, `title` and `content` add/remove; other deltas are ignored until needed.

## Why the phone stopped (2026-10-15)

The dev `Socket` only opens on `localhost`, `127.0.0.1` and `*.localhost` (an RCE guard, `framework/dev/Socket/Socket.js:51`). On the phone (LAN IP or tunnel) it is disabled, so `JSONL.live()` falls back to ONE `fetch` and never updates. Fix: `Live.js` has a `Tail` that, when the socket is disabled, asks only for the new bytes of `page.jsonl` (a `Range` request, whole lines only) every 3 s while the tab is visible, and again on becoming visible, on focus, on `online` and on `pageshow`. Off the phone the socket stream is unchanged and resubscribes from its offset after a reconnect. `?poll` on the url forces the Tail, to test it on localhost.

**Tradeoff:** off localhost this is a timer, against the stream rule, because a public stream means opening the socket to the LAN. Order: strictly by `ts`, newest first; a line with no `ts` is placed at the last `ts` seen before it, then by line order. Nothing is dropped.
