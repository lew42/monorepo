# Token reduction built into Servex, so it can't be forgotten and can't backfire: requirements

Budget: $10.

The owner, 2026-10-02 (trimmed): "checking usage should be an automatic process, so it's fresh… all the masterminds should be loading usage automatically. Being over should mean they're using lesser models and fewer models, not doing redundant checks… if it used to use a minion to do a review, maybe it just does it itself if it has the files already in memory… any other token-reducing strategies should be built into the system automatically, in a way that doesn't backfire."
#CLAUDE.md now carries the rule ("Usage pace", under Systems that shape every turn). This task makes the code enforce it.

## Build, by node (law 7), in this order (biggest saving first)
1. **Stop paying for finished agents.** The openrouter report found finished agents get woken about every 7 minutes, and every wake is billed. When a task has `landed_at`, Servex stops its minions and reviewers at once, and the heartbeat never wakes an agent that has nothing queued and no open task.
2. **Usage in every mastermind's prompt.** Usage.js keeps `ai/usage.json` fresh (about every 15 min). Servex prepends one line to every mastermind and task-mastermind start and wake: `Usage: 5h 12% · week 35% of 26% elapsed → pace 1.35 (OVER): Sonnet default, fewer agents, self-review`. Minions don't get it.
3. **The model policy at spawn.** When pace > 1, `spawn_agent` turns an `opus` request into `sonnet` unless the call carries `reason: "…"`, and Fable is never spawned. The result says what it did. It never changes an agent that's already running.
4. **Budgets.** Servex reads `Budget: $X` from the brief. At 100% it tells the mastermind once. At 150% it stops spawning new minions for that task and posts one Inbox card (with the cost, what's done, and Continue / Stop). Running tool calls are never killed.
5. **Reviews.** When over pace, merge.mjs accepts a review report written by the task's own mastermind for non-page changes (code, docs, hooks). A page or layout change still needs the screenshot review at the four widths.

6. **Revive keeps the provider; finished minions aren't woken.** Evidence: a FINISHED free-model agent (`minion-lib-h1-page`, nvidia/nemotron-3-ultra:free, 2026-10-01) was woken 9 times by heartbeat status checks and revives, and its cost went from $0 to $2.84. The revive seems to drop the OpenRouter `provider` and run it on Claude. Log: `%LOCALAPPDATA%/lew42/servex/logs/agent-minion-lib-h1-page.jsonl`.
7. **A message to an unstarted, queued agent** was routed to its stopped predecessor (`send_to_agent mastermind-servex-10` → "mastermind-servex-9 was not woken"). Queued agents should hold their messages (`held_messages`).

## Never backfires
- Never stop an agent in the middle of a tool call. Never touch the logging, guard or merge paths. Never downgrade the owner's VS Code session.
- Each rule logs one line to Servex's system log when it fires, so a wrong call is visible and can be reverted.
- Tests for each rule, including "a landed task's agents are stopped" and "Opus with a reason is kept".

## Rules
The #Servex mastermind owns it. A pool worktree, `merge.mjs`, and `sustain.mjs --restart` after landing. Never wait on the owner.
