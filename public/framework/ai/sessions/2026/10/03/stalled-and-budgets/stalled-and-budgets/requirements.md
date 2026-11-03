Budget: $13

# Stalled tasks to the top of the Dashboard; a budget on every task

**The owner's words (2026-10-02, roadmap items 1–2 — stalled tasks are "top priority"):**
1. *A node check marks a task stalled when it has no log line for 2 h, isn't landed, and has no live agent. Stalled tasks go to the TOP of the owner's Dashboard with Snooze / Kill / Re-prioritise.* Today 33 tasks under `ai/2026-09-30` … `ai/2026-10-02` are open and not landed; many look dead (decision-system, padding, review-shots, home-blog, list-order, remote-access…).
2. *Every brief carries `Budget: $X`, and the card shows estimate vs actual.* Only 5 of 29 landed tasks had one; 3 went over (1.1×–2.4×).

Both are **data first**: node computes them, the Dashboard (being built by `task-mastermind-panel2-sessions`, roadmap item 3) reads them. Law 7: no AI writes a status or a cost; law 6: extend what exists.

## What exists — use it

- `Servex/asks/stalled.js` — the pure stalled rule for **asks** (closed statuses, dead/dormant/silent owner, 2 h). Reuse the rule; don't write a second one.
- `Servex/asks/Asks.js` `tick()` — runs once a minute inside Servex, already joins ask → owner agent row → task dir's last log line. The task check belongs on this tick.
- `Server/task-cost.mjs` and each task's `spend.json` (`{total, points}`) — the actual cost; `requirements.md`'s first line `Budget: $N` — the estimate.
- `task.jsonl` line 1 (session id, agent, card, brief) and the `landed_at` assign line — a task is a dir with a task.jsonl; "landed" = a `landed_at` line exists.
- The AI page already names the idea (`public/framework/ai/concepts.js`, `page.js` mention stalled) — read them before adding words.

## Items

1. **The task check (node, on the tick).** In `Servex/asks/`, add `tasks.js`: walk `public/framework/ai/<date>/**/task.jsonl` for the last 7 days; for each task compute `{dir, title, agent, card, brief, budget, spent, started_at, last_line_at, landed, state}` where `state` is `landed` | `building` | `stalled` | `snoozed` | `killed`, using `stalled()`'s rule with the task's own facts (owner = line 1's agent; silent = no log line for 2 h; a live agent in the registry with a turn in the last 2 h is not silent). Write the result as **one file the Dashboard reads**: `public/framework/ai/tasks.json` (whole-object write, atomic via temp+rename; it is derived data, regenerated every tick, never hand-edited — say so in a comment and in `ai/readme.md`). Test: `Servex/asks/tasks.test.mjs` with a fixture tree — landed, building (fresh line), stalled (old line, agent gone), snoozed.
2. **Snooze / Kill / Re-prioritise are lines, not edits.** Each is a verb line appended to the task's own `task.jsonl` through `append.mjs`'s schema (`jsonl-schema.mjs` — add the verbs): `{"snooze":{"at","until","by"}}`, `{"kill":{"at","why","by"}}`, `{"priority":{"at","score","why","by"}}`. The check honours them: snoozed until `until` is not stalled; killed is closed (like landed, shown folded); `priority.score` overrides the computed score. Expose them as three Servex tools in `Servex/agents/tools.js` (`snooze_task`, `kill_task`, `reprioritise_task`) so the Dashboard's buttons and any agent call the same code. A Kill also stops the owner agent if it is live (through the existing stop path) — never deletes anything.
3. **Budget vs actual.** `tasks.json` carries `budget` (parsed from the brief's `Budget: $N` line; `null` when missing) and `spent` (from `spend.json`), plus `over: spent/budget` when both exist. `create_card`/the card tip (the card-pipeline task, running in parallel — its fence is `Servex/cards/`; **yours is `Servex/asks/` and `tasks.json`**; it reads your `tasks.json` for the tip's "$spent of $budget" — tell it the field names by a `send_to_agent` to `minion-card-pipeline` once the shape is final). A task with no `Budget:` line is shown as such — the fact, not a guess.
4. **Score for the Dashboard order:** stalled first (100), then over budget (90), then building by last activity, then landed folded. One line per band in `Servex/asks/readme.md`. The Dashboard decides how to render; you give the numbers and the reason string (`why`).
5. **Hand the shape to the Dashboard.** When `tasks.json` is real and stable, send `task-mastermind-panel2-sessions` ONE message: the file path, the field list, the three tools, and the band legend. It builds the view; you build nothing visual beyond a tiny proof: `node Servex/asks/tasks.js --print` lists today's stalled tasks in the terminal (the 33 the owner saw, now with reasons).

## Fence

`Servex/asks/` (tasks.js, tasks.test.mjs, readme.md, Asks.js's tick wiring only), `.claude/hooks/jsonl-schema.mjs` (+ test, the three verbs), `Servex/agents/tools.js` (the three tools), `public/framework/ai/tasks.json` (generated), one line in `public/framework/ai/readme.md`, this task dir. Nothing else; never edit any task.jsonl by hand; never delete a task dir.

## Land

Worktree; `merge.mjs` (no page touched unless you added the readme line — then review it). Report on your card in five lines: how many tasks are stalled now and the top five with reasons, how many have budgets, what the Dashboard reads. Asks.js runs inside Servex — the mastermind restarts; don't.
