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

- Moved verbatim to [doc/api.md](./doc/api.md): the API.
`send` wraps your text so the agent can see who asked and where the answer goes —

```
[from: mastermind-servex · reply to: log agent-host]
stop and tell me what you found
```

A `reply to` target is answered once, in the turn that answers that message, never after it unless a new message arrives (the envelope says so). Plain text on purpose: the agent has to understand it with no schema and no training. The
message **waits its turn** by default; `{priority: "now"}` cancels what the agent is saying
and lands immediately. `interrupt` stops it mid-sentence and leaves the session idle and
alive. `stop` ends it, and it stays listed as `stopped`.

- Moved verbatim to [doc/architecture.md](./doc/architecture.md): the architecture.

**Logs over messages (2026-10-20):** a spawned agent reports by logging an overview to its own `session.jsonl`, and its parent tails that log (`Agents.follow_child`, 60 s per message, ended when the child stops); chat is for a quick clarification. Every message path and what each leaves on disk: [doc/messaging.md](./doc/messaging.md).

**What the SDK can do here** (web search on the subscription, no temperature): [doc/sdk.md](./doc/sdk.md).

`assistant-fast` (`Assistant.js`, `assistant.md`) is the lobby: it answers words spoken with no
card. `SERVEX_NO_ASSISTANT=1` boots without it.

The parent of a spawn is always the caller's own id (or a tab's `session_id`, registered as `vscode-<id8>`), never the remote door's `voice-app`: [`doc/architecture.md`](doc/architecture.md), "The parent of a spawn is the caller's own id".

## A fresh, directory-bound agent starts with its readme chain

A FRESH spawn whose directory is named (`task: {dir}`, or `page`) gets the
readme.md chain from the repo root down to that directory prepended to its
first message, so it knows "where it is" before it does anything — the owner's
own ask, 2026-09-29. `readme-chain.js`; the seam, the token cap, where it's
wired in and left out: [`doc/readme-chain.md`](../doc/readme-chain.md).

