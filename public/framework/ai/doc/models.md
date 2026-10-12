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

## The default and the switch (2026-10-12)

**Claude by default; OpenRouter only by the switch** (the owner, 2026-10-12: "while we pay for Claude tokens anyway, keep OpenRouter to a minimum"; task [refine-haiku-live](/framework/ai/2026-10-12/refine-haiku-live/)).

- **Refine** (clean, structure, clarity, notes, live refine) runs on **Claude Haiku**: `RefineCall.model()` in `Servex/ext/refine/RefineCall.js` is the one place it is decided.
- **The voice assistants** run on Claude (`Sessions.claude_model()`).
- **The switch** is one file: `%LOCALAPPDATA%/lew42/servex/session-backend.txt`. Write `openrouter` in it and both move to luna on their next call, no restart; delete it to go back. A Claude refusal (usage limit, logged out) still moves that one voice session to luna by itself.
- Before 2026-10-12 the order was the other way round (luna first, Claude as the fallback); the evaluation above is why luna is the OpenRouter pick.

## Caveats

- Haiku 5.5 is priced at $0.10 / $0.50 per million tokens on OpenRouter; that listing, not an assumption, is used in the table.
- The suite is small and checkable; it ranks models for simple jobs. Judgment-heavy work (architecture, review) stays on Sonnet or Opus.
