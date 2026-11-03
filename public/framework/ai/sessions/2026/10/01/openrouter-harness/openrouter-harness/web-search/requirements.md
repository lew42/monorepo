# Minion brief: web search on OpenRouter minions, and who pays

Parent: `task-mastermind-openrouter`. Read the parent's `requirements.md` "Phase 6" section. Run
this right after rung 1 of the test library, then go back to the ladder. It's small: about $0.50.

## The four questions
1. **WebSearch** on a proxied non-Claude minion: does it fail, get dropped, or get served by
   OpenRouter's own search? Does any call reach Anthropic?
2. **WebFetch's summary call:** which model and which host does it go to? The Claude CLI picks its
   small model from `ANTHROPIC_SMALL_FAST_MODEL` / `ANTHROPIC_DEFAULT_HAIKU_MODEL`, which defaults
   to a `claude-haiku` id. Through OpenRouter that id may become a PAID Claude call on our key:
   check the generation list for it.
3. **Prove nothing reaches Anthropic.** Blanking the env vars is not enough, because the CLI also
   reads its stored login from the config dir. For the test child, ALSO set `CLAUDE_CONFIG_DIR` to
   an empty temp dir, so no Anthropic credential exists anywhere in its world. Anything that needs
   one then fails loudly. Measure cost with OpenRouter's per-generation stats (`real_turn_cost`),
   listing each generation's `model`, not just the total.
4. **Recommend** the cheapest reliable search for OpenRouter minions, with its $/search. Compare
   at most three: OpenRouter's `web` plugin or an `:online` model, WebFetch on known URLs only, and
   one search API as an in-process Servex tool (price it from its public pricing page; don't sign
   up for anything).

## How
- A small script, `Servex/ext/openrouter/evals/websearch.mjs`, built on `spike.mjs`'s direct
  `query()` pattern (not a Servex spawn, so you control the child's env fully). Use
  `deepseek/deepseek-v4.1-flash` and `openai/gpt-6-luna`, one turn each: "Search the web for
  <a fact from this week>, then fetch <one known URL> and quote its title." Record the tool calls,
  the errors, and every generation id with its model and cost.
- If the summary call goes to a `claude-*` id, retest with `ANTHROPIC_SMALL_FAST_MODEL` and
  `ANTHROPIC_DEFAULT_HAIKU_MODEL` set to the agent's own model. If that fixes it, add those two
  vars to `env_for()` in `provider.js` (the OpenRouter path only), and say so in your reply.
- Write the answers to gaps.md as one new numbered gap each (what, why, workaround, evidence).

## Fence
The qf-7 worktree. Write only `evals/websearch.mjs`, `provider.js` `env_for()` (only as above),
`Servex/ext/openrouter/gaps.md`, and this task dir. Never read, print or log the key.

## Reply
Four lines, one per question, each with the evidence (generation model ids, $), then the
recommendation with its $/search.
