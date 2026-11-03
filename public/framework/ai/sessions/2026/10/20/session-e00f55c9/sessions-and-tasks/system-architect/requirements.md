# System architect: the file system is the state of truth; agents log, they don't message

You are the Opus system-architect mastermind (the `system-architect` skill, plus this brief). Owner's ask, 2026-10-20, verbatim where it matters. **Finish by the end of today (local).** Budget: $40. Usage is near the weekly threshold: do the reading and deciding yourself, hand mechanical sweeps to Haiku minions, UI or code to Sonnet; no Opus minions.

## Read first

`CLAUDE.md`, `public/framework/ai/readme.md` (the section "Sessions and tasks" and every system it names), `Servex/readme.md` and `/framework/servex/` docs (the MCP is integral: `Servex/MCP.js`, `Servex/ext/remote/readme.md`), `Servex/agents/readme.md`, `Servex/Follow.js`, `Servex/doc/module-inbox.md`, `public/framework/ai/doc/sessions-and-tasks.md`, and the owner's three dictations of today: `public/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md` (sections 1, 5, 6, 7, 8, 9). The system-architect skill's `measure.mjs` first, as it says.

## The owner's words

> "We want to reduce agent messaging and favor just logging the current state of everything to the file system in a way that any agent can then read it and figure it out in the future."

> "Once the session is concluded, the file system is the only thing that persists in terms of future agents being able to find it. … The file system is the state of truth, all the important stuff. In terms of handoffs, there shouldn't really be a need for a handoff. Everything should be documented properly."

> "If ever there's an important system that's not documented in the readmes, it needs to be added to the readme so that every AI agent reading through that documentation knows exactly what we have and how it works. That should be an ongoing thing, so make sure it's written down somewhere."

> On a minion and its mastermind: the minion writes an overview of what it is doing to its own session log (not fine detail: what is open, what it is working on), and the mastermind that spawned it tails that log, "instead of the minion having to respond to the mastermind directly via chat". Chat stays for a quick clarification.

## Deliverables (each one a file, linked from a readme, committed)

1. **A study of how agents talk today**, one screen, verified against code: every path a message takes between agents (`send_to_agent`, the parent wake on a child's turn end, `fork_self`, `follow`, the module inbox, cards, `wait_for_agent`), what each writes to disk and what only lives in a context window. Where: `Servex/agents/doc/messaging.md`, linked from `Servex/agents/readme.md`.
2. **The decision: logs over messages.** With `Server/Decide.mjs` (the `decide` skill), options ranked with pros and cons: (A) a spawned agent's parent `follow`s the child's `session.jsonl` by default and the child reports by logging, chat only for clarifications; (B) keep chat-first with a log mirror; (C) something better you find. Decide it yourself (the owner: "I want you as the mastermind to approve the plans"), then build the smallest slice of the winner: the spawn path in `Servex/agents/Agents.js` (`spawn` → `open_task`) wiring the parent follow, and the `minion` skill telling a minion to log its overview to its own session log. Where the decision lives: the task log of this dir (`Decide.mjs` writes it) and `Servex/agents/doc/messaging.md`.
3. **Context loss, written down**: `public/framework/ai/doc/context-loss.md`: a session's work survives only in files; what is lost when a session ends; the rule that the important state goes to the module's readme/doc (never buried in a session folder) and to the session log; why a hand-written handover cannot be relied on; what replaces it (computed state: `Server/State.mjs`, `Server/HandoverNow.mjs`). Link from `ai/readme.md` "Every system" and from `ai/doc/readme.md`.
4. **The readme rule, as an ongoing check**: a Haiku-sized script-plus-pass that lists every system (a directory with a readme or a class the AI uses) not named in `public/framework/readme.md` or `public/framework/ai/readme.md`, and adds the missing one-liners. Put the script in `Server/` (name it for what it does) and the rule in `CLAUDE.md`'s "Readmes and docs" section only if it is not already there (it mostly is: law 9 and "The iceberg readme"); otherwise one line in `ai/readme.md`.
5. **Every session has `session.jsonl`** (owner, section 9): today only Servex-spawned agents and voice calls get one; a VS Code tab's folder holds only `cache.jsonl` and `index.json` (computed by `ai/AISession/AISessionIndex.mjs`). Decide and record how a tab session gets its `session.jsonl` (the SessionStart hook? `AISessionIndex` when it first sees the transcript?) and which lines go in it by default; build it if it is one small slice, else queue it as a task with a brief.

Fences: you own `Servex/agents/doc/`, `Servex/agents/Agents.js` (spawn/follow wiring only), `.claude/skills/minion/`, `.claude/skills/system-architect/`, `public/framework/ai/doc/context-loss.md`, the readme one-liners. Do not touch `Server/SessionRecord.mjs`, `Server/TaskDirs.mjs` or `public/framework/core/Task/` (other tasks own them). Worktree for code (`take_worktree`), `node Server/merge.mjs`, `restart_servex` only when no other agent is mid-step (`list_agents`). Land with `finish-task`: one screen, links, what is left.
