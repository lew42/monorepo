# AISession — one Claude session as a class family

`AISession` reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The grid they feed is the Sessions page (`ai/sessions`).

- `AISession.js` — one session's cost, read from its raw transcript (browser and node).
- `AISessionsPage.js` · `AISessionView.js` · `AISessionRows.js` · `AISessionBuckets.js` — the grid page, its row, how rows nest and fold.
- `AISessionDetail.js` · `AISessionConversation.js` · `AISessionCoverage.js` · `AISessionTrace.js` — a session's own page and its tabs.
- `AISessionLive.js` · `AISessionFollow.js` · `AISessionResume.js` · `AISessionFlags.js` — live tail, follow, resume, flags.
- `AISessionIndex.mjs` · `AISessionSource.mjs` · `AISessionTailer.mjs` · `AISessionAudit.mjs` — node side: index, source, tail, cost audit.
- `PromptLog.js` · `StoreFolder.js` — prompts of a session, and the folder one lives in.

Watch out: a *Claude Code* session here is not [`ext/Session`](/framework/ext/Session/), the voice session. The old lowercase shims were retired to `ai/archive/retired/2026-10-13/sessions/`.
