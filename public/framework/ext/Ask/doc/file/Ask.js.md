The browser side of the bridge: four exported functions (`ask`, `available`,
`thread`, `start`) plus the wiring that lets the server call back into a
running page. Everything else in the module — `chat.js`'s panel, every real
caller — is built on these four; there's no fifth way to reach the dev
socket's `ask`/`thread`/`start` RPCs.

## `Socket.prototype.ask_event` — patched, not declared

Line 7 assigns a method onto `Socket`'s prototype from **outside** `Socket.js`
itself: `Socket.prototype.ask_event = function(e){ … }`. This is the one
place in the module that looks like dead code to a grep — nothing in `public/`
calls `.ask_event(...)` directly, because the caller is the dev server,
through `Socket.message()`'s `this[data.method](...)` lookup. Same live path
`Socket.reload()` uses. Worth knowing before "cleaning up" an apparently
unused method.

## The `listeners` map is the only module-level state

One `Map<id, callback>`, scoped to the module, holding an `ask_event` handler
per in-flight streamed turn. `ask()` sets one before sending, deletes it in a
`finally` after the request resolves — so a thrown request still cleans up.
There's no cap and no timeout on an entry that's never deleted because its
`request()` never resolves; see the `ask` method doc for that gap.

## Three RPCs, one shape of guard

`ask()`, `thread()`, `start()` each open with the identical `if
(socket.disabled) throw …` — copy-pasted, not shared. Small enough that it's
not worth a helper yet, but it's the same three lines three times.

## Improvements

1. **No timeout or cancellation on `ask()`'s underlying request.** Covered in
   full on [the `ask` method page](/framework/ext/Ask/api/ask/) — noted here
   because it's this file's single biggest gap. *(medium, important.)*
2. **The three `if (socket.disabled) throw` guards could be one `function
   guard(name)` helper** — three lines become one, and a fourth RPC added
   later gets it for free instead of a fourth copy. *(simple, useful — purely
   cosmetic, no behavior change.)*
3. **`Socket.prototype.ask_event` patching a class from a different module's
   file is exactly the kind of coordination `CLAUDE.md`'s "No black magic"
   rule is written against** — except this one is *visible*: it's a top-level
   statement in the file a reader would open, with a comment naming the trap.
   Nothing to fix; noted because it's the one line in this file most likely to
   look wrong on a skim. *(n/a — already handled correctly, flagged for
   awareness only.)*
