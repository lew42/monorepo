# Dormant agents, the working cap, and compaction

An idle agent costs nothing. Its claude process exits and the agent goes **dormant**. It keeps
its id, its session and its place in `list_agents`. The next message wakes it: Servex resumes the
same session, and the agent answers a few seconds later with its whole conversation intact.

**How long an agent waits before sleeping depends on its role, and can be set per agent and per
request** (`dormant_after` — see "Per-role and per-request timing" below). The plain default,
for a role that is neither the voice pair nor a one-off worker, is still **3 minutes**
(`SERVEX_DORMANT_MS`).

At most **5 agents work at once**. A new spawn above that waits in the spawn queue until one
of them ends its turn.

An agent about to go dormant with more than **100k tokens** of context **compacts first, then
sleeps**, so it wakes small. Past **400k tokens** or **500 MB** it is compacted when its turn ends,
whatever happens next. Details: "Compaction", below.

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
every role sleeps, but not all on the same clock — see "Per-role and per-request timing" below.

## How it works

- `Agent.sleep()` (`agents/Agents.js`) closes the prompt stream, closes the query and aborts, so
  the claude process exits. The `Agent` object stays in `live`, with its spec, SDK hooks and
  in-process MCP servers. The registry row says `dormant`.
- `Agent.send()` on a dormant agent calls `awaken()`: it starts a new process with
  `resume: <its session id>`, the same cwd, model, tools and options, then pushes the message.
- `Global.sweep()` (`agents/Global.js`) runs every minute and checks every agent against its own
  wait (`Global.wait_ms`, below). A turn ending ALSO checks that one agent at once, through the
  `agents.register` wrap in `reaper()` — a one-off worker does not wait for the next minute's
  sweep to fall asleep.
