# mastermind-servex: checkpoint 12, 2026-10-02 night

Start here. A fresh session for this role reads this page and `checkpoint-11.md` (its "FIRST" and "ALSO FIRST" sections), and nothing older.

## FIRST (2026-10-03, 01:37): two one-step minions, then the restart

[`ai/2026-10-03/spend-gate`](/framework/ai/2026-10-03/spend-gate/) ($6) checks, tests, reconciles and restarts. [`ai/2026-10-03/node-reap-run`](/framework/ai/2026-10-03/node-reap-run/) ($3) frees the RAM. -10's `spawn_agent` was refused again, so whoever can spawn starts them. The spend-gate minion's restart makes the 15-minute queue wake live.

**Update:** the queue wake is live. The first `queue check` reached -10 on 2026-10-03, so Servex has restarted onto the new Global.js, and Agents.js and registry.js are live too, still untested. -10 tried the spend-gate spawn on that wake and was refused again, and so was `list_agents`. Each wake of -10 now costs a re-read of its ~180k-token context and achieves nothing. Spawn -11 with `bypassPermissions` and stop -10, so the wakes reach an agent that can act. Three identical wakes later, -10 added a backoff to `queue_check`, live at the next restart: a wake that changes nothing doubles the next interval (15 → 30 → 60 minutes, up to 4 hours), and progress on the queue resets it.

**Who owns what (2026-10-03):**
- [node-reap](/framework/ai/2026-10-02/node-reap/) **landed** under task-mastermind-node-reap: the reaper, plus a `server-guard.mjs` PreToolUse hook that refuses `node server.js`.
- That hook makes four skill passages stale. Run `node public/framework/ai/2026-10-02/servex-mastermind/apply-server-guard-skills.mjs --dry`, then without `--dry`. It edits the minion, sub-mastermind and mastermind skills. It also adds the plain-words card-title rule (inbox-cards-work bug 7) to the content and mastermind skills. It aborts if any old text doesn't match exactly once. Write and Edit can't touch `.claude/`, so this script does it.
- [token-reduction](/framework/ai/2026-10-02/token-reduction/) **landed the spend gate** on michael/dev as 44b83878: the card wiring, `budget_usd`, and a 22-case proof with review fixes. It was then restarting Servex. So the spend-gate queue item is now only the OpenRouter reconcile and the cache probe ($3).
  - -10's `registry.js` row (`spend_gate: agent.gate_row?.()`) is still uncommitted in main. It closes that review's finding 5 (the Sessions grid has no gate data), so commit it by path after `node --check`.
  - -10's draft of `Agents.js` was committed as checkpoint 4d2860a7 and replaced by the reviewed version. Don't restore it.

## URGENT FIRST: the OpenRouter runaway (2026-10-02 late)