Since 2026-10-18 the same spawn also writes `<task dir>/past-work.md` (what already exists on the
brief's title, `Agents.past_work()` calling `PastWork.task()`) and tells the agent to read it first. No title: skipped, one log line.

Every spawn has a task dir since 2026-10-18: a bare prompt gets `ai/sessions/<day>/<caller's session folder, else spawned>/<agent id>/` from `Agents.default_task()`; `task: false` is the one opt-out, and a one-pass role (reviewer, clarity, checker) never gets a dir (its output goes in the task it reviews) (`decision` in `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/spawn-always-task/task.jsonl`).
The clarity hook (`Server/clarity.mjs`, `ClarityGate.skip`, test `Server/clarity.test.mjs`) skips an agent in the one-pass roles or whose id starts with `clarity-`: no reviewer of a reviewer, one log line per agent in `.claude/skills/clarity/flags.jsonl`.

## The Dispatcher — a card becomes a mastermind

When the assistant decides a sentence asked for something built, fixed, changed or looked
into, its card carries `route: "task"` and a `task` line follows it, `state: "queued"`.
[`Dispatcher.js`](./Dispatcher.js) watches the same `prompts` log for exactly that (the same
`append` event `Assistant.listen()` hangs off) and spawns a `page-mastermind` agent (the one-task row) — Sonnet,
effort medium, a deliberate override of this role's own Opus default while this whole feature
runs in budget mode. At most two run at once; the rest wait queued. It is registered itself as
a fake "parent" agent (`id: "dispatcher"`, just a `.send()`) sitting in the same `live` map real
agents do, so a child's wake — `wake_parent`'s `done`/`blocked` — reaches it with no polling and
becomes one more `task` line, `state: working | blocked | landed`, which is what the card's
status strip on `/framework/ai2/` and `/framework/ai/talk/` reads.

## Sending to a VS Code tab

`send_to_agent` takes `{to, message}` (and `agent`) as well as `{id, text}`, the names agents guess from Claude Code's own SendMessage; a missing recipient names the field. Test: `send-alias.test.mjs`. Before this (2026-11-02), those calls failed and agents reported the tab "isn't a live agent".

A tab (`vscode-<id8>`, `kind: "external"`) is not a running agent. `External.js` registers it, and `send_to_agent` to it appends one line to its inbox file (`%LOCALAPPDATA%/lew42/servex/logs/inbox/<id>`, a JSONL file), which the tab reads on its next turn. The answer says so: `ok: true`, `delivered_to: "the inbox of the VS Code tab <id> …"` and a note that the tab will not reply in this call. It is delivered; do not post an `owner_note` to repeat it. `Agents.successor()` never follows a registered tab to another agent that shares its `session_id` (a send to `vscode-rp-proof` once landed in a running mastermind). Test: `External.test.mjs`. Needs a Servex restart to take effect (2026-11-02).

## When an agent stops

An agent's turn ends (`result()`), or it is stopped (`stop()`), and its task may still be open. [`Servex/CloseLoop.js`](../CloseLoop.js) decides, and `Agent.close_loop()` in `Agents.js` applies it, once per agent:

- **Clear finish → the harness completes the task.** The turn ended without an error, the log holds an outcome or a landing line (a minion's commit line counts too; a mastermind's does not, since it commits at every step), and the agent said something: a `complete` line is written with the agent's last words (up to 1500 characters) as the outcome, the log's last commits as evidence, and a caveat saying the harness wrote it. A store event `task-closed` records it.
- **Otherwise → one wake.** "Your task is still open: complete it with an outcome, or say why it stays open." It is sent once; `close_nagged` is kept in the registry row (`Registry.js`), so a revived agent is never woken again. A stop with the task open writes one log line instead of waking (nobody is there to answer).
- **Nothing happens** when the task is already complete, stopped, waiting or paused, the agent's last words start with `BLOCKED`, the turn ended in an error, children are still working, or the agent is one-shot or a standing role.
- **News does not wake a landed worker** (`Agent.landed_fyi`): once a minion's own task is complete or stopped, a message from anyone but the owner, a tab (`vscode-`, `voice`, `tab-`, `user`), its parent, or one sent with `priority: "now"` / `revive: true` is written to its task log ("FYI from X …") and no turn is run; `send_to_agent` tells the sender (`held: true`, a `note` saying so and how to wake it). A clarity note, a sibling's merge news or a landing nag used to cost 3-6 paid "already handled" turns per agent. Masterminds are exempt (they land one task and go on). An idle landed agent still goes dormant by the usual sweep; it was not stopped, so a parent or the owner can still ask it something.
- **A task nobody completes** is later closed by `StaleClose` (`Server/doc/stale-close.md`): abandoned with no real work reads `abandoned`; with real work (a commit, or 3+ log lines) it reads `unclosed` ([core/Task, replay](/framework/core/Task/readme.md)). `Server/Unclose.mjs` re-closed history that way.
- **Caveat:** a minion that commits, then ends a turn while waiting for something other than its children or an owner `wait`, is completed at that turn end. It should log a `wait` first.

Test: `node Servex/agents/close-loop.test.mjs` (temp task dirs, no live Servex). Needs a Servex restart to take effect.

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
- The SDK's `total_cost_usd` is the session's running total, and a resumed process (a wake-up, a reopen) carries it on rather than starting at 0. So a turn's cost is what that total grew by, and every reader takes it from `turn-costs.js`, which also rebuilds logs written before 2026-10-23 (they logged the whole session on each wake-up: $4,783 logged against $1,422 real across all agents).
- The first restart onto the revive code finds rows with no `boot` field. It revives them when
  the agent's own log was written in the last 30 minutes, and marks the rest `gone`.
- A `finish`/`complete` line lands a task (`Servex/Landed.js`); when only `landed_at` + outcome did, six helpers were woken all day for $21–$73 each against $3–4 budgets, and `helper-compact-nudge` for $194.95: [`doc/task-loop.md`](../doc/task-loop.md#the-heartbeat).
- **The roles, one readme each** (what each does, its model, when to use it; the text Servex gives an agent before its first turn): [`roles/readme.md`](./roles/readme.md).
- Names and aliases for roles and ids: [`doc/names.md`](./doc/names.md).
- Landing nag, next-step wake, compaction policy: [`doc/lifecycle.md`](./doc/lifecycle.md).
- **The single seat's only reply** — `say`, `nothing`, `retract_say`, the gate that releases a queued say, boot-env only for now: [`doc/say-tools.md`](./doc/say-tools.md) (also the thinking sound: when the server writes `{thinking}`/`{thinking,done}`, and `SERVEX_SESSION_THINKING_OPEN_MS`). Its brief: [`single-voice-assistant.md`](./single-voice-assistant.md); tests: `say-tools.test.mjs` (the tools and gate), `single-brief.test.mjs` (the brief's own words, its real opening prompt, and a replayed real session), `Sessions.single.test.mjs` (the thinking sound).

## Files

`Agents.js` (the host, the agent, its queue) · `tools.js` (the MCP tools) ·
`Assistant.js` + `assistant.md` (the always-up fast assistant and its posture) · `Chain.js` + `doc/assistant-chain.md` (flagged one-global-assistant chain, `SERVEX_CHAIN=on`) ·
`Layers.js` + `Global.js` (the card and cross-card agents, [`doc/layers.md`](./doc/layers.md)) ·
`turn-costs.js` (each turn's real dollars from an agent's log; `cost.test.mjs`) · `Sessions.js` per-session `plugins` (`POST /api/session/settings`) and the shared defaults (`/api/session/defaults`; `Sessions.plugins.test.mjs`, doc [`ux/Dictate/doc/settings.md`](/framework/ux/Dictate/doc/settings.md)) ·
`page_tools.js`'s `task_origin()` + `handoff-note.js`'s `handoff_note()` (ask1-origin, 2026-11-03: a handoff's first message quotes the owner's own raw words, read off the task before `move_item` runs; `task-origin.test.mjs`) ·
`page_tools.js`'s `strip_duplicate_questions()` (a nested Question add whose text matches one already in the file is never written again — it links the existing one's `also_from` to the repeating Prompt instead, every sibling line in the same write still lands; `Question-dedupe.test.mjs`; `ux/Dictate/doc/question-cards.md`) ·
`policy.js` · `claims.js` · `Brief.js` · `tiers.js` ·
`roles.js` (role → posture) · `Registry.js` (who has ever been spawned, and which host holds it) ·
`ops.js` (restart, pause, resume) · `Jobs.js` (background work in node) ·
`Experts.js` (module experts: a checkpoint per module, `ask_expert`, `load_module` — [`doc/experts.md`](./doc/experts.md)) ·
`readme-chain.js` + `readme-chain.test.mjs` (a fresh, directory-bound agent's opening context,
[`doc/readme-chain.md`](../doc/readme-chain.md)) ·
`demo.mjs` · `fork-proof.mjs` · `experts-proof.mjs` · `revive-proof.mjs` · `revive-guard-proof.mjs` · `queue-proof.mjs` · `wake-proof.mjs` · `jobs-proof.mjs` (the proofs) ·
`doc/traps.md` (what the SDK does not tell you) · `doc/jobs.md` · `doc/names.md` · `doc/task-mastermind-long-form.md` (file name kept; the long form of the one-task section in `roles/mastermind.md`)

How agents should work together (the design, with a picture):
[/framework/ai/sessions/2026/09/24/concurrency/concurrency/](/framework/ai/sessions/2026/09/24/concurrency/concurrency/).

## Tools are node functions, not HTTP

An agent Servex spawns gets its tools over HTTP: `Agents.door()` points it at the loopback `/mcp` (`?as=<id>`, served by `Servex/MCP.js`); in-process `tool()` servers are only for hosts with no HTTP door (tests). How it learns its own page: [`doc/own-page.md`](./doc/own-page.md).
Why, and what moves to tools first: [`tiers-design/doc/tools.md`](/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/doc/tools.md).

- **The `log` tool** (path + line in, one stamped line out, in `tools.js`): [Server/doc/log-line.md](../../Server/doc/log-line.md)
