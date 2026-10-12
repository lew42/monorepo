# Our own AI harness — preliminary plan

**Question:** should we build our own model-agnostic harness, and what do we build first?
**Short answer:** not a new harness first. Add OpenRouter as a second backend under Servex, prove it on one real brief, and build our own loop only where that proves broken.

Made from the research at [/framework/research/harness/](/framework/research/harness/) (two rounds, 53 entries) and reviewed by the Servex architect ([architect-review.md](./architect-review.md)).

## Build order

| # | Build | Why | Rough cost |
|---|---|---|---|
| 1 | **Proxy spike, as a real Servex agent.** `spawn_agent` with its own `env`: `ANTHROPIC_BASE_URL` at OpenRouter, the OpenRouter key (kept in LOCALAPPDATA, never the repo), and no Claude login. A non-Claude model (GPT, Gemini, Grok) runs a real small brief with the real MCP tools, is woken, and resumes after a Servex restart. **Second arm:** the same brief through opencode. **Cost from day one:** OpenRouter's `usage.cost` goes on the task's cost line, since the SDK prices a proxied turn with Anthropic's table and gets it wrong. | Answers build-or-proxy with one measured run per model (`cjuqp`, `q0snn`, `ah7hc`). | about $3–5 |
| 2 | **The provider field goes live.** `tiers.js` already has a `provider` nothing reads; `Agents.spawn()` picks the backend from it, across the three files that import the SDK (`Agents.js`, `jobs.js`, `tools.js`). Claude stays on the subscription. | The seam exists (`cx5h6`, `adijt`, `de2ph`). | about $3 |
| 3 | **Cross-family review.** Not a build: `Server/review.mjs --model <openrouter slug>` plus the provider from step 2. Opus writes, GPT or Gemini reviews on true / logical / useful; count caught defects before any fleet. | Mixed model families beat same-model review (`c0ptu`, `ad16o`). | about $2 per task reviewed |
| 4 | **A path fence.** A PreToolUse hook in `Agents.js` (it already has one for forks) refuses a Write or Edit outside the brief's globs. Not `canUseTool`: agents run in `bypassPermissions`, which skips it. Worktrees stay the hard wall, since Bash still passes. | The one real sandbox gap (`cqabo`, `ceq98`). | about $2 |
| 5 | **Model picker on the card.** Chosen when a card is created and changeable after; the options are OpenRouter model slugs. The assistant model stays in config. Last, because it is AI 2 UI and that page's owner isn't running. | The owner's switcher (`coks7`, `d9rz5`). | about $3 |
| 6 | **Our own loop, only where step 1 fails** — on `@openrouter/agent`, rebuilding compaction, resume/fork and the long-lived session. | The expensive part, built only on evidence (`cd7rg`, `c0lzh`). | unknown until step 1 lands |

**First thing to build:** step 1, the proxy spike.

## Watch out

- Claude minions stay on the subscription. Per-token Claude through any gateway could cost far more for the same work (`ca7gw`).
- `fork_self` gets no prompt-cache discount across providers. Measure what a fork costs on the proxied model before fleets rely on it.
- Caching and thinking still differ per provider under OpenRouter (`ccb22`, `cbydr`); expect per-model quirks in step 1.
