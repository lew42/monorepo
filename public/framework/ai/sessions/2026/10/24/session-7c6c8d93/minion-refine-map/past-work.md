<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Budget   6" (words: budget)

## Tasks (8, best first)
- 2026-10-24 [Budget: $6](/framework/ai/sessions/2026/10/24/session-7c6c8d93/minion-refine-map/) — (no outcome logged)
- 2026-10-02 [Stalled tasks + budget vs actual: Servex/asks/tasks.js writes tasks.j…](/framework/ai/sessions/2026/10/03/stalled-and-budgets/stalled-and-budgets/) — public/framework/ai/tasks.json exists now, regenerated every ~60s. stalled check: 32 of 149 tasks stalled now, e.g. openrouter-harness (owner agent stopped) snooze/kill/re-prioritise verb lines + 3 Servex tools budget vs actual: 8 of 149 tasks have a Budget: …
- 2026-09-30 [Servex reliability: smoke, pool, budgets, aliases](/framework/ai/sessions/2026/09/30/node-reliability/node-reliability/) — Merges pass again, take_worktree works, budgets are enforced (needs a Servex restart). reviewed: 4 fixed, 2 noted, [review.md](review.md) smoke skips targets uncommitted in the main tree; merge refuses a mangled path: [proof](smoke-uncommitted-proof.txt) resu…
- 2026-10-17 [heartbeat-landed](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/heartbeat-landed/) — One rule for landed (Servex/Landed.js via Task.replay); heartbeat, compact nudge never wake a landed or over-budget agent; merged e6d593c0e; Servex needs a restart.
- 2026-10-17 [Your undone asks, each one checked](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/) — All 620 undone asks checked against the repo by Haiku: 229 verified undone, 240 found already built, 151 unclear (the two numbers agree). Ten spot-checked verdicts all right. The undone-asks page has verdict chips and evidence links; the verdict doc has the n…
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-08 [Cheap-model routing: spawn-decision log, pace calibration, ask-audit …](/framework/ai/sessions/2026/10/08/mastermind-cheap-models/mastermind-cheap-models/) — Spawn-decision log and pace tools built; the live Haiku proving ground is blocked, not faked. spawn-decision log: [spawns.jsonl](spawns.jsonl) + [decisions.mjs](decisions.mjs) Haiku proving ground (5 questions): harness extended ([facts.mjs](/Servex/ext/openr…

## Docs and readmes
- [Local Model Context Budget & Tool Bloat](/framework/ai/local/doc/context-budget.md) — Why local models fail on MCP tooling, how input/output tokens share the 32k window, and how to use them safely. ## The Total Context Rule: …

## Commits
- 4df11ec24 spend gate: budgets are estimates, not caps. The results allowance auto-continues (+$5, logged, one nudge, no…
- 84fba1717 servex: heartbeat checks refuse an over-budget agent up front, logged once
- a76c61e14 servex: one rule for landed (Task.replay); the heartbeat, nudge and nag never wake a landed or over-budget ag…
- d3b12aaa9 task-system: paused at the budget line; what is left is on the plan card
- ec3a43646 refine queue: 7-day run, 61 prompts ($5.72 incl. the 4-prompt cost probe), stopped at the $5 budget before 87…
- 05382ad6e live-refine: measurement script + real Haiku run (98 sentences, real dictation)
- 95140e8f4 feat(servex): budgets are advisory; only a $100 runaway backstop and the results-gated allowance are enforced…
- 62f4adb0e task-audit: accuracy and budget caveat at top of spend.md

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,486 tokens of reading, under the 100k limit).

Question: Budget: $6

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Budget: $6"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
