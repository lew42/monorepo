# Sessions: next

Found by the fresh-eyes review of 2026-10-13 ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)); left for a later pass.

- **Coverage tab: a card inside a card.** Each refined prompt is a `details` box inside a white card, about 70 px apart at 1920, so only three prompts fit above the fold. One flat list of rows (the box alone) would show seven or eight. `AISessionCoverage.js`.
- **A session page's title arrives late.** The crumb and the column head are drawn with the id and renamed once `sessions.json` answers (`AISessionDetail.retitle()`); a route that could wait for the row would draw the name first, but `Page.child()` does not await `route()`.
