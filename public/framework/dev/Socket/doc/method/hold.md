## Usage

**Zero callers in `public/`** — like `reload()` and `changed()`, it is invoked by name from
the server, through `message()`'s method lookup. `Server/plugins/SocketServer/LiveReload.js`
broadcasts it whenever the reload-hold's holder list changes (never on every poll tick, only
when it actually differs):

```json
{ "method": "hold", "args": [[{ "who": "sidebar-repair", "what": "batch of edits", "since": 1758300000000, "until": 1758300300000, "pid": 12345 }]] }
```

`args[0]` is empty (`[]`) the moment the hold is released.

## What it does

Stores the holder list on the instance (`this.hold_holders`) and fires a plain
`window.dispatchEvent(new CustomEvent("dev-hold", { detail: holders }))`. That is the whole
method — it never blocks a reload itself (`changed()` and `reload()` already do that, by simply
never being CALLED while the server holds the queue) and it never renders anything. The reader
is [`dev/DevBar/hold.js`](/framework/dev/DevBar/), a small readout beside the Block checkbox —
"held by \<who\>, \<n\>s" — that listens for `dev-hold` instead of importing this class, so a
UI change there never has to touch the wire.

## Necessity

The lock itself — `Server/hold.mjs`, a JSON file at the repo root, outside `public/` — is the
one thing every agent takes with `node Server/hold.mjs on|off`; nothing here needs to exist for
the HOLD to work. This method exists only so a human watching a tab can SEE that a hold is on,
the same reason `DevBar`'s Block checkbox exists beside it.

## Design

`hold_holders` is a plain array, never wrapped — `dev/DevBar/hold.js` reads `first.who` and
`first.since` directly off it. No class, no method beyond a getter's worth of storage: the
lock's real state lives server-side in the file (`Server/hold.mjs`'s own doc has the shape),
and this is a one-way readout of it, exactly like `changed()`'s relationship to the file
watcher that feeds it.

Full design and the "prove" numbers: `ai/2026-09-19/reload-hold/requirements.md`.
