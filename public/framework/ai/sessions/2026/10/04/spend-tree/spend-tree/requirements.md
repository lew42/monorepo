# Spend tree: who spawned whom, why, and what it cost, nested

## The ask (owner, 2026-10-03 ~23:50, dictated, verbatim excerpts)
> we should be able to see how and why all the minions are spawned and kind of like study the raw records of, you know, all the dollars being spent and figure out the, the kind of breakdown

> if there's a review minion, a new, a brand new review minion for every task, and that's like, you know, doubles the token cost, then maybe we just cut back on reviews and say like, oh, only review the most important things, especially if the review passes ... we definitely don't want to be doubling our token consumption just to like get a second green check mark.

> if we can tag sessions based on like their purpose, essentially their reason or their trigger, um, who spawned them ... we want to build the cost of each agent uh, cumulatively. So like, if an agent spawns a hundred minions ... the cost for their session goes way, way, way up ... we want to nest the costs ... and the agent that spawns a bunch of sub agents probably has a bunch of token consumption of its own

> hopefully we have that in session the session system where each session's cost is displayed and ... the composition of that ... if it's a sum of other things we should be able to click through and see what it, well we want to see where our tokens are going ... broken down by Claude dollars and open router dollars

## Raw records (read these; compute, never estimate — law 7)
- `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`: each Servex agent's own log; the largest `"cost":N` is its total Claude $ at API prices (summed tonight: $1,408 since Oct 1 across 566 agents).
- `%LOCALAPPDATA%/lew42/servex/registry.json`: id, role, model, parent (null for 474 of 563 this week), started_at.
- `public/framework/ai/<date>/<task>/task.jsonl`: `agent` lines and the first assign line (who opened the task, its card/brief), `cost` lines from Server/task-cost.mjs.
- Model with a `/` = OpenRouter = real $; else Claude $.

## Want
1. **A script** (Server/ or the Sessions folder) that builds the tree: every agent → its spawner (registry `parent`; when null, reconstruct from task.jsonl/launch lines, else "unknown"), its **trigger tag** (owner prompt, task, review gate, clarity, heartbeat/revive, assistant, echo), its **own $** and its **subtree $** (own + every descendant), split Claude $ / real $.
2. **In the existing Sessions tab** (`/framework/ai/sessions/`, extend it, law 6): each session row shows own $ and total-with-children $; click a row → its children with their costs, recursively; filter by trigger tag. One routed URL per drill-down.
3. **A one-screen study** (`study.md` in this dir): what share goes to reviews and clarity checks, and how often a review or check found something that changed the work (read review.md verdicts: "pass" vs "N fixed"). Recommend which tasks keep reviews (complex, owner-facing) and which skip them (simple ones that pass reliably), with numbers.

## Coordinate
@mastermind-servex-10 is making every spawn record its parent going forward; this task reconstructs the past and draws it. @task-mastermind-day-overview does per-day totals by module; link to it, don't redo it.

Budget: $6
Model: Sonnet, ONE agent (no minions: under the $5-ish line this is single-agent work). Fence: a new script, the Sessions tab code, this task dir. Never the mcp__playwright tools.
