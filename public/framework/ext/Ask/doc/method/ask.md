One turn of a Claude Code session, resolved as `{ text, session_id, cost_usd,
duration_ms }`. Every other export in this module is a variation on this one
RPC — `chat()` calls it per message, `vision()` calls it with a locked `tools`,
the dev rail calls it with a `task`.

## What it guarantees, and what it doesn't

It **rejects synchronously** off localhost (`socket.disabled`) rather than
sending a doomed request — `available()` is the pre-flight for a caller that
wants to skip the UI entirely rather than catch. It does **not** retry, queue,
or dedupe: two calls against the same `resume` id race at the server, and the
second one loses with `"That session is mid-turn."` (`Server/plugins/Ask.js`'s
`turns` map). A caller juggling more than one in-flight turn per session has to
serialize it, not `ask()`.

## `on` streams tokens, not structure

`opts.on` receives `{text}` for prose and `{tool}` for a tool-use event, fired
from `Socket.prototype.ask_event` as the server relays `stream-json` lines. It
is the *only* signal before the final resolve — there's no separate "turn
started" event, so a caller has to treat the first `on` call as "it's alive."

## `shot` is rewritten, not passed through

A string `shot` is upgraded to `{url: location.href, selector}` before the
request goes out — so `{ shot: ".chat-form" }` and `{ shot: {url:
location.href, selector: ".chat-form"} }` are the same call. Passing an
explicit `{url, selector, width, height}` reaches any other page, including one
this tab never opened.

## Improvements

1. **No timeout.** A hung `claude` process (network stall mid-turn, a runaway
   tool) leaves the caller's `await` pending forever — there's no client-side
   deadline and no way to cancel from the browser. A `signal`/`AbortController`
   plumbed through `socket.request()` would let a caller give up. *(medium,
   important — this is the sharpest gap in the module.)*
2. **The `id` in `listeners` is never cleaned up on a thrown `request()`** if
   the throw happens before the `try` — it doesn't, currently, since the
   `try/finally` wraps the whole call, but the shape is fragile: a future
   refactor that moves the `crypto.randomUUID()` or the `listeners.set` outside
   the `try` would leak a listener silently. *(simple, useful — a comment or a
   test would catch it before it happens.)*
3. **`opts.on` is deleted from the object sent over the wire** (`on:
   undefined`) but the rest of `opts` — including a caller's own extra keys —
   goes through unvalidated to the server, which spreads it into `turn()`.
   Harmless today because `turn()` destructures only what it knows, but it
   means a typo'd option (`tool` instead of `tools`) fails silently rather than
   erroring. *(simple, speculative.)*
