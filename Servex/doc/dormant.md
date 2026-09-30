# Dormant agents, the working cap, and compaction

An idle agent costs nothing. After 3 minutes idle, its claude process exits and the agent goes
**dormant**. It keeps its id, its session and its place in `list_agents`. The next message wakes
it: Servex resumes the same session, and the agent answers a few seconds later with its whole
conversation intact.

At most **5 agents work at once**. A new spawn above that waits in the spawn queue until one
of them ends its turn.

An agent whose context passes **200k tokens**, or whose process passes **500 MB**, is
**compacted** when its turn ends.

## The states

| state | claude process | what a message does |
|---|---|---|
| `starting` | yes | a fresh spawn before its first turn; held like `working` |
| `working` | yes | waits its turn behind the current one |
| `idle` | yes | starts a turn at once |
| `dormant` | **no** | resumes the session (a few seconds), then starts the turn |
| `stopped` | no | wakes it through the revive guard (`Agents.blocked`), unless it was stopped on purpose |

`dormant` is not `stopped`. The heartbeat, the lifecycle reaper and the budget all count a
dormant agent as alive, so a dormant task mastermind is never "revived" as if it had died. That is
why the old idle release (node-reliability, 2026-09-29) needed exceptions (15 minutes for a task
mastermind with no child, 15 for the global agents, never for assistants). Dormancy needs none:
every role sleeps after 3 minutes.

## How it works

- `Agent.sleep()` (`agents/Agents.js`) closes the prompt stream, closes the query and aborts, so
  the claude process exits. The `Agent` object stays in `live`, with its spec, SDK hooks and
  in-process MCP servers. The registry row says `dormant`.
- `Agent.send()` on a dormant agent calls `awaken()`: it starts a new process with
  `resume: <its session id>`, the same cwd, model, tools and options, then pushes the message.
- `Global.sweep()` (`agents/Global.js`) runs every minute and puts every agent idle past
  `SERVEX_DORMANT_MS` (180000) to sleep.
- **Kept awake:** an agent with a live background task (a background Bash or Monitor it waits
  on would die with its process). It stays `idle`, process up, and sleeps on the first sweep
  after the task ends. The SDK's `background_tasks_changed` message keeps that count.
- **After a Servex restart** a dormant row stays dormant. The boot never reopens it; the first
  message does (`send` → `wake` → `reopen`).

## The working cap

- `SERVEX_WORKING_CAP` (default 5). `Agents.working()` counts agents in `working` or `starting`.
- Every agent counts for itself, so a task mastermind with two working minions holds 3 of the 5.
- An `idle` or `dormant` agent holds no slot. It counts again only while a message has it working.
- **Not counted:** the front desk (`assistant-*`, `manager-*`, `master-assistant`, `session-*`,
  the Dispatcher) and an agent blocked inside `wait_for_agent`.
- **Never held by it:** a resume (a wake must deliver its message) and a front-desk spawn. So
  the cap holds NEW work at 5; messages that wake agents (a child's report, a card reply, a
  status check) can briefly push the count past it, and the next spawn waits until it drops.
- A dormant agent does not count toward the older ceiling of 30 live agents either, and the
  lifecycle reaper closes a dormant agent whose task has landed, as it does an idle one.
- The check is `Global.admit()`, one of the spawn gate's checks, so a held spawn is queued
  exactly like one held for memory. A turn ending drains the queue at once.
- Shown as `working N/5` in `heartbeat_status` and in `system_health`'s first line.

## Compaction

- At the end of a turn, `Agent.oversized()` checks the context (`SERVEX_COMPACT_TOKENS`, 200000)
  and the process memory (`SERVEX_COMPACT_MB`, 500). Over either, the agent runs `/compact` as a
  turn of its own. That turn wakes no parent and keeps the last turn's words.
- Memory is read every 5 minutes (`Global.measure()`): each claude.exe's working set, matched to
  its agent by the session id on its command line.
- Compacted **for memory**, the process is also restarted from the compacted session
  (checkpoint-and-restart), because a process keeps the heap it grew.
- **Not compacted:** the front desk. Layers.js restarts a page's assistant and manager fresh
  from a checkpoint instead ("fresh, not compacted", the owner).
- Once per turn: a summary still over the line is not compacted again until it has worked more.
- The context check runs the moment a turn ends, so an agent goes dormant already compacted.
  The memory check runs every 5 minutes, so it only reaches agents still awake by then.

## Proof

[`/framework/ai/2026-09-30/dormant-idle/proof.txt`](/framework/ai/2026-09-30/dormant-idle/proof.txt),
run by `proof.mjs` beside it on a private Servex (port 8190, a scratch `SERVEX_HOME`).
