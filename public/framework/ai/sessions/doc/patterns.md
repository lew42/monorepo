# Where session data lives today

Counted by `node Server/session-patterns.mjs --write`, not typed. Every row opens in the same detail view, `/framework/ai/sessions/<id>/`.

| Pattern | Example | Count | How it is read |
|---|---|---|---|
| Session store, dated | `ai/sessions/2026/09/01/f825457a-2f19-4006-af89-83c5df126d07/` | 7766 | `Session.dir_url(id)` from the index `day` column. The shape new sessions are written in. |
| Session store, flat (old) | `ai/sessions/a56900e3-8b50-49d0-bb1c-42f986cd407b/` | 1 | `Session.locate` finds it and moves it into the dated shape on first write; `session-place.mjs` moves all. |
| Card folder by date | `ai/2026/09/19/session-tracking/` | 4084 | A Servex or VS Code card's `page.jsonl`. Listed from `sessions.json`; opens in the same detail view. |
| Task folder | `ai/2026-08-12/apps/` | 1064 | `task.jsonl` and the brief. Joined to a session by the `session_id` in its launch line. |
| Raw transcript (outside the repo) | `~/.claude/projects/<cwd>/<id>.jsonl` | 7806 | The source of truth, never copied. `Server/session-cost.mjs` reads it; the page reads the small cached summaries. |

## One id, several places

The unit is the Claude session id. **7811 distinct ids**, plus 3 card folders whose id prefix matches no other source. The counts above do not add up because a card folder or task folder is a *view onto* a session that already has a transcript, not another session.

| Pattern | Ids | Also in another pattern | Only here |
|---|---|---|---|
| Session store | 7767 | 7767 | 0 |
| Card folders | 4081 | 4081 | 0 |
| Task folders | 314 | 309 | 5 |
| Raw transcripts | 7806 | 7767 | 39 |

Ids found in both the row's pattern and the column's:

| | Session store | Card folders | Task folders | Raw transcripts |
|---|---|---|---|---|
| Session store | - | 4081 | 309 | 7767 |
| Card folders | 4081 | - | 2 | 4081 |
| Task folders | 309 | 2 | - | 309 |
| Raw transcripts | 7767 | 4081 | 309 | - |

A task folder counts every id in a `session_id` field of its `task.jsonl`, so one task can add several. Join by id; no further duplicate hunting.

How the folders are arranged is in [layout](layout.md).
