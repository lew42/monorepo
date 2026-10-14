# Session detail layout (2026-10-12)

**Chosen:** tabs on top (Conversation, Cost, Models and tokens, Related), `?tab=` in the URL. Conversation is the main tab; the chat fills the view and scrolls inside itself, so no other panel can push it away.
**Alternative recorded:** a left nav (same panels, always visible). Rejected: the detail already sits beside the session list, and a third column cramps the chat.
**Dropped:** the "All sessions" back button and the id + `session-detail.js` line (the page title already names the session).
**Footer** ("N open tasks on this page"): kept, but a compact chip with its own background; it re-reads `tasks.json` on every render so landed tasks vanish ([page-work-line.md](../../../core/Page/ai/doc/page-work-line.md)). It is not a stream yet.

## How chat bubbles are stored today
Bubbles are drawn by `ext/Chat` from the raw transcript lines (`/ai-logs/<id>/session`, tailed by `AISessionFollow`); the cards the AI posts come from the session folder's `page.jsonl`. They are not page items yet. The direction (owner, 2026-10-12): a bubble becomes a page item written by a page-tool delta, so the work shows up live; the owner's message text should come from the refine pipeline's clean text (`mastermind-refine-haiku-live` owns it; this view will read it, not build a second).

## Raw logs and asks (2026-10-13)
**Raw** lives in the Conversation tab's header: `task.jsonl` (the session's own folder) and `transcript` (`/ai-logs/<id>`, dev server only), drawn by `AISessionDetail`.
Each ask in the Coverage tab ends with `line N`, a link to `/ai-logs/<id>#N`, the prompt's line in the transcript; the cite link beside it opens the same words inline.
Coverage is a flat list of rows (no card around each prompt); twelve fit above the fold at 1920.
The page's title is the session's name from the first paint: AISessionsPage.child() preloads the rows and the day-index snapshot (AISessionDetail.preload) before the page is built. Detail: next.md.
