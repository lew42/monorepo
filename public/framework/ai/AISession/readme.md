# AISession — one Claude session as a class family

`AISession` reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The grid they feed is the Sessions page (`ai/sessions`).

- `AISession.js` — one session's cost, read from its raw transcript (browser and node).
- `AISessionsPage.js` · `AISessionView.js` · `AISessionRows.js` · `AISessionBuckets.js` — the grid page, its row, how rows nest and fold.
- `AISessionDetail.js` · `AISessionConversation.js` · `AISessionCoverage.js` · `AISessionTrace.js` — a session's own page and its tabs. A clicked row opens that session's full page in place of the list (previews plus full detail views: [design/navigation](/framework/design/navigation/readme.md)); the sessions page no longer calls `columns()`.
- The session page's tabs are **Overview · Tasks · Chat**, then Coverage, Cost, Models and tokens, Related. `?tab=work` opens Tasks and `?tab=conversation` opens Chat. Above the tabs sits the sticky stats bar (`SessionStats.js`: cost, model, running for, done X of Y, the one segmented bar); it reads the tree `SessionWork` loads, so one load serves the bar, the Overview and the Tasks tab. `SessionOverview.js` draws the Overview's four cards side by side (Open, Project, Done, Dropped), with the phone's classes (`MobileRow`, `MobileTaskRow`, `mob-` CSS); `SessionTaskRow.js` is the phone's task row that opens the task's full page and shows its cost. Their styles, and the full-screen mode with two floating buttons (`AISessionDetail.full_screen`, `?full`), are `SessionOverview.css` (prefix `sov-`).
- `SessionWork.js` (+ `.css`) — the **Tasks** tab (the old Work view; its `SessionWork.split(root)` also feeds the stats bar and the Overview): its work nested by task folder (`sessions/doc/variants/SessionTree.js` over `ai/index.json`), own and rolled cost, tasks complete of created, open tasks, the Today ▾ pill (`ux/Filter/TimeFilter`), Approve. `Approvals.js` writes `{"approve":{"at","by":"owner"}}` to the session's own `session.jsonl` plus a pointer in that day's `day.jsonl` (the line the tab streams); `Review.js` is the leak rule and its numbers (finished 1 h, over $0.50, over a day old).
- `AISessionLive.js` · `AISessionFollow.js` · `AISessionResume.js` · `AISessionFlags.js` — live tail, follow, resume, flags.
- `AISessionDigest.mjs` — one transcript boiled down by plain Node: sizes, exact cost, owner prompts, result, `digest.json` and procedural `tags()` ([round 4](sessions/2026/10/16/voice-20261016/past-work/round4-result.md)).
- `AISessionIndex.mjs` (also snapshots record-only sessions; test `AISessionIndex.test.mjs`) · `AISessionSource.mjs` · `AISessionTailer.mjs` · `AISessionAudit.mjs` — node side: index, source, tail, cost audit.
- `AISessionCost.mjs` — the canonical node cost counter (one log, one number); rule, pipeline and before/after in `doc/cost-accounting.md`, test in `AISessionCost.test.mjs`.
- A session folder's one record is `session.jsonl`; a task folder keeps `task.jsonl`: [../sessions/doc/session-record.md](../sessions/doc/session-record.md).
- Decisions: [doc/accounting-decision.md](doc/accounting-decision.md) — the session-folder shape is folded into the task system; each ask's verdict.
- `PromptLog.js` · `StoreFolder.js` — prompts of a session, and the folder one lives in.

Watch out: a *Claude Code* session here is not [`ext/Session`](/framework/ext/Session/), the voice session. The old lowercase shims were retired to `ai/archive/retired/2026-10-13/sessions/`.
