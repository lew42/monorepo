# Architect's review of plan.md (mastermind-servex-3)

**Verdict: step 1 is the right first build, with four changes to the spike and a new order after it.**

1. **Run the spike as a real Servex agent** (`spawn_agent` with a per-agent `env`), not a side script. That way the same run proves what Servex depends on: a resume after a Servex restart, a wake when the turn ends, and a turn with the real servex and site MCP tools (50+ tools; Gemini and GPT tool-schema limits show up here, not on a toy brief).
2. **Set the proxy per agent, never on Servex itself.** Put `ANTHROPIC_BASE_URL` plus the OpenRouter key in that child's `env`, and make sure it carries no Claude login, so a subscription token can never reach OpenRouter. The key lives in LOCALAPPDATA, never in the repo.
3. **Log cost from the spike on (fold step 3 into steps 1 and 2).** The SDK prices a proxied turn with Anthropic's price table for whatever model name it sees, so `total_cost_usd` will be wrong. Take OpenRouter's `usage.cost` into the task's cost line, or every early number is false.
4. **Fence with a PreToolUse hook, not canUseTool.** Agents run in `bypassPermissions`, which skips canUseTool. Agents.js already refuses tools with a PreToolUse hook for forks; reuse that.
5. **Step 6 is not a build.** `Server/review.mjs` (the fresh-eyes review task, building now) takes `--model`, so the cross-family reviewer is that option plus the provider from step 2.
6. **New order:** 1 (with cost) → 2 → 6 via review.mjs → 5 → 4. The picker comes last because it is AI 2 UI, and that page's owner is not running.
7. **fork_self gets no prompt-cache discount across providers.** Measure the cost of a fork on the proxied model before fleets rely on it.
8. **Step D of [the every-page design](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md)**: when step 2 makes `provider` live, the checkers in `check()` and `consensus()` switch to OpenRouter models and turn on its `web` plugin (Exa, about $0.007 a request) when a claim needs the web. The SDK's WebSearch is an Anthropic server tool, so it is unlikely to work for a proxied non-Claude model; test that in the spike.

## Must-haves for the harness build (owner, 2026-09-28, on programmatic loops)

9. **Events, not timed wakes:** node reacts to agent messages (turn ended, tool called, finish-step) the moment they happen.
10. **A step loop in code:** node sends step k; the agent calls a `finish_step` tool; node sends step k+1. Which step comes next is node's decision, never the model's.
11. **A heartbeat:** node checks every agent about once a minute, prompts it after 5 silent minutes, and escalates to Waiting on you if it stays silent. Task-loop builds this for today's SDK agents, and the harness reuses it rather than building a second one.
12. **Model-agnostic:** all of it is plain node over agent messages, so it works the same on the Claude SDK, OpenRouter and local models.
