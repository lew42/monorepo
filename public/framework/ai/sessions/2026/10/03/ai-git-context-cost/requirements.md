# Three AI systems: Git, Context, Cost (pages that collect how we work)

## The ask (owner, 2026-10-03, dictated while leaving; "just thinking out loud")
> Maybe it's done as a separate commit so that it can be reversed easily. We should probably have a Git system, an entire system, like ai/git: it's all AI-driven, and the masterminds should be able to log a whole system of improvements for using Git properly. Frankly we should have an AI context system: notes about how context works and how to optimise the context window: when to run compactions, when to start a new agent versus reuse an old one. And maybe ai/cost as a whole system: what things cost and how to analyse whether to do something or not, whether to shut down, whether to proceed, how to evaluate decisions based on cost. Model costs should probably be in the model section.

## Want (small; collect what exists, don't invent)
Three pages under /framework/ai/ (as Systems once @task-mastermind-system-class lands; plain pages if it hasn't): **git**, **context**, **cost**. Each: one screen, level 1 shows its rules as cards, each rule linking to where it came from.
- **git:** gather what's already decided (merge.mjs and review gate, worktrees and the pool, commit by exact path, integrations as their own commits, never delete in main, the git-guard hook).
- **context:** gather what we've learned (whole-file vs chunked reads cost, compaction behaviour, fresh agent vs reuse, big text by hook or path, transcripts kept 10 years).
- **cost:** gather the spend rules (usage pace, spend follows results, $2 to first result, the OpenRouter guard and prices, thinkers vs doers), and link to the Sessions cost charts and the Models page for model prices.
Sources: CLAUDE.md, .claude/skills/mastermind, Servex/readme.md, the memory notes the mastermind can point you to, ai/2026-10-02/token-reduction and model-weights briefs.

## Fence
Three new page folders under public/framework/ai/ and the children line that links them (coordinate with system-class, which is editing ai/page.js). Model: Sonnet doer. Budget $6.
