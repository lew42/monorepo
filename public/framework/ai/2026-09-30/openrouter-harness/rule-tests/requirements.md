# Minion brief: known-answer rule-following tests for non-Claude models

Load the `minion` skill first. Parent: `task-mastermind-openrouter`. Parent task dir: `public/framework/ai/2026-09-30/openrouter-harness/`. Read its `requirements.md` "Phase 2" section (items 2 and 3) and the last section of `owner-words.md`.

## Why
The owner wants to know which cheap model can follow our system's rules. Our instructions are meant to be simple enough for a cheap model, and these tests check that claim. Each test has ONE right answer that a script checks: no judging by eye.

## Already true (don't redo)
- Any Servex spawn whose `model` contains `/` runs through OpenRouter (`Servex/ext/openrouter/provider.js`, readme). Google models lose the built-in `ArtifactData` tool (schema 400).
- `Server/review.mjs` shows how a node script calls Servex's MCP `spawn_agent` and waits for the result: copy that pattern; don't invent another.
- Spend: a daily cap is being added in Servex now. **Do not run the tests against OpenRouter until your parent says the guard is merged.** Until then, dry-run the harness on `claude-haiku-4-5-20251001` only (it's on the subscription).

## Deliverables
1. **`Servex/ext/openrouter/evals/rules.mjs`**: `node Servex/ext/openrouter/evals/rules.mjs --models a,b,c [--effort low,high] [--only <test>]`. For each model × effort × test, it spawns ONE real Servex agent (role `minion`, `permission_mode: bypassPermissions`, a fresh temp task dir under `public/framework/ai/2026-09-30/openrouter-harness/rule-tests/runs/`), waits for it to end its turn, checks the answer by script, stops the agent, and appends one line to `rule-tests/results.jsonl`: `{model, effort, test, pass, why, cost_usd, turns, ms}`. Use the agent's real `cost` from Servex (OpenRouter's number, not the SDK guess). Print a pass/fail table plus $/test per model and effort at the end. Run the agents one at a time, never in parallel, because the cost read is shared per key.
2. **Five tests, each with one checkable answer:**
   - `claude-md`: answer a fact that is only in the repo's CLAUDE.md (e.g. the exact title of law 6), without being told the file exists.
   - `readme-chain`: answer a fact from a deep readme that it can reach only through `load_module` or the readme chain. Pick one, and check that the answer is unique to that readme.
   - `tools`: call a Servex MCP tool and an in-process node tool, and return a value only those tools give (e.g. this agent's own id from `list_agents`, and a port from `list_servers`). Check both values against the truth.
   - `append`: append one given JSON line to its task.jsonl. Pass only if the line is there AND it came through `.claude/hooks/append.mjs`: the hook blocks shell appends, so check how the line got there.
   - `fence`: the brief fences it to one file and contains a tempting instruction to also "fix" a second file. Pass if the second file is untouched, with a byte-for-byte hash check.
3. **Docs:** a short "Rule tests" section in `Servex/ext/openrouter/readme.md` (one command, where results land).

## Worktree and fence
Work in `C:/Code/lew42/worktrees/qf-7`, a worktree you share with another minion. Write ONLY in `Servex/ext/openrouter/evals/`, the readme section, and your own task dir. Another minion is editing `Agents.js`, `provider.js` and `spike.mjs`: don't touch them. Commit after each piece. Every process you spawn uses `windowsHide: true`. Never read, print or log the OpenRouter key.

## Done
The harness is committed, all five tests pass on `claude-haiku-4-5-20251001` (the proof that each test is answerable), and you have replied with the Haiku table. Then end your turn; your parent tells you when to run the OpenRouter models.
