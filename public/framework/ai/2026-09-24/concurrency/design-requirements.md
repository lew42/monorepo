# Design brief — how agents should collaborate (one angle each)

Load the `minion` skill first. Read `requirements.md` beside this file: the owner's words are the acceptance test. Then skim `Servex/agents/readme.md` (the host, spawn/send/wake, the Dispatcher), `public/framework/ai/2026-09-22/tiers-design/page.js` + its `doc/` (the roles ladder today), and `.claude/skills/sub-mastermind/SKILL.md`.

Facts you can rely on (being built right now by a sibling minion): `fork_self(question)` runs a fork of the caller's own session in the background (resume + forkSession, so it hits the prompt cache); the answer comes back as a message to the caller. `wait_for_agent(id)` returns when an agent ends its turn. `spawn_agent` can resume or fork an existing session. Servex is one long-lived node process that holds every agent, owns every log, and exposes tools over MCP; a tool handler is plain node code running inside it.

**Write ONE file only:** `C:/Code/lew42/monorepo/public/framework/ai/2026-09-24/concurrency/proposal-<angle>.md` (your angle's slug is in your prompt). Read-only everywhere else. Do not edit code. Under 120 lines.

## Your proposal must have

1. **The rule in one sentence**, plain words, for a newcomer.
2. **The design** for your angle: concrete — which tool, which message, which log line, who does what. Name existing pieces (spawn_agent, wake_parent, registry.json, task.jsonl, the AI board) rather than inventing parallel ones.
3. **Timing**: where time is lost today (an agent in a 40-second tool run cannot answer a message), and how much your design saves. Estimate honestly; mark guesses as guesses.
4. **A picture**: describe ONE diagram (boxes and arrows, in words or ASCII) that would make your angle obvious at a glance.
5. **What to build next**, at most three items, ranked by benefit per effort, each one line.
6. **What NOT to do**, at most three lines — traps (runaway recursion, token blow-up, two agents in one file).

Reply with the file path and your one-sentence rule.
