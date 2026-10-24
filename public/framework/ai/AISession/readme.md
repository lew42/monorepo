# AISession — one Claude session as a class family

`AISession` reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The grid they feed is the Sessions page (`ai/sessions`).

- `AISession.js` — one session's cost, read from its raw transcript (browser and node).
- `AISessionsPage.js` · `AISessionView.js` · `AISessionRows.js` · `AISessionBuckets.js` — the grid page, its row, how rows nest and fold.
- `AISessionDetail.js` · `AISessionConversation.js` · `AISessionCoverage.js` · `AISessionTrace.js` — a session's own page and its tabs. A clicked row opens that session's full page in place of the list (previews plus full detail views: [design/navigation](/framework/design/navigation/readme.md)); the sessions page no longer calls `columns()`.
- `AISessionLive.js` · `AISessionFollow.js` · `AISessionResume.js` · `AISessionFlags.js` — live tail, follow, resume, flags.
- `AISessionDigest.mjs` — one transcript boiled down by plain Node: sizes, exact cost, owner prompts, result, `digest.json` and procedural `tags()` ([round 4](sessions/2026/10/16/voice-20261016/past-work/round4-result.md)).
- `AISessionIndex.mjs` (also snapshots record-only sessions; test `AISessionIndex.test.mjs`) · `AISessionSource.mjs` · `AISessionTailer.mjs` · `AISessionAudit.mjs` — node side: index, source, tail, cost audit.
- `AISessionCost.mjs` — the canonical node cost counter (one log, one number); rule, pipeline and before/after in `doc/cost-accounting.md`, test in `AISessionCost.test.mjs`.
- A session folder's one record is `session.jsonl`; a task folder keeps `task.jsonl`: [../sessions/doc/session-record.md](../sessions/doc/session-record.md).
- Decisions: [doc/accounting-decision.md](doc/accounting-decision.md) — the session-folder shape is folded into the task system; each ask's verdict.
- `PromptLog.js` · `StoreFolder.js` — prompts of a session, and the folder one lives in.

Watch out: a *Claude Code* session here is not [`ext/Session`](/framework/ext/Session/), the voice session. The old lowercase shims were retired to `ai/archive/retired/2026-10-13/sessions/`.
