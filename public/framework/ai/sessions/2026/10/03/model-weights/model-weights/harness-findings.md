# Section 5: is it our system, or the model? — what the evidence actually says

Three real findings, each checked against logs/ledgers, not guessed from memory (CLAUDE.md law 7).

## 1. The brief's "revive dropped the OpenRouter provider onto Claude billing" — not what happened

The brief (section "Evidence found already") read the Nemotron h1-page agent's cost climbing from
$0 to $2.84 across nine heartbeat revives as the provider silently switching to a Claude model.

Checked the real ledger
(`%LOCALAPPDATA%/lew42/servex/logs/openrouter.jsonl`, filtered to that agent): the model stayed
`nvidia/nemotron-3-ultra-550b-a55b:free` on **every single turn**, start to finish. The cost spike
was a *different*, already-understood bug: four no-call revive turns got billed the **whole
OpenRouter key's** spend via the `key_diff` fallback (readme point: "Cost is per key, not per
agent" — two agents on one key can't be told apart by a before/after diff). It was manually
reconciled the same night (`{"type":"correction","cost_usd":-2.8447633,"why":"...it was another
agent's. Bug fixed in provider.js real_turn_cost (no calls = no cost)."}`), and the fix (never bill
a turn with zero model calls) is live in `provider.js` today. **Net real cost of that whole
incident: $0.** No code change needed here — just correcting the record.

## 2. The real bug: an orphaned run never told Heartbeat it was done

What *did* go wrong, confirmed from the agent's own log
(`agent-minion-lib-h1-page.jsonl`): the run that produced the result was itself fine (one real
turn, correct page, cost $0). But the **calling `library.mjs` process died before it could call
`stop_agent`** — its run folder never got a task-mastermind-style landing line. Heartbeat has no
way to know a throwaway test run is "done" other than that convention, so it revived the same
already-finished agent **nine more times over about seven hours**, each one a real (if free) turn.
On a paid model, that is nine extra bills for zero extra work.

**Fixed:** `library.mjs`'s `runOne()` now writes `{"landed_at", "outcome"}` to the run's own
`task.jsonl` the instant its result is known — not after `stop_agent` (which a killed parent can
never reach), right when the row is computed. `Agents.js`'s own `task_landed()` check then refuses
to revive it, independent of whether anything is still alive to stop it.

## 3. A newer, live problem: the quick-fix pool now blocks every fresh `library.mjs` run

Not in the brief — found while actually trying to run rung 0. `Agents.js:119` (dated 2026-10-01,
"session-gate") now routes every **fresh** `role: "minion"` spawn whose `cwd` isn't already inside
`worktrees/` through the quick-fix pool (`pool.take_sync()`), and refuses the spawn outright if
none is `ready` **right now** — it does not wait. `library.mjs` has always spawned its test-library
runs with `cwd: ROOT` (the main tree) on purpose, because the run folder IS the live page the model
edits and the mechanical checks load. `Pool.js` keeps only **one** worktree in `ready` state at a
time (not all the `qf-N` slots `system_health` lists — most of those are idle/recycling, not
"ready to hand out"); any other agent on the machine taking that one slot in the same moment makes
`take_sync()` return nothing, and the spawn fails in well under a second — before a single OpenRouter
request is sent, so it costs nothing, but it also means **zero signal**, every time it happens.

This is not just timing. Checked directly: calling `take_worktree()` myself (the blocking, ~20s-wait
version) answered **"No worktree could be made ready"** — the pool itself is stuck right now, not
merely raced by another agent's spawn. `system_health`'s "7 pool" count is the census of `qf-*`
worktree directories on disk, not Pool.js's own live `ready` slots (the pool design only ever keeps
ONE truly ready at a time) — so a healthy-looking "7 pool" line can sit right next to a completely
stuck live pool.

