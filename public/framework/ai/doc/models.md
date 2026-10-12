# Which model for which job

Measured 2026-10-12 with the known-answer suite (`Servex/ext/openrouter/evals/quick.mjs`): 27 tasks in our real job shapes, 5 models, 2 thinking levels, 270 calls, **$0.15 in total**. The table with pass rate, seconds and cost per task is on [/framework/ai/models](/framework/ai/models). Re-run it with `node Servex/ext/openrouter/evals/quick.mjs --table`.

## One line per job shape

- **Voice fast and smart assistants:** `openai/gpt-6-luna`, low thinking. It is the cheapest non-Anthropic model that passed 27 of 27 (about $0.00003 per task).
- **Code edit with a test:** luna passed 8 of 8; use Claude Sonnet for real multi-file edits, since the suite only checks small functions.
- **Readme check, card classification:** luna (low). DeepSeek and Gemini at low thinking each missed one card.
- **Transcript clean:** luna (low). Gemini at high thinking failed 2 of 3 (it over-thought), so never raise thinking here.
- **Refine step (asks, tags, ranking):** luna (low); Refine now runs on it.
- **Extraction, summary, reasoning:** every model passed; take the cheapest, luna.
- **Reference:** Claude Haiku 5.5 also passed 27 of 27 at about the same price, so it is the Anthropic fallback. Sonnet 5.5 missed 1-2 tasks and costs about 14x more per task.

Thinking "high" never beat "low" on this suite, and cost up to 20x more (Gemini). Use low.

## The fallback

The voice pair uses luna while OpenRouter has a key and is not over its spend guard. If the key is missing or a call errors, the session falls back to Claude (`Sessions.claude_model()`) and posts a notice in the chat; Refine falls back to Claude Haiku (`RefineCall.FALLBACK`). Both are proven on a private Servex by `Servex/agents/voice-models-proof.mjs` (with key: luna everywhere; without: Claude everywhere).

## Caveats

- Haiku 5.5 is priced at $0.10 / $0.50 per million tokens on OpenRouter; that listing, not an assumption, is used in the table.
- The suite is small and checkable; it ranks models for simple jobs. Judgment-heavy work (architecture, review) stays on Sonnet or Opus.
