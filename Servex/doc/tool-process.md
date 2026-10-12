# Where a tool runs, and what happens when it fails

**Short answer:** an agent's tools run inside the Servex process, not inside the agent's `claude.exe`. The agent only sends a request and gets text back, so a tool bug cannot kill the agent, and an agent crash cannot kill a tool. (Written 2026-10-12 from the code; see [sdk.md](sdk.md) for how an agent starts.)

## Two processes, one door

- **Servex process** (one `node`, kept alive by `Servex/sustain.mjs`): owns the tool list (`Servex/agents/tools.js`, `page_tools.js`, `ops.js`, `jobs.js`, `experts.js`), the agent registry, and every log file. Tool handlers are plain `async` functions here.
- **One `claude.exe` per agent**: started by `Agent.spawn_claude()` (`Servex/agents/Agents.js`). It runs the model and the agent's own Bash/Read/Edit. It holds no Servex state.
- **The door between them is HTTP, loopback only.** `door()` adds an `mcpServers` entry pointing at Servex's `/mcp` (`Servex/MCP.js`) with `?as=<agent id>`, so the handler knows who called. An in-process route also exists (`server()` in `tools.js`, via `createSdkMcpServer`), but it is for hosts with no HTTP door such as `fork-proof.mjs`; the live agents use HTTP.

## If a tool throws

`MCP.call()` catches it and returns `{isError: true, text: <message>}`; the in-process `server()` does the same. The agent sees an error result and carries on. An unknown method or tool returns a JSON-RPC error. Nothing ends the session.

## If something crashes

- **A `claude.exe` dies:** `spawn_claude` writes a `process` line (`state: exited`, code, signal) to the agent's log. The registry keeps the row, so the next message wakes it with `resume: <session id>` in the original folder (the transcript is a file under `~/.claude/projects`). `Agents.revive()` does this for recently active agents on boot.
- **Servex dies:** every `claude.exe` child loses its tool door (calls fail with connection refused until it returns). `sustain.mjs` is a keeper that respawns Servex within about a second. On boot `revive()` reopens agents whose logs were written in the last 30 minutes; older ones stay asleep and wake on their next message.
- **Restart:** `node Servex/sustain.mjs --restart` loads new code. On Windows it relaunches itself through WMI so the restart is not a child of the caller ([restart.md](restart.md)). Changes under `Servex/` need it; nothing else does.

## Does the server read a page through a real instance?

No. `page_read` re-reads `page.jsonl` from disk on every call and replays it with a small, partial reducer in `page_tools.js` (`parse_lines`, title, content one level deep). There is no `Page` object and no DOM in node. `page_set/add/call` append one line to the same file, which every open tab tails. Consequence: a rendering rule in `core/Item` that the reducer does not copy is invisible to `page_read` (the reducer keeps compat for the old and new wire shapes only).

## Why this matters for skills

Because tools live in the Servex process, a rule can be **enforced** there (a tool refuses, or does the step itself) instead of **requested** in prose. See `public/framework/ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/recommendation.md`.
