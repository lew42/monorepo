verdict: fix
1. [fix] Step 1 of "Try it" (`public/framework/ux/Dictate/doc/voice-bridge.md`, the new section) tells the owner to paste a bearer token into the Claude app. As far as I know, the claude.ai "Add custom connector" dialog asks only for a URL, plus an optional OAuth client ID and secret; it has no field for a static header. If that holds, the owner's first step cannot be done and the tool is never reached. The simplest fix is to put the token in the URL's path (`/mcp/remote/<token>`), have `Tunnel.mjs` write that full URL to `remote.url`, and keep the header check as a second way in. At the very least, the doc must name this as the first unknown.
2. [fix] `Servex/ext/remote/RemoteMCP.js:88-92` re-reads the mastermind's `task.jsonl` (under `public/`) every 500 ms for up to 60 s. On Windows, a file READ fires an fs.watch change (the old reload-on-read lesson), so each voice question can set off about 120 change events on the live site's watcher. Poll a file outside `public/`, or listen for the reply on the Servex event stream rather than polling the file. This also follows the "stream, don't poll" rule in CLAUDE.md.
3. [note] `RemoteMCP.js:76` picks "the first live agent whose id starts with `mastermind`". That can be `mastermind-servex`, the systems architect, rather than the run mastermind, and `task-mastermind-*` ids never match. Which agent answers depends on list order, so name the target role explicitly.
4. [note] `RemoteMCP.js:84`: when `task_dir_for` returns an absolute path (the heartbeat's `find_task_dir` can), the "busy" link comes out as `/C:/Code/...` and is not a site URL. Make the path relative to `root` first.
5. [note] Nothing proves the tests ran. This task's `task.jsonl` holds only its `assign` line: there is no curl log (401 / one tool / a round-trip), no landing line and no card update, though the requirements ask for all of them (ask 1's test, ask 4).
6. [note] `Server/Tunnel.mjs` keeps the gateway inside the `up` process, so `up` runs in the foreground and the tunnel dies when its terminal closes. Using a gateway rather than pointing cloudflared at the path is the right call, since cloudflared forwards every path. But the doc should say "leave this terminal open". It also departs from the brief's literal command, and neither the doc nor the log says so.
7. [note] Good: the `/mcp/remote` route is mounted after `guard()`, so it still answers loopback only, and the tunnel's gateway reaches it over 127.0.0.1. The token is compared in constant time and never logged. `Servex.js` changes by exactly the one registration line plus its import.

## Requirements
Widths: none given (no page changed; light review).
- 1 "RemoteMCP: /mcp/remote, three hand-written methods, bearer token in remote.token, ask_mastermind, 60 s wait, one log line per call, curl-tested" — partly. The code is all there (`RemoteMCP.js`), but there is no evidence of the curl tests (finding 5), and it polls a file rather than streaming (finding 2).
- 2 "Tunnel.mjs up/down/status, URL printed once and written to remote.url, only /mcp/remote reachable" — yes. The gateway 404s every other path (`Tunnel.mjs:25-26`).
- 3 "The owner's two steps in voice-bridge.md 'Try it', the unknowns named" — no. Step 1 assumes a bearer-token field the connector dialog likely lacks (finding 1). The voice-mode unknown is named.
- 4 "Card, landing line, merge, restart, tunnel up, steps on the card" — not done yet. There is no landing line in `task.jsonl` (finding 5).
## Words
- The "Try it" section is short and plain, and its two steps are numbered — yes.
- The unknown is stated together with what to look for — yes.
- The token's location is named and the token itself never appears — yes.
