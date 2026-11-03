# The day dashboard — requirements

Mike, 2026-08-13 pm: with multiple Claude Code tabs kicking off parallel
projects, `ai/<date>/` should be a **dashboard of current / past / proposed
work by project name**, readable while tasks run.

- One **card per task, a full row each**, most recently active first, a live
  mark while a session is working. Not a timeline — parallel tasks don't read
  as one line of time.
- `session.json` records **as much as we have** — tokens, agent count, model,
  window before/after — written **at launch**, `landed_at` stamped last.
- The task page shows the **requirements** and the **log in nested form**
  (agent replays under the session's own).
- The check-claude-usage skill writes `public/framework/ai/usage.json`
  (gitignored); the dashboard renders it as the usage strip.
- A task's `page.js` is optional: undeclared task dirs route to
  `AISession({src})`; undeclared dates route to a dashboard page.

Names, settled: a **session** (one Claude transcript, the uuid) works a
**task** (`ai/<date>/<slug>/`); a **day** is the dashboard over its tasks.
Sessions and tasks are many-to-many — the manifest's `session_id` is the join.
