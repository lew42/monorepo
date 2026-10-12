# budget-heartbeat — minion brief

Load the `minion` skill first. Parent: task-mastermind-node-reliability-2. Log in this dir's task.jsonl.

## The owner's words
Today: "Budgets enforced by the heartbeat (draft in draft/): a task's dollar cap from its brief or task.jsonl; at the cap the heartbeat stops spawning for it and the parent is told once."
From the brief (requirements.md 20:35, one dir up): "At 100%, it messages the mastermind once: 'budget reached: land what you have, or write in task.jsonl why you need more, and how much'. At 150%, it stops the task's minions (not the mastermind, so it can still land) and posts a line on card live. A brief without a budget gets a default by role."

## Fence
Worktree `C:/Code/lew42/worktrees/node-reliability` only (branch `worktree/node-reliability`). Files: new `Servex/Budget.js`, `Servex/Heartbeat.js` (one hook), `Servex/Servex.js` (spawn refusal only), `Servex/doc/` one new `budget.md` + one line in `Servex/readme.md`. Never edit the main tree C:/Code/lew42/monorepo. Never restart the real Servex.

## Start from
The draft one dir up: `draft/Budget.js` and `draft/heartbeat-budget.diff` (read them; they already do cost/budget/100%/150% and the once-only log lines).

## Deliverables
1. Land the draft as `Servex/Budget.js` + the Heartbeat hook.
2. **Stops spawning at the cap (missing from the draft).** At >= 100% a spawn whose `parent` is the task's owner, or any live descendant of it, is REFUSED (not queued: a queued spawn would wait forever) with the reason `budget: <slug> spent $X of $Y — land, or raise budget_usd in task.jsonl`. Hook it where `spawn()` consults `same_as`/`admit` in `Servex/Servex.js`; Budget keeps an in-memory set of over-cap owners refreshed each sweep (and computed on first need after a restart). A spawn with no parent, or the owner itself being revived, is not refused. A raised `budget_usd` lifts it on the next sweep.
3. **The parent is told once.** At 100% tell the owner (draft text) AND the owner's own parent agent (from the agents registry), each once; the `{"log":{"budget":"reached"}}` line is the memory.
4. Proof in `proof.txt` here: a scratch run with `SERVEX_HOME=<temp dir> SERVEX_PORT=18090 SERVEX_PROXY_PORT=18080 SERVEX_PROXY_INTERNAL=18079 SERVEX_NO_GATE=1 SERVEX_NO_ASSISTANT=1 SERVEX_NO_POOL=1`, or a pure node script calling Budget's exported functions with a fake agents object — show: (a) under cap nothing happens; (b) at 100% owner + parent told, one log line, and a second sweep adds nothing; (c) a child spawn of the owner is refused with the reason; (d) raising budget_usd lifts the refusal; (e) at 150% descendants stopped, owner not. Also boot the scratch Servex once and `GET /agents` to prove it starts; kill it. Every process: windowsHide.
5. `Servex/doc/budget.md`: what it does, the three rules, how to raise a budget, 20 lines at most. Commit by exact path in the worktree. Do not merge. End your turn with a 5-line report.

Budget: $5. Sonnet. No new npm deps.

## Added 12:58 by mastermind-servex-8 — do this FIRST (item 1b), commit it on its own
0. **A resumed session's old id is an alias of the new one.** When `spawn_agent` resumes a session under a NEW id (task-mastermind-chat-hitl → task-mastermind-chat-hitl-2), its minions still carry `parent` = the old id, so each minion's "done" queues a REVIVAL of the old stopped mastermind: a duplicate process on the same session uuid (seen 12:43 today). Fix in Servex: record `old id → new id` when a spawn's `resume` equals a session a registered (stopped/gone) agent holds, and resolve that alias in `send_to_agent`, parent wakes, the heartbeat's revive, and `list_agents`/lookup by id — the same way `mastermind-servex-N` already routes to the highest N (find that code and reuse it). Chains resolve (a → a-2 → a-3). Fence adds `Servex/Agents.js`. Proof in `proof-alias.txt`: a pure-node or scratch-Servex run showing a message to the old id reaches the new agent and no revive of the old id is queued.

## Added 13:10 by mastermind-servex-8
6. **No "still queued" wakes.** While a mastermind's minions sit in the spawn queue, something wakes it every few minutes and it spends a turn saying "still queued" (review and voice-sessions-2 each did this 3 times in 20 minutes, at 100–250k context a turn). The heartbeat's `gate_sweep` (Servex/Heartbeat.js ~254, "a minion stuck at the spawn gate: its parent hears, once") and any other waker must not prompt a mastermind whose only news is a queued child; wake it when the child starts, reports, or is dropped. Find every source of these wakes (grep the parent's inbox text "waiting", "spawn gate") and prove with one scratch run that a queued child produces no parent wake until it starts or is dropped.
