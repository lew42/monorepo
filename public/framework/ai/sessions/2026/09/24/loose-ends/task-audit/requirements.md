# Task audit, 2026-09-17 to 2026-09-24 — one Sonnet minion per task

## The owner's words (relayed by the owner's-tab mastermind, condensed but faithful)

"Spawn a Sonnet minion for every single task, every prompt that was asked, especially if you have my original prompts. Claude Code session ids should be logged; you might be able to reload those sessions and ask them the status. Find unfinished stuff, but also HALF-finished stuff that sort of works but isn't really done: loose ends, or potential that wasn't finished. Pay attention to the quality of results from the different models: if Sonnet minions can do things for a third of the cost, let's do that. If you find 150 tasks that could use an audit, spawn 150 minions and chase them all down."

## Deliverables
1. One Sonnet minion per task dir (184 dirs, 09-17 to 09-24; today's loose-ends and task-audit excluded), in waves of at most 20.
2. One row per task: status (done / half-done / abandoned / superseded), what is missing (one sentence), the potential left unrealised (one sentence), worth-finishing 1–5.
3. One page, ranked by worth-finishing, the top ten as one-paragraph briefs at the top.
4. Model quality: five rows spot-checked by the mastermind; Sonnet's hit rate, cost per row, and whether Haiku would have done.

## Minion brief

You audit ONE task. Repo: C:\Code\lew42\monorepo. **Read only** — never edit the repo, never start or restart a server, never drive a browser tab the owner has open. Never write a person's name; say "the owner".

1. Read `public/framework/ai/<your task>/requirements.md` (if any), `task.jsonl` (the `assign` lines: request, outcome, landed_at, links; plus `chat`, `decision`, `ask` lines), and any `page.js` / `*.md` in the dir.
2. Check the result exists: open the files and pages its outcome links (read the files; `curl -s -o /dev/null -w "%{http_code}" http://monorepo.localhost/<path>` for a page). Grep later task dirs (`public/framework/ai/2026-09-*`) for the slug or the thing it built, to see whether something later superseded or finished it.
3. Only if the status is still genuinely unclear AND task.jsonl has a `session_id`: you may ask that session ONE question with `claude -p --resume <session_id> --fork-session --model claude-sonnet-5 "One line: is <thing> finished, and what was left undone?"` (a fork never changes the original). Most tasks won't need this; it is expensive.
4. **Every negative claim needs proof.** Before you write "never applied", "not moved", "no link", "missing", grep the repo for the exact value, file or name (e.g. `grep -rn "34cqi" public/framework/core/`, `ls` the destination dir, grep the parent's `children:`). Spot checks of the first wave found three of four such claims false — the thing was there. If you cannot prove it is missing, it is not missing.
5. Judge against the owner's own request, not against the task's own report of itself. "Half-done" = it sort of works but isn't really done, or it is built but not wired in or linked, or a proposal nobody applied.
6. Write exactly one JSON object with the Write tool to the file named in your prompt:

```json
{"task": "<date>/<slug>", "title": "<what it was, one line>", "request": "<the owner's ask, short verbatim quote if there is one>", "status": "done|half-done|abandoned|superseded", "missing": "<one plain sentence, or empty>", "potential": "<one plain sentence: what finishing it would give the owner>", "worth": <1-5>, "evidence": "<the file or url you checked, one line>", "forked": <true|false>}
```

worth: 5 = the owner would clearly want it finished soon, and it is close · 3 = useful, not urgent · 1 = leave it. Done tasks are usually 1.

7. Reply with one line: status and worth.
