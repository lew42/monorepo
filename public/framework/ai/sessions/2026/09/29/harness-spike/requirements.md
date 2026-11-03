# Harness step 1: the OpenRouter proxy spike

**Goal:** prove that a non-Claude model can run as a real Servex agent, with the real MCP tools, and survive a Servex restart. One measured run per model. Budget: about $5 of OpenRouter credit, one Sonnet minion.

**Blocked on:** the key file `%LOCALAPPDATA%\lew42\servex\openrouter.key` (the owner's Question card `2026/09/29/openrouter-key-for-the-harness-spike`). Never copy the key into the repo, a log, a card or task.jsonl.

## Do

1. Read the key from that file in node at spawn time. Spawn with `spawn_agent` and a per-agent `env`: `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, `ANTHROPIC_AUTH_TOKEN=<key>`, `ANTHROPIC_API_KEY=""`, and the model as an OpenRouter slug (one GPT, one Gemini).
2. **Strip the Claude login.** `Agents.js:525` builds the child env as `{ ...process.env, ...this.env }`, so any Claude token in Servex's own env reaches the child. Prove the child's env has no `CLAUDE_CODE_OAUTH_TOKEN` or other Anthropic credential before the first turn.
3. The brief for each spiked agent: read one card with `read_card`, write a two-sentence summary with `card_reply` to a test card you create, then call `append_log`. That exercises the servex MCP tools.
4. Wake it with `send_to_agent` after its turn ends; check it answers.
5. **Restart survival.** `recipe()` (`Agents.js:448`) does not keep `env`, on purpose (secrets). So a revived proxy agent comes back with NO proxy and would hit Anthropic under a GPT model name. Record what actually happens; propose the fix (e.g. a `provider` field on the row, and the env rebuilt from the key file at wake) — do not build it.
6. **Cost:** read OpenRouter's `usage.cost` (or `GET https://openrouter.ai/api/v1/generation?id=`) and write it on the task's cost line. The SDK's `total_cost_usd` is wrong for proxied models.
7. Second arm, only if time is left: the same brief through `npx opencode-ai`.

## Land

A one-screen report in this folder: a table (model × tools worked × woke × survived restart × real cost), what broke, and the proposed fix for restart. Then `Servex/doc/openrouter.md` with what works, linked from /framework/servex/. Run finish-task.

## Must-haves this feeds (architect-review.md items 9–12)

Events not timed wakes; a node step loop; the heartbeat (reuse task-loop-2's, don't build a second); everything plain node over agent messages, so it runs the same on any provider.