- **Kept awake:** an agent with a live background task (a background Bash or Monitor it waits
  on would die with its process — `Agent.sleep()`'s own check, unchanged) — it stays `idle`,
  process up, and sleeps on the first sweep after the task ends; or an agent with a live CHILD
  still `working` or `starting` (`Global.has_working_child`) — a reply is probably seconds away,
  and sleeping the parent now would only add a resume delay to delivering it.
- **After a Servex restart** a dormant row stays dormant. The boot never reopens it; the first
  message does (`send` → `wake` → `reopen`).

## Per-role and per-request timing (`dormant_after`)

Exiting after every single reply would be wrong for a live voice chat — autosend means many
small messages, and restarting the process for each one is wasteful and slow. So how long an
agent waits, idle, before it sleeps is not one global number — it is a property of the AGENT,
`dormant_after`, read by `Global.wait_ms()`:

| `dormant_after` | meaning |
|---|---|
| `"session"` | never auto-sleep, for as long as this is a live, ongoing session |
| a number (seconds) | sleep after being idle this long; `0` means "the moment the turn ends" |
| not set | the role's own default, below |

**Role defaults** (`Global.default_after`, when nothing more specific was asked):
- **`session-fast`, `session-smart`** (the voice session's own pair) → `"session"`. Never sleeps
  mid-conversation; something else (the session ending) is what eventually stops these, not this
  sweep.
- **`minion`, `reviewer`, `task-mastermind`** (one-off work) → `0`. These mostly wait on a child
  or on the owner anyway, and a resume is cheap (see "Measured: is a cold resume actually slow?"
  below) — so they sleep the instant their turn ends.
- **Every other role** (a manager, an assistant, `master-assistant`, `mastermind-servex`, the
  Dispatcher) → the plain timer: `SERVEX_DORMANT_MS` (3 minutes) normally, or
  `SERVEX_DORMANT_TIGHT_MS` (30 seconds) when free RAM is under `SERVEX_TIGHT_MB` (default 6144
  MB, read from the process monitor's `free_mb` — `Global.check_tight()`, logged once on each
  flip into or out of tight, never every tick). A dormant agent holds no process, so this is a
  cheap, reversible way to claw back RAM the moment it is actually scarce.

**Set it per agent, per request:** `spawn_agent`'s `dormant_after` sets the new agent's default;
`send_to_agent`'s `dormant_after` changes an EXISTING agent's for its next idle wait (it sets the
property directly on the live agent object, since `Agent.send()` itself only reads `from`,
`reply_to` and `priority` off its note — `agents/tools.js`). Use it when you are about to read an
agent's reply and might ask a quick follow-up (keep it warm briefly, e.g. 60 s) versus handing it
a multi-minute review (let it sleep now; a resume when it is actually needed is cheap). The
`mastermind` skill's own guidance: *about to read the reply and maybe follow up → `60`; handing it
to a 3-5 minute review → `0`* (a line proposed to the skills owner, never edited here directly).

**Measured: is a cold resume actually slow?** (2026-10-01, two resumes of stopped minion
sessions three days old — past any cache TTL — one ~82k tokens, one ~215k): `time_to_request_ms`
(process start + session load — the part of a resume that is actually DIFFERENT from an
already-warm process) was 139-149 ms both times. That is the number this design cares about, and
it is nowhere near "slow", so `dormant_after: 0` stays a true instant exit by default
(`SERVEX_DORMANT_GRACE_MS`, default `0`). The first actual token still took 3.0-3.4 s either way
(`ttft_ms`) — but that is ordinary first-token API latency, paid on any turn whether the agent
was dormant or already running, not a cost of having exited between turns. If a future, more
direct measurement of resume overhead alone ever does cross about 3 seconds, raise
`SERVEX_DORMANT_GRACE_MS`: every `dormant_after: 0`, for every role, waits that long instead of
truly zero.

**RAM freed:** each sleep sums the agent's last-measured working set (`agent.rss_mb`, from
`Global.measure()`) into `dormant_freed_mb`, shown by `Global.summary()` — today's running total
of RAM given back this way.

## The working cap

- `SERVEX_WORKING_CAP` (default 8, raised from 5 on 2026-10-24; see "Measured" below). `Agents.working()` counts agents in `working` or `starting`.
- Every agent counts for itself, so a task mastermind with two working minions holds 3 slots.
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
- Shown as `working N/cap` in `heartbeat_status` and in `system_health`'s first line.

### Measured, and why "working 6/5" happens (2026-10-24)

- **Why 6/5:** nothing slipped. A resume (a wake that delivers a message, such as a child's report) and the front desk are never held by the cap, so a woken mastermind pushes the working count past it while the spawn gate keeps queueing NEW spawns ("working 6/5: waits for a working agent to end its turn"). Seen live at 23:03: 6 working agents (page, deputy, architect, session-identity, queue-triage, one build minion) against a cap of 5, with three minion spawns waiting.
- **RAM per agent:** a working `claude.exe` is about 0.5 to 0.65 GB; with its tool children one working agent's process group is 0.5 to 1.0 GB (about 0.7 GB on average); an idle one about 0.18 GB. Six working agents were about 4.2 GB of the 8.5 GB that is Servex's own (98 dev servers are 2 GB, about 20 MB each).
- **The real limit is the rest of the PC:** of 32.5 GB, 20.6 GB belonged to other programs (Figma 3.8, VS Code 3.7, Chrome 3.1 GB), 5.2 GB was free, and the spawn gate holds spawns below 4 GB free (`SERVEX_MIN_FREE_MB`). Each extra working agent costs about 0.7 GB, so eight working agents leave about 3.8 GB free: the memory floor, not the count, is what stops the ninth.
- **CPU and heat:** the agents are waiting on the API most of the time (0.0 to 0.2 % CPU each; all of Servex's 154 processes were 1.4 %), so more agents add RAM pressure, not heat. The CPU that was busy (93.7 %) belonged to other programs.
- **Decision:** default cap 8, the 4 GB floor stays as the second gate. Try 10 only after a week in which free memory stayed above the floor with 8 working; `GET /api/processes` gives the numbers. Set `SERVEX_WORKING_CAP` to change it without code.
- **Priority:** when a higher-priority task needs a slot, the mastermind winds a low-priority session down: [mastermind.md](/Servex/agents/roles/mastermind.md), "Slots go to the highest priority".

## Compaction

All compaction rules and the factors behind them now live in one place: [`public/framework/ai/doc/compaction.md`](../../public/framework/ai/doc/compaction.md). In short:

- **Compact before sleep** (2026-10-23): an agent about to go dormant with more than 100k tokens (or half the
  window) compacts first, then sleeps, so it wakes small. `Agent.sleep_compact()`, hooked into `Agent.sleep("idle")`;
  the line can be set per role as `compact_after.sleep`. One warm compaction of 158k cost $0.24 and left 17k.
- **The nudge:** an idle agent past 150k (mastermind) or 200k gets one message and may `compact_self`.
- **The ceiling:** past 400k tokens or 500 MB, compacted at turn end; a memory compaction restarts the process.
- **Left out:** minions, the standing front desk, forks.
- Memory is read every 5 minutes (`Global.measure()`), each claude.exe matched to its agent by session id.
- Tests: `node Servex/agents/compact-before-sleep.test.mjs`, `node Servex/agents/compact-nudge.test.mjs`.

## Proof

[`/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/proof.txt`](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/proof.txt),
run by `proof.mjs` beside it on a private Servex (port 8190, a scratch `SERVEX_HOME`).

**Watch out — waking a dormant agent could lose the message that woke it** (2026-10-01): `awaken()`
calling `register()` before the caller's own `send()` could push its message used to find a stale
idle clock and go straight back to sleep in the same tick, closing the brand-new queue first. Fixed
(the idle clock now resets inside `awaken()`, plus a 60 s belt in `sleep()`, plus a `held_messages`
fallback that makes losing it this way harmless even so): [`never-lose-a-wake.md`](./never-lose-a-wake.md).

## Expensive dormant agents: read them, don't wake them (decided 2026-10-17)

A dormant agent costs nothing until a message wakes it, and a wake reloads its whole context on the next turn. `mastermind-voice-opus` ($694) and `mastermind-task-system` ($272 and more) are the cases this was decided for. **Decision: leave them dormant, do not stop them.** Stopping adds nothing (a stopped agent also resumes by session id) and loses the "revivable" row in `list_agents`. The rule, as a should: an agent past about $100 should be read (its files, its `task.jsonl`, its card), and woken only to hand it a decision it is waiting on, with `send_to_agent {revive: true}` and a message that names the one question. The alternative, stopping them, would win only if the registry row itself became a problem (a long `list_agents`); the `list_agents` live-only default already handles that.