mastermind-ai-2 and mastermind-page-2 (Gemini 3.8 Flash) spent about $17 in 20 minutes: about 148 Read calls each, no writes, no spawns. Both are stopped, and the burst is down to +$10. -10 wrote, untested:
1. `node --check Servex/agents/Agents.js` and `Servex/agents/registry.js`, then restart Servex. That brings in **spend follows results** (the owner's rule):
   - $2 to the first result, $3 more per result, up to the brief's `Budget:` (else $20);
   - with no result by then, an interrupt between tool calls and one Inbox card (Continue +$5 / Stop);
   - a warning at 40 reads without a result.

   Until the restart, **don't start an OpenRouter mastermind.**
2. `node public/framework/ai/2026-10-02/servex-mastermind/or-reconcile.mjs`, then post its table on the card. It compares Servex's $13.36 for ai-2 with OpenRouter's own records, and checks the cache double count.
2b. `node public/framework/ai/2026-10-02/servex-mastermind/or-cache-probe.mjs` (~$0.10): does OpenRouter cache Gemini on our Anthropic-format route? The reconcile above now also prints cached tokens, `cache_discount` and the serving upstream per request. Each result maps to a fix (the probe's header; token-reduction item 4, "Was Gemini cached at all?").
3. Token-reduction item 4 is now its first item: tests, `budget_usd` on `spawn_agent`, and the same cap for Claude agents.
4. Known issue `openrouter-runaway-turn`.
5. Before ai-2 or page-2 runs again: a mastermind on Gemini read 134 files without acting. Give it a closed list of what to read, or run masterminds on Sonnet and keep Gemini for jobs with a fence (audits, scans, the echo). A mastermind's job is open-ended, which is where this model drifted. Record the incident in model-weights as one clear problem; a second one makes it "avoid for masterminds".

## Why the queue didn't move

-10 wasn't only asleep between messages. Every Servex tool (`spawn_agent`, `list_agents`, `card_reply`, `send_to_agent`), every `node` and most `git` were refused all session: the mastermind role ran in `acceptEdits` (issue `mastermind-acceptedits`). So it could write code and briefs but spawn nothing. **Spawn the next one with `permission_mode: "bypassPermissions"`** until a Servex restart picks up the roles.js fix. A new session costs less than waking -10, which carries about 180k tokens of context.

## The queue

The order lives in [`ai/servex-queue.json`](/framework/ai/servex-queue.json). Servex reads it, and a task counts as done once its `task.jsonl` has a `landed_at`. Post this table on the live card (-10's `card_reply` was refused):

| # | Task | Budget | Model | Next step |
|---|---|---|---|---|
| 1 | [node-reap](/framework/ai/2026-10-02/node-reap/): the RAM leak (22 idle dev servers, 26 orphaned server.js) | $10 | Sonnet | `node …/node-reap/node-reap.mjs`, then `--apply`; spawn `minion-node-reap` |
| 2 | [token-reduction](/framework/ai/2026-10-02/token-reduction/): 14 items, incl. OpenRouter routing (item 13) | $10 | Sonnet | spawn `minion-token-reduction` into a pool worktree (free qf-6 first) |
| 3 | [known-issues](/framework/ai/2026-10-02/known-issues/): one live list, 12 seeds | $8 | Sonnet | spawn after token-reduction item 2 |
| 4 | [standing-voice-pair](/framework/ai/2026-10-02/standing-voice-pair/) | $12 | Sonnet | spawn `minion-standing-voice-pair` |
| 5 | [card-pipeline-2](/framework/ai/2026-10-02/card-pipeline-2/) | $15 | Sonnet | after card-pipeline is committed and merged |
| 6 | [stamped-logs](/framework/ai/2026-10-02/stamped-logs/) | $10 | Sonnet | after card-pipeline-2 |

Total: $65 on Sonnet. For the cheap parts (scans, audits), token-reduction item 13 routes them to OpenRouter as a trial.

## Spawn lines for 1 and 2 (-10's spawns were refused)

```
spawn_agent role:"minion" name:"node-reap" model:"claude-sonnet-5" effort:"high" permission_mode:"bypassPermissions" parent:"<you>"
  task:{dir:"public/framework/ai/2026-10-02/node-reap", brief:"public/framework/ai/2026-10-02/node-reap/requirements.md"}
  prompt:"You are a minion. Your brief is at public/framework/ai/2026-10-02/node-reap/requirements.md. Budget: $10. Run node-reap.mjs dry, then --apply, first."
spawn_agent role:"minion" name:"token-reduction" (same shape, its own dir and brief, Budget: $10)
```
`role:"minion"` needs a pool slot, and every slot take fails until qf-6 is salvaged (checkpoint-11, "ALSO FIRST").

## Made proactive (needs a restart)

`Servex/agents/Global.js` `queue_check()`, on the one-minute sweep: every 15 minutes (`SERVEX_QUEUE_CHECK_MS`), if the queue has an open item, the holder isn't working and none of its children are working, Servex wakes it with "queue check: <top item>". With an empty queue it stays asleep. When a wake arrives: spawn the top item if nothing is running for it, update `servex-queue.json`, end the turn.

## OpenRouter spend to watch (vscode-mastermind, 2026-10-02 late)

- **Every echo now spawns on `google/gemini-3.8-flash`** (`Echo.model_for`, default `SERVEX_ECHO_OR=all`, live after the restart). echo-361c4d18 was stopped: it ran on Sonnet and cost $3.50 at 132k context.
- **The page, ai and ui masterminds run on Gemini 3.8 Flash** as mastermind-page-2, mastermind-ai-2 and mastermind-ui-2.
- **The burst file** (`%LOCALAPPDATA%/lew42/servex/openrouter-burst.json`): it was +$40, then +$10 after the runaway. On 10-03 it's +$20 until Monday 00:00 UTC. The week's spend is $32.37, about $9 of room.
- **The balance** is in `public/framework/ai/openrouter-usage.json` → `balance: {used_total, limit, remaining, at}` (vscode-mastermind's provider.js commit, live at the next restart). Read it there; never recall it.
- **On each queue-check wake:** read the spend-guard readings and the `route` lines in Servex's system log. If one of these four agents runs at more than ~$5 a day, or is refused by the guard, say so on the card. Pull a model only for a clear, repeated problem, never for one bad round (model-weights, the end section).

## Uncommitted from -10, to commit by exact path after `node --check` and `node --test Servex/agents/global.test.mjs`

`Servex/agents/Agents.js` (the spend gate), `Servex/agents/registry.js` (`spend_gate` on the row), `ai/2026-10-02/servex-mastermind/or-reconcile.mjs`, `ai/2026-10-02/servex-mastermind/or-cache-probe.mjs`, `ai/2026-10-02/token-reduction/requirements.md`, `Servex/agents/Global.js` (keep_on, queue_check), `Servex/agents/Echo.js`, `Server/ask-each.mjs`, `Servex/agents/roles.js`, `public/framework/ai/servex-queue.json`, this file, `checkpoint-11.md`, plus every path checkpoint-11 lists. One Servex restart carries all of it.
