# Models: which agent runs on what

The table is drawn from `now.json`, which `node Server/ModelsNow.mjs --write` computes (roles.js, the live registry, the OpenRouter spend log, `usage.json`). The switch between Claude and OpenRouter is explained in [Servex/ext/openrouter/readme.md](/Servex/ext/openrouter/readme.md). Benchmarks (which model is best value) are at [ai/doc/models.md](../doc/models.md).

- **Review, 2026-10-13** ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)): the page drew its tables after an `await`, so they landed outside the page; now the box is captured first. The AI tab bar still lights INBOX on this page (it is not a tab).
