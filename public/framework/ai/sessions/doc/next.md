# Sessions: next

Found by the fresh-eyes review of 2026-10-13 ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)).

- ✅ **Coverage tab: flat rows** (`b0e568d13`, `9245dd11d`). Each refined prompt is one `details` row with a rule beneath it, no outer card; at 1920 twelve prompts fit above the fold where four did (1200: ten, was five). `AISessionCoverage.js`.
- ✅ **A session page's title is on the first paint** (`bcc2f48fd`). `AISessionsPage.child()` now waits for the rows (`AISessionDetail.preload()`) before the page is built, because `Page.child()` does not await `route()`; the name is the first crumb text, never the id. Alternative not taken: awaiting `route()` in core.
