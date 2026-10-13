# One home for tasks and sessions: end the flat `ai/YYYY-MM-DD/` folders (mastermind brief)

**Owner (2026-10-12):** tasks still go to `ai/2026-10-12/<slug>/` while sessions live at `ai/sessions/2026/10/12/session-<id>/`.
> "Having a folder for every day inside of the AI folder… is an anti-pattern. I thought we were moving to nesting them, and actually I kind of think they should all be in the sessions folder… We cannot be having two similar but different systems where we have redundant data."

**Today:** 49 `ai/2026-*` day folders, written by the `new-task` and `finish-task` skills (`.claude/skills/new-task/SKILL.md`: `ai/<YYYY-MM-DD>/<slug>/`, `day.jsonl`), read by the day dashboard, Servex (`spawn_agent` task dirs, ledgers, TaskLoop), `asks.jsonl`, links in hundreds of docs.

## Done when (tick each with proof)
- [ ] **Past asks first:** gather every earlier ask/decision about task and session folder layout (grep `asks.jsonl`, `ai/doc/`, sessions docs, handover) into `ai/doc/task-folders.md`; settle conflicts; decide. Owner's direction: tasks nest under `ai/sessions/YYYY/MM/DD/` with the sessions (a task is a child of the session that ran it, CLAUDE.md "a child session or task lives inside its parent's directory"). Record the alternative (e.g. `ai/tasks/YYYY/MM/DD/`).
- [ ] **New writes go to the new place:** `new-task`, `finish-task`, `append.mjs` callers, Servex spawn/task code, the dashboard. One path helper (a class) that every writer uses, so this can't drift again.
- [ ] **Move the old ones by script** (CLAUDE.md "moves are scripted"): node, `git mv`, dry run first, manifest of every old → new path, reversible; rewrite links by script from the manifest; old URLs redirect (router alias) so nothing 404s. Never destructive. Commit the dry run, then the move, then the link rewrite, separately.
- [ ] Smoke clean; a crawl of `/framework/ai/` shows 0 new 404s; `hold.mjs` around the move; one Servex restart proven on a private port; merge.
- [ ] Coordinate: tell running masterminds (`list_agents`) the new path before the move; their task dirs move with the script, so do the move when none is mid-write (or pause dispatch).

Opus 5.5 for the decision, Sonnet for scripts. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
