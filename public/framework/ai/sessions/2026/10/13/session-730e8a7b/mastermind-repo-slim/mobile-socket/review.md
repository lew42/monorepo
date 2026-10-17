verdict: fix
1. [fix] The diff edits `Server/plugins/SocketServer/Socket.js:4-7,33` and widens the LAN gate to allow `query`. requirements.md says "the loopback guard in `Server/` stays the only command gate; do not touch it" and the fence says "Not `Server/`". Either the owner approved this separately (record that in the task log and requirements) or revert it and leave Last landed/Waiting empty on the phone, as the old notes said.
2. [fix] The change widens the security surface and needs `needs_restart` logged, since `Server/` changed. Nothing in the diff shows this was logged.
3. [note] The gate itself is tight: a LAN peer gets `query` only for `sessions` and `tasks`, and the source check reads `args[0].source`, which matches the shape `QueryClient.js:30` sends. A malformed `args` is refused, which is safe.
4. [note] `ext/Query/QueryClient.js` (lines 12-15) is outside the stated fence. Dropping its localhost regex is the right simplification, since `Socket.singleton().disabled` now decides. Note this makes every non-localhost static host try a `query` first and fall back after `disabled`; confirm `request()` returns at once there.
5. [note] The doc updates (`dev/Socket/doc/lan.md`, the Socket readme, `Server/doc/mobile-lan.md`, `live/doc/notes.md`) are consistent with one another and with the code, and the stale notes.md sentences are corrected. The proof lines are quoted in the docs, but the diff does not include the task-log measurements, so I could not verify them.
6. [note] The diff does not touch `Socket.js` (the client allowlist removal, deliverable 1). It presumably landed earlier, since lan.md already describes it.

## Requirements
- 1 client always tries — yes (per docs; not in this diff)
- 2 server side checked with a headless run — not verifiable here; the proofs are quoted in lan.md
- 3 Now view uses the stream, notes.md corrected — yes
- 4 docs updated — yes
- Fence ("Not Server/", "do not touch the guard") — no, see finding 1
## Words
- Docs are plain and short; the lan.md "rule" paragraph is long but readable.
