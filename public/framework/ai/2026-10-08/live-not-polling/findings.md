# Live data, not polling — findings

## What changed
- **Sessions tab and the Dashboard's Sessions tile are now pushed.** Servex (`Servex.js`, `publish()`) appends one `{"agent": <card>}` line to `public/framework/ai/sessions/agents.jsonl` whenever an agent's card changes (state, cost, turns, context, stop time). Both pages tail it through `sessions/AgentsJSONL.js` (`watch()`), which is the one shared reader. The label now says "live — pushed as it changes". `GET /api/agents` is read once as a seed, no longer on a timer.
- Servex folds the file to one line per agent the first time it writes after a start, so it stays small. A fold is a "file shrank" event, which `live()` already handles with a reset.
- **Needs a Servex restart** to start writing (`Servex/` change). Until then the page shows the one-time `/api/agents` seed and nothing newer.

## The mechanism (deliverable 2)
- Transport: **a WebSocket** (`dev/Socket/Socket.js`). `Server/watch.js` has ONE recursive `fs.watch` on `public/`; a changed `.jsonl` goes to `Tail.changed()`, which reads from the stored byte offset and sends only the new lines (no debounce).
- **Measured latency** (headless Chromium on `monorepo.localhost`, append a line from node, time its arrival, 36 appends over 3 runs): typically **2–10 ms**. Five of the 36 arrived late, at 0.43 s, 0.63 s, 0.73 s, 1.0 s: an occasional Windows file-watch delay, not the code. Worst seen: about 1 s. So "under ~1 s" holds nearly always; it is not a hard guarantee.
- **Off localhost the socket is disabled on purpose** (it also carries `rpc:cmd`, so opening it to the LAN would be remote code execution). `live()` then IS `load()`: **a phone on `IP:port` gets one load and goes stale.** Fix applied only to this feed: when the socket is disabled, `AgentsJSONL.watch()` re-reads the small file every 5 s. A general fix (a read-only, loopback-or-LAN tail that carries no `rpc`) would help every stream; it is a security decision, so it is parked as a `Note:` on the AI board, not built.
- **Reconnect:** `live.js` chain-patches `Socket.open`, so every answered stream re-subscribes with its stored offset after a server restart and only the gap comes back (per `ext/JSONL/doc/live.md`). Not re-measured here.

## Census of pollers (deliverable 3)
Script: `census.mjs` (run `node census.mjs public/framework`), output `census.json`. Heuristic, so it lists a few false hits (`record/page.js` is a recording clock, `Session.js` is a UI timer).

Ranked conversion list, most valuable first:
1. **ai/sessions/page.js** (20 s, `/api/agents`) — DONE.
2. **ai/dashboard/page.js sessions tile** (20 s, `/api/agents`) — DONE, same stream.
3. **ai2/live.js `poll_agents`** (30 s, `/api/agents`) — already pushed by the SSE `agent_frames`; the timer is only a backup. Could switch to `AgentsJSONL` and drop the timer. Easy; left (separate fence, `ai2/`).
4. **ai2/agents.js** (10 s, `/api/card-agents`) — per-card agents; needs a per-card stream line from Servex. Same pattern as this task.
5. **ai/dashboard/page.js tasks tile** (20 s, `tasks.json`) and **ai2/live.js `poll_tasks_json`** (30 s) — `tasks.json` is a whole-file JSON snapshot; needs Servex to append a line on landing to be streamable.
6. **ai2/live.js usage** (60 s, `usage.json`) and **ai2/live.js `poll_pool`** (30 s, `/api/worktrees`), **ai2/processes.js** (10 s, `/api/processes`) — Servex state with no stream; each needs one append line per change.
7. **ext/AITask/feed.js, conversation.js** (30 s) — read a transcript with Range; a transcript is a `.jsonl` outside `public/`, so they cannot use the tail without Servex mirroring it.
8. **ext/drawer/tabs/ai.js** (1.5 s reply poll of `/api/page-ai`; chat.jsonl is already a stream) — candidate for the tail, but it is a reply wait loop; check before converting.
9. **ai2/needs.js** (20 s), **dev/DevBar/log.js** (4 s), **ai/2026-09-19/health-revive** (10 s) — dev-only or already-light.

## Not done / for the owner
- Servex restart to activate (above). Phone staleness general fix (above): `Note:` card.
