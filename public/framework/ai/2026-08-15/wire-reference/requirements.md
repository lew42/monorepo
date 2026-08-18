# wire-reference

## The ask, verbatim

> create a better version of this socket docs wire. maybe MCP? let's try to
> exemplify what the claude MCP can do... what can it do? the mcp connects to
> the server, not the browser, right?

Rewrite `public/framework/dev/Socket/doc/wire.md` as THE wire reference for
the whole ai-server stack — and prove every claim with evidence captured LIVE
through the `mcp__site__` tools. The doc should teach the relay in one look:

    Claude → HTTP POST /mcp → dev server → WebSocket → live tab → back

## What "better" means

1. **The map first.** The relay diagram above, then who speaks on each hop:
   MCP tools (`pages`/`eval`/`shot`) on the HTTP hop; every socket frame
   (`changed`, `jsonl`, `jsonl_reset`, `subscribe`, `unsubscribe`, `hello`,
   `eval`, `eval_result`, `reload`, plus the request/index reply shape) on the
   ws hop. Current wire.md already tables the frames — keep what is right,
   restructure for the map-first read.
2. **Every frame shown with a REAL captured example**, not an invented one.
   Capture via `mcp__site__eval`: install a temporary tap in a live tab
   (`window.__tap=[]; Socket.singleton?… or the page's socket — read
   Socket.js first`), trigger real traffic, read the tap back, uninstall it.
   The self-referential flourish is encouraged: your own edit to `wire.md`
   produces a `changed` frame in a tab that loaded it — capture that frame and
   put it in the doc as its own example.
3. **The MCP hop documented as part of the wire** — the JSON-RPC shapes
   (initialize / tools/list / tools/call), the loopback fence as the security
   model's second gate, and one worked `eval` round trip shown end to end
   (HTTP request → ws frame → eval_result → HTTP response).
4. **Honest limits list**: eval's 10s timeout, hello staleness self-heal, the
   brand-new-dir chokidar note, tabs predating the handshake invisible to
   `pages`, `shot` photographing a fresh load rather than the live tab.

## Files you own

`public/framework/dev/Socket/doc/wire.md` (the rewrite), minimal touch-ups to
`dev/Socket/readme.md` / `page.js` ONLY if the restructure demands a link or
description change, and your task log. Nothing else — no code changes, no
Server/ edits. If capturing evidence requires a scratch file to trigger a
frame, use an edit to wire.md itself or a file in the OS temp scratchpad —
never a new repo file.

## Verification bar

Load `/framework/dev/Socket/doc/wire/` at 1600 in the live server: zero
console errors, no `.md-error`, no horizontal overflow, every fenced example
verifiably from your captures (log the capture in task.jsonl as you take it).
Leave every tap uninstalled (eval a cleanup; confirm by re-reading).

## House rules

CLAUDE.md rules over everything. documentation skill before finishing; its
"never cite a line number" rule applies. Keep the doc one coherent read —
tables for frames, prose for the why. Hooks now log your edit actions
automatically — hand-write only `log`/`now`/`assign` judgment lines.
