# The cheap ladder, on the Models page: one minion in a side-by-side trial

You are one of two minions building the SAME thing in separate worktrees. Your mastermind judges both and merges only the better one.

## The question this answers
"What is the CHEAPEST model that passes our simple tests?" The four simple tests (rungs) are `h1-page`, `fix-label`, `broken-import` and `broken-overflow`, in that order. Each lives at `public/framework/ai/tests/<id>/page.jsonl`: line 1 is the test, and every later line `{"run":{...}}` is one model's attempt (fields such as `model`, `effort`, `pass`, `score`, `cost_usd`, `turns`, `note`; a later line with the same `run` name merges onto the earlier one).

## What to build
A new section on the existing Models page, [/framework/ai/system/models/](http://127.0.0.1:62741/framework/ai/system/models/), titled **"The cheap ladder"**, placed ABOVE the current chart:
- One table, one row per model that has run at least one rung, **cheapest first** (free models at the top).
- Columns: model · $ per 1M tokens in / out · one column per rung (pass, fail, or a dash for "not run") · $ per run (mean of its real runs) · price × Sonnet.
- One plain sentence above the table, computed from the data: the cheapest model that passed all four rungs, or, if none did, the cheapest that passed the most.

## How (the page never computes; a node script does)
- The numbers come from `Servex/ext/openrouter/evals/models.mjs`, which writes `public/framework/ai/system/models/models.json`. Extend it to add a `ladder` block. Prices come from `public/framework/ai/2026-09-30/openrouter-harness/test-library/ladder-models.json` where they are listed. Otherwise use OpenRouter's public `https://openrouter.ai/api/v1/models` (no key needed). Use Anthropic's list price for Claude models. Sonnet is $2 in and $10 out per 1M tokens.
- Draw it in `public/framework/ai/overview.js`, in `render_models()`, using the same widgets the page already uses.
- Run the script, then check the page.

## Your worktree (work ONLY here)
`C:/Code/lew42/worktrees/lt2-cheap`, on branch `worktree/lt2-cheap`. Its own site is at `http://127.0.0.1:62741/`.
Edit only these files there: `Servex/ext/openrouter/evals/models.mjs`, `public/framework/ai/overview.js` and `public/framework/ai/system/models/models.json`.

## Rules
- **Do NOT merge, and do NOT run merge.mjs.** Commit in your worktree. Do NOT spawn minions.
- Read the readme chain first: the root `readme.md`, then `public/framework/readme.md`, then the readme in each folder you work in.
- Log as you go in your task log (its path is in your first message), with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`.
- **Check it works:** `node Server/smoke.mjs <your worktree> /framework/ai/system/models/` (run from your worktree) must exit 0. Save `shot-1200.png` and `shot-400.png` of the page in YOUR task folder (`public/framework/ai/2026-09-30/openrouter-harness/pairs/models-ladder-cheap/` in the main repo, `C:/Code/lew42/monorepo`).
- When done, write `result.md` in your task folder in five to ten plain lines: what you built, the files, what works, what doesn't. Then stop.
