# Never lose a wake

A message to an agent should always either run, or sit somewhere visible waiting to run. Before
2026-10-01 it could instead just vanish — the agent still looked "working" on the dashboard, but
nothing was actually there to answer. This page is the seven small fixes that closed every way
that was found to happen, plus the test that proves them (`agents/awaken-race.test.mjs`).

## 1. The phantom: waking a dormant agent could put it straight back to sleep

A dormant agent (`doc/dormant.md`) has no process. The first message to it calls `awaken()`,
which starts a new process and then tells the registry about it (`register()`). The bug: that
same `register()` call runs the one-minute dormancy sweep early, and the sweep's idea of "how
long has this agent been idle" was stale — read from the agent's own log file's last-modified
time, which had not caught up yet. So the sweep saw an agent that looked like it had been idle
for ages, and put it straight back to sleep — closing the brand new queue a moment before the
message that woke it could be pushed onto it. `send()` still said the agent was "working"; nothing
was actually running.

Fixed two ways, belt and braces:
- `awaken()` now sets the agent's own idle clock to "right now" itself, before telling the
  registry anything, so the sweep sees the truth instead of a stale file timestamp.
- `sleep()` also flatly refuses for 60 seconds after an `awaken()`, whatever the clock says — a
  second, independent guard against the exact same race by any other path that might trigger it.

## 2. The cap only counts agents with a real, live process

The "at most 5 working at once" cap (`doc/dormant.md`, "The working cap") used to count any row
whose *state* said `working` — which a phantom from #1 could claim forever, holding a slot no
agent was actually using. `Agents.working()` now checks the real process too (`claude_pid` and a
direct `process.kill(pid, 0)`, `registry.js`'s own `alive()` — one check, not three separate
copies of it), past a short grace window for a spawn that is still booting.

**Not `idle` — `dormant`** (fresh-eyes review finding 3): the brief that opened this task said
"set it idle", but an `idle` agent's `send()` pushes a message straight onto whatever queue it has
with no further check — and this agent's queue has nobody left reading it. The message would be
accepted, then silently stranded, with nothing ever trying again (once marked, a phantom is never
re-logged). Dormant is the state `send()` already knows means "no process, call `awaken()` first"
— so a real message now actually starts a fresh process, and whatever was still sitting in the
dead queue travels along as a held message (#5), not lost.

## 3. A spawn whose process never showed up at all is retried, not abandoned

Rarely, a fresh spawn's own `claude.exe` never starts — not the brief, ordinary gap #2's grace
window covers, but a real failure. The one-minute reconcile (#6) finds a `starting` row that is
still like that after 60 seconds, stops it, and puts its own spec — role, prompt, everything, plus
anything already sent to it while it waited — back at the **head** of the spawn queue, so the
retry happens next, not whenever its turn would otherwise come up. Its original, UNWRAPPED prompt
travels with it (`Agents.spawn()`'s own `raw_prompt`), so the retry is not the skill-load preamble
wrapped a second time.

**Live example (2026-10-01, 22:40):** a long OpenRouter run id made `agent-<id>` fail `Log.js`'s
own 64-character name check, which made `agent.stop()` itself throw partway through — its
in-memory state had already flipped to `stopped`, but the call that tells the registry never ran.
`requeue_stuck_start()` now forces both regardless of whether `stop()` finishes cleanly, so a row
like this is still cleared by itself rather than needing a human to notice and intervene. (The
name-length limit itself is a `Log.js` question, out of this fix's own fence — worth a future
look at shortening those run ids, or widening the check, but not blocking this one.)

## 4. An escalation with nowhere to post still reaches the owner

The heartbeat and the task loop normally post a stuck task's status to its card. When a task has
no card at all, or the one it names can't be found, that used to just go nowhere — logged, maybe,
but never shown anywhere a person would look. `Heartbeat.post()` now falls back to the page Inbox
(`doc/inbox.md`) on the task's own folder, which walks up to the nearest real page when the task's
own folder isn't one — so the note always lands somewhere the AI board already shows it.

## 5. A message is held, never dropped, across a sleep/awaken cycle

Independent of #1's actual fix: `Agent.Queue.push()` now says whether the message was really
accepted, instead of a push that could silently vanish if the queue it landed on was already
closed. A push that fails is kept on the agent's own `held_messages`, and the very next `awaken()`
replays it — first, before anything else — so even an unforeseen version of #1's race could never
lose a message again, only delay it. (A message to a `starting` agent was already fine: it simply
queues in order behind that agent's first turn.)

## 6. Once a minute, the whole registry is reconciled against reality

`Servex.reconcile()` runs on the same one-minute clock the dormancy sweep already uses (never a
second timer). It does two things nothing moment-to-moment ever catches: re-queues a `starting`
row stuck past 60 seconds (#3), and looks for a live `claude.exe` whose own registry row claims it
is `dormant` or `stopped` — a stray process Servex's bookkeeping lost track of. The stray is always
**stopped first** (two processes writing one session at once is the actual unsafe side — fresh-eyes
review finding 1 caught an earlier version of this spawning the resume before killing the stray).
When the row still has a full spec, it is then **adopted** — resumed in place, under its own id, as
a single clean process; a row with nothing to resume it from is just left stopped, since an
unmanaged process costs memory for nothing. One summary line is logged only when something
actually changed.

## 7. A spawn the gate admits, but something inside spawn() still refuses, waits — not fails

The spawn gate's own `admit()` check (the working cap, the memory floor, a task's budget) is not
the only thing that can turn down a spawn — `Agents.spawn()` itself can still refuse one the gate
already let through, for a reason that is really "not yet", not "no": the worktree pool
(`doc/pool.md`) with no slot ready, or the OpenRouter pace guard mid-burst. The old code logged
`{"gate","state":"failed"}` and dropped the spec outright either way — its parent was never told.

`Servex.js`'s own `WAIT_REFUSALS` table names every one of these known-transient refusals by the
start of their thrown message. A match goes straight back to the **head** of the gate's own
queue with a plain-English reason, the pool is asked to top itself up when that is the one that
refused, and — this is the general rule, not special to these two — **a spawn's failure of any
kind tells its parent, once.** A refusal that matches nothing on the list (a genuinely broken
spec) is still just logged and dropped, since retrying that forever would never succeed.

**Two live examples (2026-10-01):** `minion-never-lose-a-wake` and two siblings vanished at 20:38
when the pool had no slot; `minion-lf-deepseek` vanished the same way at 22:56, 19 minutes after
being queued for RAM, when the OpenRouter pace guard refused it. Both are the same shape, and
both are now the same fix.

## The test

`node Servex/agents/awaken-race.test.mjs` reproduces #1's exact race against the real `Agents`
class (only the SDK call itself is faked, the same way `spawn-worktree.test.mjs` already does — no
real `claude.exe` is ever started), proves #5's held-message fallback by forcing the race
deterministically, proves #2's dead-pid exclusion, and exercises #3's re-queue and #7's pool-wait
retry against `Servex.js`'s real `drain()` / `next_ready()` / `requeue_stuck_start()`, and #4's
Inbox fallback against the real `Heartbeat.post()` — each one bound to a small fake host rather
than a second, parallel implementation written just for the test.
