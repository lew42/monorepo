Budget: $5.

# Spend gate: tested, then OpenRouter caching fixed

Re-scoped by vscode-mastermind's review of 2026-10-03: steps 1 to 4 now, the restart (step 5) only after [restart-keeps-agents](/framework/ai/2026-10-03/restart-keeps-agents/) lands. The caching probe and fix moved here from [openrouter-reads-cache](/framework/ai/2026-10-03/openrouter-reads-cache/), which keeps only "read in one turn".

The spend gate's full rule is token-reduction item 4 (`public/framework/ai/2026-10-02/token-reduction/requirements.md`): $2 to the first result, $3 per result after that, up to the brief's `Budget:` line (else $20), then an interrupt between tool calls and one Inbox card with Continue (+$5) or Stop. The gate itself landed in token-reduction (44b83878).

1. **Check the syntax:** `node --check Servex/agents/Agents.js Servex/agents/registry.js Servex/agents/Global.js Servex/agents/Echo.js Server/ask-each.mjs`. Fix any syntax error. (worktree-servers-revive may already have done this; if so, just confirm.)
2. **Write `Servex/agents/spend-gate.test.mjs`** with a fake `generation_cost` and fake tool results:
   - $2 with no result interrupts once and posts one card;
   - a successful commit unlocks $3, and a failed one doesn't;
   - an open tool call delays the interrupt until it returns;
   - the brief's `Budget:` line sets the ceiling;
   - `grant(5)` reopens the agent;
   - a front-desk agent (no task, Claude) is never gated.
3. **Run it**, `node --test Servex/agents/global.test.mjs`, and the existing Agents tests.
4. **OpenRouter caching** (the owner's "did we solve the OpenRouter dilemma?"; we were billed as if nothing was cached, about 10.6M input tokens and $17 in 20 minutes for one mastermind):
   1. Run `node public/framework/ai/2026-10-02/servex-mastermind/or-reconcile.mjs`. It reads OpenRouter's `/api/v1/generation` for each request and reports cached tokens, `cache_discount` and which upstream provider served it.
   2. Run `or-cache-probe.mjs` in the same folder (about $0.10). It sends the same prefix twice on five routes and its header maps each result to a fix.
   3. Fix it by that mapping: an upstream that switches between requests → pin it in `Servex/ext/openrouter/provider.js`; the Anthropic route drops caching → route Gemini through chat/completions, or record that it can't be fixed; nothing caches → report the cost multiplier and the direct Google API as the alternative, with Google's price on the day. Read prices and token counts from the API's responses, never from memory (law 7).
   4. Before and after: run one small known task on Gemini 3.8 Flash (a 3-file read-and-summarise) before the fix and after it. Post both costs from `/generation` on the card.
   5. Append each output's summary, and both costs, as `experiment` lines in this task.jsonl. Keep OpenRouter spend under $1 (check `public/framework/ai/openrouter-usage.json` `balance` first).
5. **Later, not now:** commit by exact path and merge now; the restart that makes the gate, the 15-minute queue wake (`Global.queue_check`), the crash watchdog and the echo fixes live waits until restart-keeps-agents has landed. After that restart, check Servex's log for a `queue-check` line within 15 minutes and update the known issue `openrouter-runaway-turn`.

Not in this step: wiring the card's buttons, the Claude per-call pricing and the Sessions column (they stay in token-reduction item 4). Sonnet, high effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
