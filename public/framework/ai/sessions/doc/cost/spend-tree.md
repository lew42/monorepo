# The spend tree — how `Server/spend-tree.mjs` works, and where it's a guess

The owner's ask (`public/framework/ai/sessions/2026/10/04/spend-tree/spend-tree/requirements.md`): see how and
why every Servex agent was spawned, nested, with its own $ and its whole subtree's $,
Claude $ split from real (OpenRouter) $. This page's own `readme.md` points here for the
detail; `study.md` beside the task's requirements is the one-screen reading of the numbers.

## What it reads

- `%LOCALAPPDATA%/lew42/servex/registry.json` — every agent Servex has ever started: its
  role, model, `started_at`, and `parent` (written automatically only for recent spawns;
  older ones are null — see "Reconstructing a parent" below).
- `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl` — one agent's own log. Its `own $` is
  the exact rule `Server/task-cost.mjs` already uses (`Server/doc/task-cost.md`): the last
  `result` line's `cost` is a running total, and a value that ever DROPS means the process
  restarted and the old total gets banked before counting continues.
- Every `task.jsonl` under `public/framework/ai/` — `Server/task-cost.mjs` already writes a
  `{"assign":{"cost":{root, parent_task, agents:[...]}}}` line on a task it has priced; this
  script reads that line (never recomputes it) to reconstruct a spawner for an agent whose
  registry `parent` is null.

## How own $ and subtree $ differ from `task-cost.mjs`

`task-cost.mjs` answers "which TASK paid for this dollar" — it splits a root mastermind's
time across every task it ran in sequence. This script never splits by time. It answers a
different question — "who spawned this AGENT, and what did its whole branch cost" — so every
dollar an agent ever billed counts once, under that agent, full stop. The two totals will not
match line for line; that's by design, not a bug (CLAUDE.md law 6 — this isn't a second cost
system, it's the same underlying $ read for a different grouping).

## Reconstructing a parent, in order tried

1. **The registry's own `parent`.** Written automatically for spawns made after
   `mastermind-servex-10`'s fix (2026-10-03 onward) — the real, not-guessed answer.
2. **A task's own `parent_task`.** When this agent is a task's ROOT (a task-mastermind) and
   that task's cost line names a `parent_task`, the parent is THAT task's own root agent —
   one task-mastermind spawned by another.
3. **A task's `cost.agents` list.** When this agent shows up as a minion inside some task's
   already-computed agent list (but isn't that task's root), its parent is the task's root —
   covers almost every minion (verified: 725 of 884 minions already carry a real registry
   `parent`; this step mops up most of the rest).
4. **A name match.** A `reviewer`/`clarity`/`checker` agent is usually named after the task
   it's checking (`review.mjs`, the clarity skill) — if its own `name` matches a task's
   folder slug, that task's root is its parent.
5. **`unknown`.** No evidence either way. Shown honestly as "unknown" on the Sessions detail
   page, never guessed into a specific id.

Every node in `spend-tree.json` carries `parent_source` (`"registry"`, `"reconstructed: ..."`,
or `"unknown"`) so a reader can see which agents are real wiring and which are this script's
best inference.

## The trigger tag — what it means, and its real failure modes

A tag for "why was this agent spawned", read in this priority order:

1. `role === "echo"` → **echo**
2. `role === "clarity"` → **clarity**
3. `role` is `reviewer`/`checker` → **review gate**
4. `role` is `assistant`/`card-assistant`/`card-manager`/`master-assistant` → **assistant**
5. `role === "dispatcher"` → **dispatcher**
6. The agent's own log's FIRST line is an `agent_msg` from `"servex-heartbeat"` →
   **heartbeat/revive**
7. A root `mastermind` with no spawner found at all (step 5 above, "unknown") → **owner
   prompt** — nothing spawned it, so the most honest read is that the owner started it
   directly.
8. Everything else (`task-mastermind`, `minion`, and the smaller roles — `helper`, `fixer`,
   `voter`, `expert*`, `session-fast`/`session-smart`) → **task**, the catch-all for
   "this exists to do a piece of a task's work."

**What this gets wrong, on purpose, and why:**
- Step 6 was tried first as "does the word 'heartbeat' or 'revive' appear ANYWHERE in the
  log" and badly over-fired — almost every long mastermind gets one routine heartbeat
  status-check mid-session (that's supervision, not its reason for existing), and a clarity
  agent's own tool calls say `revive=true` constantly when it's waking something ELSE up.
  Checked against four real examples (`task-mastermind-one-dictation`, `mastermind-page`,
  `task-mastermind-inbox-ext`, `mastermind-ai-3`) — every one of them actually opened with a
  real brief (`"from":"host"`) or a plain resume, and only picked up a heartbeat ping later.
  Restricting to "line 1 only" fixed every one of those false positives; it may still miss a
  genuine revive buried deeper in a log that never happened to start fresh under a new id.
- Step 7 is a coarse stand-in for "a human typed this." The only hard evidence available is
  the ABSENCE of a spawner — there's no structured "the owner typed this" event on disk today.
  A `mastermind` row with a reconstructable parent (most of them, once task.jsonl linking
  lands fully) will read **task** instead, even if the owner's own words kicked it off one
  level up.
- `voter`/`expert`/`session-fast`/`session-smart`/`helper`/`fixer` all fall into the **task**
  catch-all rather than their own tag — too few of them (under 35 each) to be worth a tag the
  owner didn't ask for; `study.md`'s "cost by trigger" table would just show six near-zero
  rows instead of a useful one.

None of this is hidden: every row's `trigger` sits right next to its `parent_source` in
`spend-tree.json`, and the Sessions detail page shows both plainly, so a wrong guess is easy
to spot and argue with, not buried in an aggregate.

## Regenerating it

```
node Server/spend-tree.mjs          writes spend-tree.json
node Server/spend-tree.mjs --dry    prints the top spenders + totals by trigger, writes nothing
```

Not live — same "run it by hand, re-run to refresh" rule `sessions.mjs`/`week-cost.mjs`
already use (`sessions/readme.md`). About 0.6s over the whole registry + ~105MB of agent
logs on this machine; cheap enough to re-run before every real look at the numbers.
