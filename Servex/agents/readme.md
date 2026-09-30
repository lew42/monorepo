# agents — Claude sessions Servex holds open

A Claude session cannot talk to another Claude session. It can start one, but the child owns
its own stdin, so from that moment the parent can only wait for the answer. That is why
"tell a sidebar session to be the mastermind and hope" is all we have had.

Servex holds the sessions instead — one `Map` inside one long-running process — and
**spawning, messaging and interrupting them are MCP tools**, so any Claude session anywhere
can steer a running agent by calling a tool. See it:

```
node Servex/agents/demo.mjs
```

A Haiku agent counts to 300 and its tokens arrive in your terminal as it thinks. Mid-sentence,
a message from somebody else cuts in and it answers them by name. A second agent joins, both
are listed, the first is interrupted, and a third runs `node --version` and writes the answer
to a file. About ninety seconds and $0.09, nothing mocked.

## Use

```js
import agents from "./Agents.js";

const a = agents.spawn({ role: "minion", name: "servex-port", prompt: "Read Servex/ and …" });
agents.send(a.id, "stop and tell me what you found", { from: "mastermind-servex", reply_to: "log agent-host" });
agents.interrupt(a.id);
agents.list();
agents.stop(a.id);
```

`spawn` also takes `model`, `effort`, `cwd`, `visibility`, `permission_mode`, `allowed_tools`.
It opens an SDK `query()` in **streaming-input mode**: the prompt is an async iterable we
never finish, so one `query()` is a session that stays alive between turns instead of ending
after its first answer.

The same verbs are MCP tools, and so are these. Proofs anyone can run show them working:
`fork-proof.mjs`, `revive-proof.mjs` and `wake-proof.mjs`.

- **Resume or fork a spawn.** `spawn({ resume: <session uuid>, fork: true })` opens with that
  whole conversation. Without `fork` it continues the same session; with it, it continues as a copy.
- **`fork_self({question})`** asks a copy of yourself one question in the background, and returns
  at once. The copy answers once, stops itself, and its answer reaches you as `fork answer: …`.
- **`wait_for_agent({id})`** returns when that agent's turn ends (or it stops), with what it said.
  It is for callers with nobody to wake them, such as a VS Code tab.
- **`start_job` / `job_result`** hand read, grep, watch, check or decide work to node and answer
  later as a message: [`doc/jobs.md`](./doc/jobs.md).
- **`restart_servex`, `pause_dispatch`, `resume_dispatch`** are the operator switches in `ops.js`.
- **Agents survive a Servex restart.** At boot, `revive()` reopens every agent the last boot
  left open, under the same id and session. One that was mid-turn is told so.
- **Stop idle agents freely** (each one held open costs about 250 MB). A message to a stopped
  agent, or to one that exists only in the registry, wakes it first: the same id, its session, and
  the spawn `spec` its registry row keeps. Forks are never woken. Proof: `wake-proof.mjs`.
