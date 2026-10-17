# Task templates: the routine procedure is a field, and node carries it out

**What this is:** a task says what kind of work it is (`template: "code"`), and node does the routine steps that kind of work always needs: the worktree, the commit lines, the spawn, the ids and the times. The rules stop being English that an agent might skip. The owner's ask: [owner-2026-10-17-node-driven.md](owner-2026-10-17-node-driven.md).

## The shape: two fields on line 1

```js
// line 1 of <module>/tasks/<slug>/task.jsonl, written by the item tool
{ id, path, parent, title, module, by, ts,
  template: "code",                                   // which routine procedure
  agent: { role: "minion", model: "claude-sonnet-5-5", effort: "medium",
           brief: "<module>/tasks/<slug>/requirements.md" } }   // who does it
```

| Template | Node does | The agent still does |
|---|---|---|
| `code` | makes a worktree `worktree/<slug>` and starts the agent in it; sets `SERVEX_TASK` so every commit adds a `commit` line (the post-commit hook); refuses `complete` until a `review` line passes (later slice) | the change, the tests, the commits |
| `doc` | starts the agent in the main tree; checks at `complete` that each new `.md` is linked from a readme (later slice) | the writing |
| `scan` | starts a Haiku agent, read-only (`permission_mode: "plan"`); its answer becomes the task's `outcome` | the reading |

The table lives once, as `Task.TEMPLATES` in `Task.js`, so the browser card and TaskLoop read the same words.

## The rule: an accepted proposal starts itself

1. A mastermind writes the task with `template` and `agent`, and asks for a verdict: `wait({on: "mastermind", what: "plan review"})`.
2. A reviewer (or the mastermind) writes `approve` through the item tool. `approve()` already moves the task to `running` (the readme, "waiting").
3. **Node spawns the agent.** The item tool, right after it writes the `approve` line, calls `TaskLoop.launch(file)` in-process. No polling: the approve line is the trigger.
4. `launch` first runs `node Server/PastWork.mjs --task <dir>`, so `past-work.md` (what already exists on this topic) sits beside the brief before anyone builds ([finding past work](../../../ai/doc/owner-2026-10-17-finding-past-work.md)). Then it checks for a free slot (Servex's monitor flag and the budget gate). Free: it spawns with `servex.agents.spawn` and appends `{"spawn":{"at","agent","session_id","by":"TaskLoop","author"}}`. Not free: it appends `{"queue":{"at","why"}}`, and TaskLoop's tick retries every queued task that has no `spawn` line yet.
5. Node writes every id and time: `at`, `agent`, `session_id`, `author` (line 1's `by`), `approved_by` (the approve line's `by`). The agent types none of them.

A task with no `agent` field is approved as before and nobody is spawned, so every old task behaves exactly as it does today.

## The first slice (built next)

`approve` on a task with a `template` and an `agent` makes TaskLoop spawn it, writing the `spawn` line. Proof: a private Servex port, one dummy task, the Echo agent so it costs nothing; replaying the file shows `running` plus a `spawn` line whose ids match `list_agents`. Brief: [approve-spawns](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/approve-spawns/requirements.md).

Later slices, one each: the `code` worktree, the review gate at `complete`, the link check for `doc`.

## Decided, with the alternative

- **Trigger: the approve line, not a timer.** Alternative: TaskLoop finds approved tasks on its 5-minute tick. That is simpler, but it adds up to five minutes of delay and is the poll the streaming law rules out; the tick stays only as the retry for queued tasks.
- **Templates are data on line 1, not subclasses** (`CodeTask extends Task`). A subclass would win if a template needed its own state or methods; today each one is a few flags node reads, and one `Task` class serves both sides.
