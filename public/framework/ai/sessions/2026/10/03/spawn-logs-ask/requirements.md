Budget: $3.

# Servex: every spawned task writes its own line in the asks ledger

**Why:** [day-audit](/framework/ai/sessions/2026/10/03/day-audit/) found that about half of today's asks are missing from `public/framework/ai/asks.jsonl`, including spawned tasks (prompts-live, subcard-columns, topic-cards, now-card-blank, system-class). The task folders are complete; the ledger relies on someone remembering to write it. Make it code (law 7).

## What to build

1. When `spawn_agent` is called with a `task`, Servex appends one ask line itself, right after `open_task()` writes the task's first line (`Servex/agents/Agents.js`, about lines 158 and 711):
   - **title:** the card's title (or the brief's `# ` heading if there's no card);
   - **owner:** the new agent's id;
   - **words:** the brief's path;
   - **status:** `building`.
2. Use the writer that already exists in `Servex/asks/` (`Asks.js`; see its readme). Don't write a second one.
3. Skip it when the ledger already has an open line for that task dir or card, so a re-spawn or resume never doubles it.
4. **Tests** (beside `Servex/asks/asks.test.mjs`): a spawn with a task adds exactly one line; a second spawn on the same task adds none; a spawn without a task adds none.

## Land

`node --check`, the tests, commit by exact path, merge. It goes live on the next Servex restart; don't restart just for this. Append an `experiment` line once the first real spawn after that restart shows its ask line.

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