- **Nothing revives what was ended on purpose.** Every path that reopens an agent (a message, a
  child's report, the boot revive, the heartbeat) asks one guard, `Agents.blocked(row)`, and skips
  an agent that `stop_agent` stopped (its row keeps `stopped_by`), one whose task has landed, and
  one whose directory is gone (said plainly, not as the SDK's "libc" error). `send_to_agent` with
  `revive: true` overrides the first two. Proof: `revive-guard-proof.mjs`.
- **The session id is known at spawn.** Servex mints it and passes it as `sessionId`, so even an
  agent whose host died during its first turn can be resumed.

`send` wraps your text so the agent can see who asked and where the answer goes —

```
[from: mastermind-servex · reply to: log agent-host]
stop and tell me what you found
```

Plain text on purpose: the agent has to understand it with no schema and no training. The
message **waits its turn** by default; `{priority: "now"}` cancels what the agent is saying
and lands immediately. `interrupt` stops it mid-sentence and leaves the session idle and
alive. `stop` ends it, and it stays listed as `stopped`.

## Module experts — ask the agent that has already read it

A module with an `expert.json` has an **expert**: a session that read the module once (its readme
chain and key files) and is kept as a checkpoint. `ask_expert({module, question})` forks it, so the
answer comes from a clean, cached context in seconds, and rebuilds it first if a file it read has
changed. `load_module({modules})` returns the same reading for any session to load in one call.
[`doc/experts.md`](./doc/experts.md) has the recipe, the verbs and the measurements.

## Ids are words, never uuids

`<role>-<name>` — `minion-servex-port`, `mastermind-servex` — with `-2` for a collision. That
is how you address an agent and what its log is named after. The SDK's session uuid is kept
as `session_id`, so `claude --resume <uuid>` still reaches the same conversation.

## One typed event per SDK message

Each agent has its own JSONL at `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`, written
through [Servex's single writer](../Log.js) — the same object every dev server and every
`POST /log/<name>` goes through, so two writers can never tear a line. Every line is
`{at, agent, type, …}`:

| type | what it is |
|---|---|
| `transcript` | a complete thing the agent said |
| `delta` | one token chunk, as it arrives — what a UI streams |
| `tool` | a tool call: the name, and a glance at its input |
| `result` | a turn ended: `ok`, `cost`, `duration_ms`, `turns`, `queued` |
| `agent_msg` | a message injected from outside, with `from` and `reply_to` |
| `subagent` | text from an agent this agent started itself |
| `error` | the session or a turn failed |

Raw Claude transcripts are not copied here — they live in the SDK's own session store outside
the repo. This is the projection a dashboard reads.

## The four seams

- **`Agents.store()`** is where the writing goes. Servex hands its own `Log` in
  (`new Agents({ log: servex.log })`) so every agent line joins the single writer; a host built
  without one makes its own, which is what `demo.mjs` does.
- **`Agent.log(entry)`** is still the only thing that writes — one line, through `store()`.
- **`tools(host)`** in `tools.js` builds all sixteen agent tools (its own seven, plus `ops.js`,
  `jobs.js` and the four module-expert tools in `experts.js`) against the host you give it,
  `{name, description, inputSchema, schema, handler}` — what `servex.mcp.tool(tool)` takes.
  It is a function, not a constant, so the handlers close over the host that is really running:
  `for (const tool of tools(servex.agents)) servex.mcp.tool(tool);`
- **`Agents.watch(event, agent)`** sees every event from every agent on its way to disk.
  Servex overrides it to push the event to the dashboard (`Servex.Agents`, `Stream.js`);
  `demo.mjs` overrides it too, and that override is the demo's entire user interface.

## An agent can hire agents

Every agent Servex spawns is handed Servex's own `/mcp` url two ways — `Agent.door()` puts it
in the SDK's `mcpServers` (with `?as=<its id>`, so every tool knows who is calling), so Servex's tools are simply in the agent's own tool list, and in
`SERVEX_MCP` in its environment, so anything it shells out to can pass `--mcp-config`. A
minion can call `spawn_agent` itself, and the child lands in the **same** registry:
`list_agents` from anywhere sees both. Proven 2026-09-22 — `minion-foreman` created
`minion-helper` and both were listed and stopped from outside.

`strictMcpConfig` is deliberately **not** set: it would mean "these servers and nothing else",
throwing away the project's own MCP servers an agent may need. Servex's door is added beside
whatever it already has.

**A mastermind that spawns masterminds** works the same way — the host does not care what
`role` a caller asks for. `card()` carries `parent`, so the dashboard can draw the tree.

## The wake

A child with a `parent` gets ONE message when its turn ends, it is stopped mid-turn, or it errors —
`Agents.wake_parent(child, kind)`, called from `Agent.emit()` on every `result` and `error`
event, never from `watch()` (Servex overrides that one for its own dashboard stream, so anything
placed there would stop running the moment Servex became the host). The body is `done: <the
child's last words, first 300 chars>`, `blocked: …` (its last words started with `BLOCKED`), or
`error: …`, wrapped `{from: <child id>, reply_to: "log agent-<parent>"}` and queued behind
whatever the parent is doing — never lost, never left for anyone to poll. Off with
`SERVEX_DISABLE_WAKE=1` or `{ no_wake: true }` on the host, which is how
[`sub-mastermind-live`](/framework/ai/2026-09-22/sub-mastermind-live/) reproduced the old parking
bug before proving the fix.

## Roles and the registry

`spawn_agent({role})` looks `role` up in [`roles.js`](./roles.js) — every row is on
[the roles page](/framework/ai/2026-09-22/tiers-design/doc/roles.md), reconciled 2026-09-29 with
the per-voice-session pair (`session-fast`, `session-smart`) and the not-yet-built directory
mastermind; "manager" and "master assistant" are retired words there now — for the skill it loads
before the agent's first turn (`minion` → the `minion` skill, and so on) and the
model/effort/permission-mode a caller doesn't name; a caller's own fields always win. Every
spawn and every state change writes `{id, role, name, topics, page, state, visibility,
session_id, started_at, parent}` to `registry.json` next to the logs — `GET /agents`,
`list_agents`, and `say.mjs state`'s `MASTERMINDS` block all read it, which is how any of them
still sees an agent after Servex restarts and its in-memory `live` Map is empty again — and
appends the same row to `servex.jsonl`.

## The assistant layers — every card has its own agents

Each card gets its own **assistant** (`assistant-<card>`, answers in seconds) and its own
**manager** (`manager-<card>`, plans the work and starts minions). A **master assistant** and
`mastermind-servex` watch across all cards. Every agent speaks under its own id, and
`send_to_agent` and `spawn_agent` check [`policy.js`](./policy.js) for who may message or spawn
whom. Everything about it: [`doc/layers.md`](./doc/layers.md).

`assistant-fast` (`Assistant.js`, `assistant.md`) is the lobby: it answers words spoken with no
card. `SERVEX_NO_ASSISTANT=1` boots without it.

## A fresh, directory-bound agent starts with its readme chain

A FRESH spawn whose directory is named (`task: {dir}`, or `page`) gets the
readme.md chain from the repo root down to that directory prepended to its
first message, so it knows "where it is" before it does anything — the owner's
own ask, 2026-09-29. `readme-chain.js`; the seam, the token cap, where it's
wired in and left out: [`doc/readme-chain.md`](../doc/readme-chain.md).

## The Dispatcher — a card becomes a task mastermind

When the assistant decides a sentence asked for something built, fixed, changed or looked
into, its card carries `route: "task"` and a `task` line follows it, `state: "queued"`.
[`Dispatcher.js`](./Dispatcher.js) watches the same `prompts` log for exactly that (the same
`append` event `Assistant.listen()` hangs off) and spawns a `task-mastermind` agent — Sonnet,
effort medium, a deliberate override of this role's own Opus default while this whole feature
runs in budget mode. At most two run at once; the rest wait queued. It is registered itself as
a fake "parent" agent (`id: "dispatcher"`, just a `.send()`) sitting in the same `live` map real
agents do, so a child's wake — `wake_parent`'s `done`/`blocked` — reaches it with no polling and
becomes one more `task` line, `state: working | blocked | landed`, which is what the card's
status strip on `/framework/ai2/` and `/framework/ai/talk/` reads.

## Watch out — [`doc/traps.md`](./doc/traps.md) has the measurements

- `result.result` is not reliably the last thing the agent said; read `transcript` events.
- An agent is not idle just because a turn ended — check `queued`, and wait for the first
  token before waiting for silence.
- `query.close()` alone leaks the `claude.exe` child; `stop()` also aborts.
- An injected message competes with the standing prompt: leave the first prompt room to be
  steered.
- A spawned agent loads this repo's `CLAUDE.md` and hooks by default. `setting_sources: []`
  for a cheap, isolated one.
- A fork reuses the prompt cache only when it has the SAME tools as the original. With no
  tools, it pays for the whole context again. So a fork keeps its tools, and every call is refused.
- A resume must run in the session's original `cwd`, because sessions are stored per project
  directory.
- The first restart onto the revive code finds rows with no `boot` field. It revives them when
  the agent's own log was written in the last 30 minutes, and marks the rest `gone`.
- Names and aliases for roles and ids: [`doc/names.md`](./doc/names.md).

## Files

`Agents.js` (the host, the agent, its queue) · `tools.js` (the MCP tools) ·
`Assistant.js` + `assistant.md` (the always-up fast assistant and its posture) ·
`Layers.js` + `Global.js` (the card and cross-card agents, [`doc/layers.md`](./doc/layers.md)) ·
`policy.js` · `claims.js` · `brief.js` · `tiers.js` ·
`roles.js` (role → posture) · `registry.js` (who has ever been spawned, and which host holds it) ·
`ops.js` (restart, pause, resume) · `jobs.js` (background work in node) ·
`experts.js` (module experts: a checkpoint per module, `ask_expert`, `load_module` — [`doc/experts.md`](./doc/experts.md)) ·
`readme-chain.js` + `readme-chain.test.mjs` (a fresh, directory-bound agent's opening context,
[`doc/readme-chain.md`](../doc/readme-chain.md)) ·
`demo.mjs` · `fork-proof.mjs` · `experts-proof.mjs` · `revive-proof.mjs` · `revive-guard-proof.mjs` · `wake-proof.mjs` · `jobs-proof.mjs` (the proofs) ·
`doc/traps.md` (what the SDK does not tell you) · `doc/jobs.md` · `doc/names.md`

How agents should work together (the design, with a picture):
[/framework/ai/2026-09-24/concurrency/](/framework/ai/2026-09-24/concurrency/).

## Tools are node functions, not HTTP

An agent Servex spawns gets its tools in-process: `tool(name, description, schema, handler)`
+ `createSdkMcpServer` in the spawn's `mcpServers` — the handler runs inside Servex with the
log, the registry and the agents in scope. The HTTP `/mcp` is for sessions outside Servex.
Why, and what moves to tools first: [`tiers-design/doc/tools.md`](/framework/ai/2026-09-22/tiers-design/doc/tools.md).
