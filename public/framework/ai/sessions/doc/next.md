# Sessions: next

Found by the fresh-eyes review of 2026-10-13 ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)).

- ✅ **Coverage tab: flat rows** (`b0e568d13`, `9245dd11d`). Each refined prompt is one `details` row with a rule beneath it, no outer card; at 1920 twelve prompts fit above the fold where four did (1200: ten, was five). `AISessionCoverage.js`.
- ✅ **A session page's title is on the first paint** (`bcc2f48fd`). `AISessionsPage.child()` now waits for the rows (`AISessionDetail.preload()`) before the page is built, because `Page.child()` does not await `route()`; the name is the first crumb text, never the id. Alternative not taken: awaiting `route()` in core.

## Sessions on Browse (next brief, 2026-10-14)

The owner, 2026-10-14: the Inbox and Sessions are "the same essential problem", one component. The Inbox landed on [Browse](/framework/ux/Browse/) first ([architecture](/framework/ux/Browse/doc/architecture.md)); Sessions is the second surface.

- **What it takes:** `AISessionsPage` mounts a `Browse` whose `draw_list()` is its existing `DataGrid` (the scope trail and chips above it), and whose detail pane is the session page it already opens as a side peek. The side-peek CSS in `sessions.css` goes; Browse's list width (a third at 1920) and grip replace it. The grid's Table/Rail switch follows the list's width: rail of cards under ~40em, table above.
- **Watch:** the grid's sticky header needs the list pane to be the box that scrolls (DataGrid readme, "Watch out"); the left sub-tab rail (Sessions, Docs, Readme…) stays outside Browse, beside it.
- **Size:** one Sonnet build, about an hour; shots at 400 / 1200 / 1920 / 3440 against requirements-10 asks 5 and 6.
