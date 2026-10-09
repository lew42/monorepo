# Where session data lives today

Counted by `node Server/session-patterns.mjs --write`, not typed. Every row opens in the same detail view, `/framework/ai/sessions/<id>/`.

| Pattern | Example | Count | How it is read |
|---|---|---|---|
| Session store, dated | `ai/sessions/2026/09/04/14d1a319-8650-4fde-a303-141ed06c6a14/` | 7720 | `Session.dir_url(id)` from the index `day` column. The shape new sessions are written in. |
| Session store, flat (old) | `ai/sessions/a56900e3-8b50-49d0-bb1c-42f986cd407b/` | 1 | `Session.locate` finds it and moves it into the dated shape on first write; `session-place.mjs` moves all. |
| Card folder by date | `ai/2026/09/19/session-tracking/` | 4072 | A Servex or VS Code card's `page.jsonl`. Listed from `sessions.json`; opens in the same detail view. |
| Task folder | `ai/2026-08-12/apps/` | 1064 | `task.jsonl` and the brief. Joined to a session by the `session_id` in its launch line. |
| Raw transcript (outside the repo) | `~/.claude/projects/<cwd>/<id>.jsonl` | 7793 | The source of truth, never copied. `Server/session-cost.mjs` reads it; the page reads the small cached summaries. |

How the folders are arranged is in [layout](layout.md).
