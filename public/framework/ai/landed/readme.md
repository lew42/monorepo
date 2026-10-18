# Landed: what got done today, yesterday, this week

Computed, never recalled: `node Server/Landed.mjs` reads every `task.jsonl`, counts a task landed when it has `assign.landed_at` or a `finish`/`complete` line, and writes `landed.json`. The page reads that file.

- `page.js` / `LandedPage.js` — the page: one list per day, newest first, each row a link to the task.
- `landed.json` — the data; rerun the script to refresh it (`--days 14` widens the window, `--print` shows it in the terminal).
- `doc/week-2026-10-17.md` — the hand-picked, prioritized highlights of this week (judgment, by the mastermind). One doc per week.

Related: the live tasks dashboard `/tasks/` shows in flight and queued; `/framework/ai/asks/undone/` shows what was asked and never built.
