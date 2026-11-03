# agents — the API (moved from the readme)

<!-- moved verbatim from readme.md lines 20-87, 2026-10-12 readme audit -->
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
**A fresh `minion` with no worktree `cwd` is moved into a pool slot first** (session-gate,
2026-10-01, `Pool.take_sync()`) — a voice session or anything else that spawns a minion directly,
not through a task mastermind, can no longer hand it the main tree with no smoke test and no
review; none ready, and the spawn is refused outright rather than falling back there. A host with
no `servex.pool` at all (a demo, a test, a bare `new Agents()`) is untouched by this.
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
- **Idle agents go dormant.** After 3 idle minutes every agent's claude process exits; its id,
  session and row stay, and the next message resumes it in place. At most 5 agents work at once
  (`SERVEX_WORKING_CAP`), and a big agent is compacted: [`../doc/dormant.md`](../doc/dormant.md).
- **Stopping is still free.** A message to a stopped agent, or to one that exists only in the
  registry, wakes it first: the same id, its session, and the spawn `spec` its registry row keeps.
  Forks are never woken. Proof: `wake-proof.mjs`.
- **Nothing revives what was ended on purpose.** Every path that reopens an agent (a message, a
  child's report, the boot revive, the heartbeat) asks one guard, `Agents.blocked(row)`, and skips
  an agent that `stop_agent` stopped (its row keeps `stopped_by`), one whose task has landed, and
  one whose directory is gone (said plainly, not as the SDK's "libc" error). `send_to_agent` with
  `revive: true` overrides the first two, and the owner answering an agent's question on a card
  passes it. A message to the `mastermind-servex` role asks the same guard. Proof: `revive-guard-proof.mjs`.
- **The spawn queue survives a restart.** When memory is short, a spawn is held in a queue
  instead of started, and the queue is saved to `spawn-queue.json` beside the registry. A held
  spawn gets its id at once, so `wait_for_agent` on it waits for it to start. Asking again for the
  same id, session or role+name joins the entry already queued, and one session never runs in two
  processes. Reviewers, clarity and checkers start first, with 1 GB free, and stop themselves when
  their one turn ends (a message still wakes them). Proof: `queue-proof.mjs`.
- **A retired `mastermind-servex-N` is the role.** A message or a child's report for a stopped
  one goes to the live holder. Rows stopped before the revive guard are marked `stopped_by: "legacy"`
  at boot.
- **Task masterminds may message each other.** Their parent gets a copy of each message, so no
  hand-off between two tasks is invisible (`policy.js`, rule `peer`). A parent may message its
  child while the child still waits in the spawn queue.
- **A resumed session's old id is an alias.** When a session is resumed under a new id
  (`task-mastermind-x` → `task-mastermind-x-2`), a message, a child's report, a lookup and the
  heartbeat for the old id go to the new one (`successor()`, chains too), instead of reopening
  the old id as a second process on the same session. The heartbeat takes a task's owner from its
  latest assign line, not its first.
- **The session id is known at spawn.** Servex mints it and passes it as `sessionId`, so even an
  agent whose host died during its first turn can be resumed.

