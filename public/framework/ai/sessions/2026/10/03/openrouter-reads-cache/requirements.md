Budget: $2.

# OpenRouter: Gemini agents read all their files in one turn

**Why:** the owner asked, "did we solve the OpenRouter dilemma?" Gemini agents read files in many small turns, 100-line chunks at a time, and each turn re-sends the whole context. (vscode-mastermind, 2026-10-03.) The caching half moved to [spend-gate](/framework/ai/2026-10-03/spend-gate/) (vscode-mastermind's review of 2026-10-03); do this after it lands, so the before/after costs there aren't mixed with this change.

1. **Find out first whether parallel tool calls work.** Gemini on OpenRouter, through our Anthropic-format route (`ANTHROPIC_BASE_URL=https://openrouter.ai/api`, set in `Servex/ext/openrouter/provider.js` `env_for`), may not pass parallel tool calls through. Spawn one tiny Gemini 3.8 Flash agent (budget $0.20) and ask it to read three named small files in one turn. In its transcript, count the `tool_use` blocks in its first assistant message. Record the result as an experiment line.
2. **Add the instruction for OpenRouter agents only.** Find where Servex builds an agent's system prompt or first-turn preamble (start in `Agents.spawn`), and add it there for `provider === "openrouter"` only:
   - list every file you need, and request them all in ONE turn as parallel tool calls;
   - read each file whole, once; never in 100-line chunks; never re-read a file already in context.
   If step 1 showed that parallel calls don't pass through, word it as "read all files in your first turn, then work from context", and record what was found.
3. **Before and after:** the same 3-file task on Gemini 3.8 Flash before and after the instruction; post both costs from `/generation` on the card, and append them as `experiment` lines.

## Land

Commit by exact path and merge. It goes live on the next Servex restart; don't restart just for this. Keep OpenRouter spend under $0.50.

Sonnet, medium effort. Don't wait on the owner.
