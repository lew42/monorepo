# The cheap ladder: DeepSeek V4 Pro's side (written by its mastermind)

The minion (DeepSeek V4 Pro, through OpenRouter) built the whole thing in 10.5 minutes for about $0.30. Its turn then died before it wrote this file or committed anything.
- **What it built:** a "The cheap ladder" section on [/framework/ai/system/models/](/framework/ai/system/models/), above the chart. It has one row per model, free models first, and one computed sentence: "The cheapest model that passed all four rungs is Claude Haiku ($0.2230/run)."
- **Files:** `Servex/ext/openrouter/evals/models.mjs` (the `ladder` block), `public/framework/ai/overview.js` (`render_models`), and `models.json`. It stayed inside its fence.
- **What works:** `smoke.mjs` exits 0, and the screenshots are in this folder.
- **Why it died:** it tried to look at its own screenshot. DeepSeek takes no image input, so OpenRouter answered 400 and the turn ended. Every later wake re-sent the image and failed the same way.
- **Fixed by the mastermind:** the Claude prices were stale ($3/$15 for Sonnet, $15/$75 for Opus). They now match OpenRouter's catalog: Sonnet 5 is $2/$10 and Opus 5.5 is $4/$20.