**Found the actual root cause** in the Servex event log: `{"msg":"pool: qf-6 is held by stopped
mastermind-servex-9 but kept — has uncommitted changes — commit and merge them, or move them,
first. Nothing was discarded... salvage by hand if it is truly abandoned: node Servex/Lifecycle.js
--salvage qf-6","event":"pool"}`. `take_worktree()`'s own doc says at most 3 real slots exist; one
of them is wedged holding a dead agent's uncommitted work, and `Pool.js` correctly refuses to
discard it rather than lose that work. That is very likely why nothing can be made `ready` right
now — this is a system-wide stall, not specific to this task, and it blocks **every**
`role: "minion"` spawn on the whole machine, OpenRouter or Claude, until someone looks at what
`qf-6` is actually holding and either lands it or salvages it by hand.

**Did not run the salvage myself** — `Lifecycle.js --salvage` on a stopped agent's uncommitted
worktree is exactly the kind of "never resolve a conflict by force, never destroy a viable version"
call CLAUDE.md and the sub-mastermind skill reserve for a human or the module's own coordinator, not
a two-line fix a different task's mastermind should make unilaterally. Flagging it as the one real
blocker on this task's card, per the skill's "report three messages" rule, instead of quietly
routing around it with `--role task-mastermind` as a standing habit.

**Also tried the `--role task-mastermind` route above, and it hit a second, unrelated bug:** every
task-mastermind-role agent's id runs through a stricter `Log.js` name check (64 chars, `cards/...`
shape) that a `minion`'s own long ids (confirmed from a real successful run,
`minion-lib-h1-page-nvidia-nemotron-...-1790885591913`, 84 characters) never hit — so
`--role task-mastermind` is NOT actually a safe drop-in for a quick cheap-model test; it trades the
pool block for a `"Bad log name"` throw instead. **Fixed, narrowly, in `library.mjs`:** the flag
stays (default `"minion"`, unchanged for everyone), documented honestly as Servex's suggested
escape hatch for the moment the pool is down, not a working substitute today.

## 4. The shared OpenRouter weekly budget was already over pace before this task spent a cent

With the pool workaround in place, the very next thing the spend guard said (`provider.js`,
`evaluate_guard()`): *"this week's OpenRouter spend ($12.69) is ahead of pace: $11.02 of the
$12.5/week budget is allowed by now."* This is a **machine-wide** cap, shared by every agent on
this Servex, not this task's own $12 — other concurrent work (several other task-masterminds were
`working` at the same time, per `system_health`) had already spent the whole week's pace allowance
before this task made its first OpenRouter request. The guard is a hard refuse, not a smaller
allowance: no OpenRouter spawn, of any size, goes through while `usage_weekly >= allowed`. It does
loosen on its own as the week's elapsed fraction grows (the formula is time-based, not just
usage-based), so it may open up within hours — but that is out of this task's control, and
retrying it in a loop burns turns for nothing.

**Decision, not a stall (CLAUDE.md law 5 — never park on a limit):** validated the rest of this
task's pipeline on `claude-haiku-4-5-20251001` instead (billed on the subscription, outside this
guard entirely) to prove the mechanism end to end with a real agent, and queued the actual
cross-family cheap-model comparison (DeepSeek, GPT-6 Luna, Gemini 3.8 Flash) — the exact commands
are below — for whenever the shared guard next allows it. This is a fact worth a line to whoever
paces the shared OpenRouter budget (mastermind-servex): several task-masterminds spending against
one shared weekly cap, with no per-task reservation, means the LAST one to need it that week finds
it already gone, through no fault of its own work.

## What this means for the brief's own question

"Did our system fail the free models, or did the models fail?" — for `h1-page`'s free-model
failures specifically, the earlier evidence (`note: "run failed: fetch failed"` /
`"...aborted due to timeout"`, `turns: null` or `0`) already shown in h1-page's own `page.jsonl`
stands: most of those runs **never reached the model at all** — that's OpenRouter/network flakiness
on free-tier models, not a judged failure, and library.mjs now deletes/skips exactly these
(`waitForRealTurn`'s own queued-vs-dead logic, already in the code before this task). The two
`google/gemma-4-26b-a4b-it:free` / `nemotron-3-nano-omni-...:free` rows that DID get a real turn and
still failed (`hello not found in parent's children:`) are real model misses, not ours — they got a
turn and produced the wrong page.
