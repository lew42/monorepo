# Context loss: a session's work survives only in files

When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows only what it can find in the repo. So **the committed repo is the only memory** (CLAUDE.md law 5). The owner, 2026-10-20: "Once the session is concluded, the file system is the only thing that persists … there shouldn't really be a need for a handoff. Everything should be documented properly." ([dictation](owner-2026-10-20-who-makes-tasks.md), section 9.)

## What is lost when a session ends

- Every chat reply, to the owner or to another agent (`send_to_agent`, the parent wake, `wait_for_agent`): see [how agents talk](/Servex/agents/doc/messaging.md) for what each one leaves on disk.
- Why a choice was made, unless it was written as a `decision` line.
- What the agent learned about how a system works, unless it went into that system's readme.
- Servex's own logs (`%LOCALAPPDATA%\lew42\servex\logs\`) survive on this machine, but they are not committed and no readme leads an agent into them. Treat them as debugging data, not memory.

## The rule: write it where the next agent will look

1. **How a system works goes in that system's readme or `doc/`**, in the same task that learned it (CLAUDE.md law 9). Never only in a session folder: nobody browses old sessions looking for how `Follow` works.
2. **What you are doing goes in your session log** (`session.jsonl`, or `task.jsonl` in an older folder) as it happens: what is open, what you decided (with `Server/Decide.mjs`), what landed. A spawned agent's parent reads this log instead of waiting for chat ([logs over messages](/Servex/agents/doc/messaging.md)).
3. **Commit it.** Uncommitted work is lost work.

## Why a hand-written handover cannot be relied on

A handover file written by an AI depends on that AI remembering to write it, at the end, when the session is most likely to be cut off. It goes stale the moment anything changes, and it is one more copy of facts that already sit in the task logs. The owner would rather have an automated record of what sessions do.

## What replaces it: state computed by code

| What | Tool (writes) | Read by |
|---|---|---|
| Every task's state, in both stores | `Server/State.mjs` → `ai/state.json` (run by Servex's `TaskLoop`) | the AI dashboard, `/tasks/` |
| The "NOW" block at the top of [handover.md](../handover.md) | `Server/HandoverNow.mjs` (code, never an agent) | a fresh session's first read |
| What already exists on a topic | `Server/PastWork.mjs` → `past-work.md` beside each brief | every spawned agent, before it plans |
| A child's progress | the child's own `session.jsonl`, tailed by its parent | the parent agent |

**Computed state needs a live computer.** On 2026-10-20 the `TaskState.mjs --watch` child that keeps `ai/state.json` current died at a Servex restart (its lock was left from 15:16, its last write 15:31), and the Inbox sat stale for 30 minutes until an agent restarted it by hand. A child a supervisor spawns once and never checks is a view an agent has to refresh, which CLAUDE.md's last law forbids. Fixed: `TaskLoop.watch_state()` respawns it when it exits, at most once a minute. Not covered yet: a watcher that hangs without exiting (a tick that checks `state.json`'s age would catch it).

## The tab prompt log: who reads it, what it costs

Every prompt the owner types in a VS Code tab is logged verbatim by code, not by an agent: the `UserPromptSubmit` hook `.claude/hooks/prompt-relay.mjs` adds it as a `Prompt` item to the session's `page.jsonl`. It costs no model tokens to write, and a few KB a day on disk. Its readers: the per-session Echo assistant (`Servex/agents/Echo.js`, which refines each prompt: a local model first at $0, Anthropic as the fallback, so that is where any cost is), the Refine pages (`ext/Refine/RefineExplorer.js`), the day cards (`Server/DayPromptsRefine.mjs`), and the session's own page. `Server/AskTally.mjs` reads the raw transcripts instead. It lands at `/framework/ai/sessions/<session id>/`, the store folder `ai/sessions/YYYY/MM/DD/session-<id8>/`, beside the tab's `session.jsonl` (the SessionStart hook `session-page.mjs` writes its line 1). Prompts before 2026-10-20 stay in the old flat folders `ai/YYYY/MM/DD/session-<id8>/`; moving them is a follow-up script. Agents link to it; they never retype a prompt.
