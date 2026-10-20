# The owner on sessions, tasks and losing work (2026-10-20, dictated to the VS Code mastermind)

The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows in *italics* where one exists. Read with [sessions-and-tasks.md](sessions-and-tasks.md) (the plan) and [tasks.md](tasks.md) (how it works today).

## 1. Who is who

- A VS Code tab (this mastermind) is **not managed by Servex**; it reaches Servex only through the Servex MCP and spawns helpers with `spawn_agent`. The owner notes local-to-local over the network is a little unnecessary but fine for now. *True. The tab uses the local `servex` MCP over loopback (`Servex/MCP.js`), not the cloud tunnel; Servex has no command line of its own.*
- A **session is a context window**: one session id. Accounting must follow the session exactly. Tasks are created inside it.
- A **task goes into the session by default**, unless the agent judges it better to put it in a directory's `tasks/` folder. Any module or path may have its own `tasks/`, so tasks can be per module.

## 2. Dated `tasks/` folders in a module

The owner leans towards `tasks/YYYY/MM/DD/<slug>/` (like `ai/sessions/`): archiving is easier, a month can be loaded as a chunk, and a flat `tasks/` by name fills its namespace and needs a giant index. "Look into that." *Open: 73 module homes hold about 500 tasks today (`Server/TaskHomes.mjs`). Decision to be made with `Server/Decide.mjs`, options ranked; the move is a script with a manifest, never retyped.*

## 3. When a task is created

- Not per tool call. But the owner wants more insight into **what agents actually do** (tool calls, thinking) without duplicating the SDK transcript. *The transcript is still served live from `~/.claude/projects` by `Server/plugins/AILogs.js` (`GET /ai-logs/<uuid>`); the session detail page reads it.*

## 4. The sessions page needs an overhaul

Built on the page inbox and column pages, which the owner does not understand; needs a compact **mobile** UI: sessions, cost, filter by day. `/framework/ai/sessions/` is a DataGrid (resizable columns, a default list view for any data type) but it wastes space. *The AI dashboard at `/framework/ai/` was rebuilt 10-19 (sessions by origin, nested by parent, cost rolled up, mobile first); the sessions DataGrid page was not. Not yet redone.*

## 5. Losing work (the biggest problem)

> "I sit here all day asking for things and then they just disappear into the ether."

- The owner wants a **limited set of not-done tasks**, visible, each one checked off when it is done, finished by the end of the day. Not 7,000 open tasks and audits nobody follows up. Every single ask gets done, checked, next.
- The handover file relies on an AI remembering to write; the owner would rather have an **automated task system** that records what the SDK sessions do.

## 6. The task system upgrade

- `Project` is "maybe not the worst way". Tasks are recursive (`tasks` list made on first use). Processes are task trees: investigate → plan → propose class architectures → build.
- **Nail the class hierarchy first.** Open questions the design must answer: can a task hold a project? Do a project's tasks run in series or parallel, and is that a choice? Structure it once so it is not redone.
- **No plan mode, no owner approval of plans**: the mastermind approves plans and keeps moving.
- **Document major decisions**: when there are two ways, write the options, pros and cons, rank them, the best wins, and the decision shows as a card on the task's page. *This is what `Server/Decide.mjs` (the `decide` skill) writes; the task page must show the `decision` lines as cards.*

## 7. Indexing and the readmes

- The presence of every system must be abundantly clear in CLAUDE.md and `framework/readme.md`: an overview of what is inside and when to use it. Not every agent reads every module readme.
- Many systems were built (`framework/code`, `framework/design`, …) without being made to work properly. The owner is unsure they work at all; chasing old work into place may be fighting ourselves. "Maybe it's just better not to say anything and let the AI figure it out."

## What this mastermind does with it

1. The owner's three direct questions are answered above in italics.
2. Next builds, in order: the day's limited list with check marks (section 5); decision cards on task pages (section 6); the dated module `tasks/` decision (section 2); then the class hierarchy page for Task / Project / Session before any task-system rebuild.

## 8. Second dictation (15:30): explain the classes, where a task is saved, the paper trail

- "Don't assume I read your responses." A reply that names a file (`Server/SessionRecord.mjs`, a "probe") without saying what it is, when it is created and when it is saved, does not help. *Rule for this mastermind: every class named in a reply gets one line: what it is, when made, when saved.*
- **Where a task is saved** is confusing: a task could be a line in `session.jsonl`, its own `<name>.jsonl` (then it cannot be called `task.jsonl` if there are several), or its own folder when it is complex (logging, files, subtasks). The owner does not want the AI deciding this every time. *Today's rule on disk: a task is always a folder with one `task.jsonl`; a subtask is a line in that log, or its own folder when it has files. A task as one line in the session log is slice 5 of the plan, not built. See the picture in [sessions-and-tasks.md](sessions-and-tasks.md).*
- Can a session's tasks for a module live in the session's folder? *Yes today (the default); the module home `<module>/tasks/` is the agent's choice through the item tool. Section 2 (dated homes) and this question are decided together.*
- **A tail for agents.** The owner wants a minion to write an overview of its work to its own session log (not fine detail; what is open, what it is doing) and the mastermind that spawned it to subscribe to that log, so the paper trail replaces chat for the core work. Chat stays for a quick clarification. *Exists in parts: the `follow` tool (`Servex/Follow.js`, a file change wakes the following agent) and the browser `live()` tail (`ext/JSONL`). Not yet the rule: minions still report by chat and landing lines. To build: a spawned agent's parent follows its `session.jsonl` by default.*
- **Docs go to the module**, never buried in a session folder: readme and `doc/` of the module being worked on, so future agents find them. The owner worries that articulating precisely where things go will be misinterpreted anyway.
- DNS: the owner will edit the token (or make a new one) and asked for the connector URL to paste.
