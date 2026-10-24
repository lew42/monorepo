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

**Compact before sleep (the owner, 2026-10-23).** When an agent is about to go dormant and its context is
over its sleep line, it runs `/compact` first and sleeps when that turn ends. The next message wakes it
with a summary of about 10-20k tokens instead of reloading the whole history.

- **The line:** 100k tokens (`SERVEX_SLEEP_COMPACT_TOKENS`), or half the model window if that is lower.
  A role can set its own as `compact_after.sleep` in `agents/roles.js` (masterminds: 100k).
- **Who:** every agent that sleeps, except minions (`compact_after: null`), the standing front desk
  (`assistant-*`, `manager-*`, `master-assistant`, `session-*`, the Dispatcher) and forks.
- **When:** at the sleep moment (`Agent.sleep("idle")` → `Agent.sleep_compact()`), not at the turn end. An
  agent that gets another message within its idle wait keeps its full context. The wait is 3 minutes
  (30 s when RAM is tight, 0 for a task mastermind), all under the 5-minute cache TTL, so the
  compaction reads a warm cache. Only an agent given `dormant_after` over 300 s compacts cold, and that
  is still cheaper than one cold wake of the full context.
- **Once:** an agent already compacted since its last turn just sleeps. A sleep for a landed task
  (`sleep("landed")`) never compacts: that agent is not expected back.
- **A message during the compaction** queues behind `/compact` and runs after it; the agent stays awake
  for that turn and tries to sleep again after it.
- **Logged:** `compacting` and `compact` lines with `why: "sleep"` and the tokens before and after, then the
  usual `dormant` line.
- **Measured cost of one compaction** (Servex's own `compact` lines; `turn_cost` is the compaction turn
  alone): a Sonnet task mastermind went from 158,513 to 16,746 tokens for **$0.24 in 61 s**, about 1 minute
  after its turn ended (warm). A 57k context went to 5k for $0.08 in 15 s. Waking that 158k agent cold
  without compacting re-writes all 158k to cache (1.25 times the input price: about $0.59 at $3 per
  million input tokens), and every later turn re-reads the full history. One compaction pays for itself at the first wake.
- Test: `node Servex/agents/compact-before-sleep.test.mjs` (23 checks).

**The other two rules still run:**

- At the end of a turn an idle agent past its line (a mastermind 150k, others `SERVEX_NUDGE_TOKENS` 200k) gets ONE
  nudge message with its context size and whether its cache is warm; it compacts itself (`compact_self`) or not.
  See `agents/doc/lifecycle.md`, "Compaction".
- `Agent.oversized()` is only the safety net: past `SERVEX_COMPACT_TOKENS` (400000) or the process memory
  (`SERVEX_COMPACT_MB`, 500) the agent runs `/compact` as a turn of its own. That turn wakes no parent and keeps
  the last turn's words.
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

[`/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/proof.txt`](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/dormant-idle/proof.txt),
run by `proof.mjs` beside it on a private Servex (port 8190, a scratch `SERVEX_HOME`).

**Watch out — waking a dormant agent could lose the message that woke it** (2026-10-01): `awaken()`
calling `register()` before the caller's own `send()` could push its message used to find a stale
idle clock and go straight back to sleep in the same tick, closing the brand-new queue first. Fixed
(the idle clock now resets inside `awaken()`, plus a 60 s belt in `sleep()`, plus a `held_messages`
fallback that makes losing it this way harmless even so): [`never-lose-a-wake.md`](./never-lose-a-wake.md).

## Expensive dormant agents: read them, don't wake them (decided 2026-10-17)

A dormant agent costs nothing until a message wakes it, and a wake reloads its whole context on the next turn. `mastermind-voice-opus` ($694) and `mastermind-task-system` ($272 and more) are the cases this was decided for. **Decision: leave them dormant, do not stop them.** Stopping adds nothing (a stopped agent also resumes by session id) and loses the "revivable" row in `list_agents`. The rule, as a should: an agent past about $100 should be read (its files, its `task.jsonl`, its card), and woken only to hand it a decision it is waiting on, with `send_to_agent {revive: true}` and a message that names the one question. The alternative, stopping them, would win only if the registry row itself became a problem (a long `list_agents`); the `list_agents` live-only default already handles that.
