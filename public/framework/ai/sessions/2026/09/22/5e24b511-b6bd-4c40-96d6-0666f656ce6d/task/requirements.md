# sub-mastermind-live — a task mastermind inside Servex that spawns minions and never parks

Minion: Sonnet, effort high. Session id `5e24b511-b6bd-4c40-96d6-0666f656ce6d`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then phase-2 item
**8** in [`../tiers-design/doc/phases.md`](../tiers-design/doc/phases.md), the task-mastermind
role in [`../tiers-design/doc/roles.md`](../tiers-design/doc/roles.md), and the sub-mastermind
skill (`.claude/skills/sub-mastermind/SKILL.md`). Load the `code` skill.

## The failure this exists to fix

Every sub-mastermind that has ever run here died the same way: it spawned minions in the
background, their completion notified the MAIN session instead of it, and it ended its turn
"awaiting harvest" — parked forever (mastermind skill, "Briefs"; both Fable sub-masterminds on
2026-08-21). With Servex hosting the sessions, completion can be an event addressed to the
parent. That is the whole task: **make a child's landing wake its parent, and prove it.**

## What exists

Servex is RUNNING under its keeper (`node Servex/sustain.mjs --status`). `Servex/agents/`:
`Agents.js` (spawn/send/interrupt/list/stop; every SDK message → a typed event on
`agent-<id>.jsonl` through the single writer; `send` wraps `{from, reply_to}`), `roles.js`
(role → skill, model, effort, defaults; landed 16:03 by `spawn-role`), the registry
(`GET /agents`, rows carry `parent`), `tools.js` (five MCP tools). An agent spawned through
`spawn_agent` gets `SERVEX_MCP` and an `--mcp-config` so it can call `spawn_agent` itself
(`servex-integrate` proved `minion-foreman` hiring `minion-helper`). Restart Servex after
editing `Servex/**`: `node Servex/sustain.mjs --stop`, then the hidden launch (`powershell
-NoProfile -Command "Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs'
-WorkingDirectory 'C:\Code\lew42\monorepo' -WindowStyle Hidden"`); confirm 8090; log the PIDs.
Never `cmd /c start`.

## Deliverables

1. **The wake.** When an agent with a `parent` emits its `result` (a turn ended) — and again
   when it is stopped or errors — Servex `send`s the parent one message, wrapped as
   `{from: <child id>, reply_to: "log agent-<parent>"}`: `done: <the child's last transcript
   text, first 300 chars>` (or `blocked: …` if the child's last text starts with "BLOCKED", or
   `error: …`). Logs carry everything; that direct message is only done / blocked / error, per
   the coordination doc. One method on `Agents` (`wake_parent(child, kind)`), called from the
   event path; ~30 lines. A parent that is mid-turn gets it queued (the SDK's priority option
   `agent-host` found — read its `doc/traps.md`), not lost.
2. **The proof — the failure reproduced first, then fixed.** Write a tiny brief in your task
   dir for a task mastermind: "spawn two minions (Haiku, effort low) — one writes `a.txt`
   containing the word alpha in `<your task dir>/proof/`, the other `b.txt` with beta — then,
   when both are done, write `both.txt` containing their two words and reply DONE". Spawn it
   through the MCP as `role: task-mastermind` from a `claude -p` turn (the recipe in the run
   ledger; `--strict-mcp-config` against `http://127.0.0.1:8090/mcp`). **First** run it with
   the wake disabled (a flag or env) and show, from the registry and the parent's event log,
   that the parent's turn ended with `both.txt` never written — the parking, reproduced.
   **Then** with the wake on: `both.txt` exists with both words, and the parent's log shows two
   `agent_msg` lines from its children before the turn that wrote it. Log the wall time and
   cost of both runs, and the number of turns the parent took.
3. **Registry rows show the tree:** `list_agents` output for the run has the mastermind with
   two children (`parent` set), and `say.mjs state`'s MASTERMINDS block shows the task
   mastermind while it runs.
4. **`Servex/agents/readme.md`** gets five lines: the wake, when it fires, what it says.

## Fence

`Servex/agents/**`, `Servex/Servex.js` (Edit only, and only if the wake needs a hook there),
your task dir (`proof/` inside it). Append-only to `.jsonl`. Nothing under `Server/` or
`public/` outside your task dir; never the owner's :80 or the mastermind's :8123.

## Length

Landing report: eight sentences with the two runs' numbers side by side. Stop and land what is
proven if either run costs more than $3.
