# agents — the architecture (moved from the readme)

<!-- moved verbatim from readme.md lines 100-227, 2026-10-12 readme audit -->
## Module experts — ask the agent that has already read it

A module with an `expert.json` has an **expert**: a session that read the module once (its readme
chain and key files) and is kept as a checkpoint. `ask_expert({module, question})` forks it, so the
answer comes from a clean, cached context in seconds, and rebuilds it first if a file it read has
changed. `load_module({modules})` returns the same reading for any session to load in one call.
[`doc/experts.md`](./doc/experts.md) has the recipe, the verbs and the measurements.
`ask_directory({dir, question, session})` is the other way in: a FRESH mastermind for one folder, started from its readmes only, never forked: [`doc/directory.md`](./doc/directory.md).

## The fixer — the fast path from "fix this" to a live edit

One standing agent, `fixer-1` (`Fixer.js` + `fixer.md`), holds one quick-fix worktree for its
whole life and turns a small, concrete page change (the `quick_fix` tool, which `session-smart.md`
sends it) into a live fix in roughly 10-30 seconds, no spawn and no new worktree on the hot path:
[`Servex/doc/fixer.md`](../doc/fixer.md), [`/framework/ai/quick-fix/`](/framework/ai/quick-fix/).

## Voice sessions

One ✦ press is one voice session, answered by its own pair of agents. [`Sessions.js`](./Sessions.js) runs them and serves the routes `POST /api/session/new` (start, or continue this page's session from the last hour), `POST /api/session/say` (one owner line, sent to both agents) and `POST /api/session/nav` (the owner moved to another page), plus `resume`, `floor` and `GET /api/sessions`. **`session-fast`** is the fast assistant: one short line within seconds, no tools ([`session-fast.md`](./session-fast.md)). **`session-smart`** is the smart one (Opus 5.5, effort medium, mastermind permissions: `bypassPermissions` plus the full preset and Servex's door; the model is the `voice_smart` tier): it thinks, routes the owner's words to work in flight, starts masterminds and asks `ask_directory` about a folder ([`session-smart.md`](./session-smart.md)). Its record lives in the dated store (`session_path()`), and both agents are spawned with `parent_session` = the voice session, so the index shows them as its children. The browser half and the file format: [`ext/Session`](/framework/ext/Session/) and its [`doc/sessions.md`](/framework/ext/Session/doc/sessions.md); the folder questions: [`doc/directory.md`](./doc/directory.md).

### Dictate keeps working if Claude cuts off

Both session agents can run on a non-Claude model, and switch there BY THEMSELVES the moment
Claude refuses one of them for usage limits — the owner, 2026-10-04: "I have to rely entirely
100% on the website and whether the voice dictation system works."

**After a Claude cutoff, Dictate runs on: fast = `openai/gpt-6-luna`, smart = `openai/gpt-6-luna`.**

One setting (`session_backend()`, a file so the smart assistant can flip it with no restart),
that one default pair (picked by cost and quality), one automatic fallback that needs no
setting change at all: [`doc/dictate-backend.md`](./doc/dictate-backend.md) has the mechanics,
the eval the pair was picked from, and the live proof.

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
  `Jobs.js` and the four module-expert tools in `Experts.js`) against the host you give it,
  `{name, description, inputSchema, schema, handler}` — what `servex.mcp.tool(tool)` takes.
  It is a function, not a constant, so the handlers close over the host that is really running:
  `for (const tool of tools(servex.agents)) servex.mcp.tool(tool);`
- **`Agents.watch(event, agent)`** sees every event from every agent on its way to disk.
  Servex overrides it to push the event to the dashboard (`Servex.Agents`, `Stream.js`);
  `demo.mjs` overrides it too, and that override is the demo's entire user interface.

## An agent can write pages

Every agent gets the page tools (`page_tools.js`): `page_set(path, delta)` writes a property, a card or a subpage (`Subpages.js` makes, renames and moves aside the folders), and `page_read(path)` shows the current state. The model and the delta table: [`public/framework/core/Page/doc/ai-api.md`](../../public/framework/core/Page/doc/ai-api.md).

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
[`sub-mastermind-live`](/framework/ai/sessions/2026/09/22/5e24b511-b6bd-4c40-96d6-0666f656ce6d/sub-mastermind-live/) reproduced the old parking
bug before proving the fix.

## Roles and the registry

`spawn_agent({role})` looks `role` up in [`roles.js`](./roles.js) — every row is on
[the roles page](/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/doc/roles.md), reconciled 2026-09-29 with
the per-voice-session pair (`session-fast`, `session-smart`) and the directory mastermind
(`directory-mastermind`, built: [`doc/directory.md`](./doc/directory.md)); "manager" and "master assistant" are retired words there now — for the skill it loads
before the agent's first turn (`minion` → the `minion` skill, and so on) and the
model/effort/permission-mode a caller doesn't name; a caller's own fields always win. Every
spawn and every state change writes `{id, role, name, topics, page, state, visibility,
session_id, started_at, parent}` to `registry.json` next to the logs — `GET /agents`,
`list_agents`, and `say.mjs state`'s `MASTERMINDS` block all read it, which is how any of them
still sees an agent after Servex restarts and its in-memory `live` Map is empty again — and
appends the same row to `servex.jsonl`.

### A mastermind may spawn masterminds (owner, 2026-10-15)

`policy.js` `spawn()` lets any mastermind (`mastermind-*`, `task-mastermind-*`) spawn a `mastermind`, a minion or a helper, with no special grant; other workers still spawn only minions and helpers, and assistants stay denied. The owner's reasoning, quoted from [the brief](/framework/ai/sessions/2026/10/15/voice-20261015/ask-00dc4855.md):

> The mastermind role adds little power, mostly the ability and instructions to spawn minions. That's right for large tasks and whole systems (Page, AI) where a coordinator holds context and uses minions to read code, because a mastermind reading all code itself is slow, token-heavy and can't answer quickly. Not every task needs one; it's for big scopes.

## The assistant layers — every card has its own agents

Each card gets its own **assistant** (`assistant-<card>`, answers in seconds) and its own
**manager** (`manager-<card>`, plans the work and starts minions). A **master assistant** and
`mastermind-servex` watch across all cards. Every agent speaks under its own id, and
`send_to_agent` and `spawn_agent` check [`policy.js`](./policy.js) for who may message or spawn
whom. Everything about it: [`doc/layers.md`](./doc/layers.md).
