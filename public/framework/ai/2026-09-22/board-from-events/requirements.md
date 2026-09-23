# board-from-events — a Servex-hosted agent appears on the board without anyone writing a card

Minion: Sonnet, effort high. Session id `49dfc8b4-d179-4c67-a735-3c9738452615`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then phase-2 item
**5** in [`../tiers-design/doc/phases.md`](../tiers-design/doc/phases.md) and the fold on
[`../log-model/`](../log-model/) (its `fold.js` runs in the browser). Load `code`, `layout`,
`css`. Private port **8099**. The page you own is `/framework/ai/v/3/` — nobody else is on it
(days-view and worktree-proof both landed; read `days-view`'s task log for what the Days view
does and `v/3/readme.md` for the view switch).

## What exists

Servex is RUNNING on `127.0.0.1:8090`: `GET /agents` is the registry (`{id, role, name,
topics, page, state, visibility, session_id, started_at, parent}`), `GET /api/stream` is
server-sent events carrying every agent event as it happens (`Servex/Stream.js`;
`Servex/public/servex.js` is a working browser client to copy from), `GET /log/agent-<id>?n=50`
is an agent's typed events (`transcript delta tool result agent_msg subagent error`), with CORS
on `/log`. If `/agents` or `/api/stream` lack CORS, the smallest fix is yours to make in
`Servex/Servex.js` (Edit only; `cors` middleware already exists there at the `/log` route) and
Servex restarts with `node Servex/sustain.mjs --stop` then the hidden launch (`powershell
-NoProfile -Command "Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs'
-WorkingDirectory 'C:\Code\lew42\monorepo' -WindowStyle Hidden"`); never `cmd /c start`.

## Deliverables

1. **An Agents strip on `/framework/ai/v/3/`** — on every view, under the view switch: one
   small row per live agent from `GET /agents` (id, role, state, a running turn count), pushed
   live from `/api/stream`; when Servex is not answering, the strip is absent, nothing errors
   (the owner's board must load with Servex down — prove it). Click a row → the agent's
   transcript, streaming: `delta` events appended as they arrive, `tool` lines as one quiet
   line each, `agent_msg` as a highlighted line naming `from`, `result` as the closing line
   with cost. Smallest thing that works, in the house `View`; no new CSS class without
   `new-css-class`; reuse `v3.css`.
2. **A landed agent becomes a card, with no human writing it.** When an agent with `role:
   minion` or `task-mastermind` emits its final `result` (state `stopped`), the board shows a
   card in the timeline/days data with the agent's last transcript text as its text and its
   id as the title — folded from the events (the log-model fold's `task`/`transcript` rule),
   not written to `board.jsonl` by the browser. Decide in a `decision` line whether the fold
   runs in the browser (over `/log/agent-<id>`) or whether Servex should append a `card` event
   to its own log that the board reads — and do the browser one now unless it is clearly
   wrong; the other is the alternative.
3. **Proof:** with Servex up, spawn one Haiku agent through the MCP from a `claude -p` turn
   (recipe in the run ledger; `--strict-mcp-config` against `http://127.0.0.1:8090/mcp`) whose
   job is to count to thirty slowly; load the board headless on 8099 and screenshot the strip
   with tokens arriving (`shots/`), then after it lands, screenshot the card. Then stop Servex
   is NOT allowed (it is live for other minions) — instead prove the Servex-down path by
   pointing the strip's base URL at a dead port in a test flag and loading the board: zero
   console errors. Row count in the strip = rows in `GET /agents` with state ≠ stopped.

## Fence

`public/framework/ai/v/3/**` (not `board.jsonl`), `Servex/Servex.js` for CORS only (Edit),
your task dir. Append-only to `.jsonl`. Take the reload hold for the v/3 batch; release after
the headless load passes.

## Length

Aim under 200 new lines. Landing report: six sentences, two screenshots.
