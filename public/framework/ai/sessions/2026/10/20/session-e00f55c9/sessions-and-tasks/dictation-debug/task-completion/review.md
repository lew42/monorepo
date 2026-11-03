verdict: fix
1. [fix] This is the third review of this folder against `review/diff.patch`, which is still the "name the mastermind for its job" wording pass (branch `worktree/mastermind-word`, commits 4815cea5e, 837bff550, d22220f67), not this task. None of the four steps in `requirements.md` exist anywhere: no node script that lists v-sq8y7db's tasks, no output file, no done/total checked against the `completion` query, no cause with file:line, no `plan.md` in this folder, and no screen timing. The replacement work in `sessions/2026/10/25/session-e06424f1/mastermind-tasks-completion/requirements.md` is a Tasks tab ("Done 7 of 39"), which covers part of ask 1 but not steps 1, 2 or 4. So pass this folder only once those steps land here, or close it as superseded with a link to where each step went.
2. [fix] A fresh agent still can't tell this task's state from the folder. `task.jsonl` has an `assign` line naming mastermind-tasks-completion, but `requirements.md:5`'s gate is still unticked, and nothing says which of the four steps were dropped, moved or done. Add one line per step to `task.jsonl` (done, moved and where, or dropped and why), or stop this task with a reason.
3. [fix] Point the review at the right branch. `review.mjs` keeps reading this folder because the wording branch's agent uses it as its open task dir (see the replies in `task.jsonl`). Give the wording work its own task folder, `requirements.md` and review, so its review stops landing on task-completion and failing for that reason alone.
4. [note] The wording diff itself now hangs together. `policy.js:148,169` lets the smart seat spawn `mastermind`. `session-smart.md` (diff line 292) says `model: "sonnet"` unless the work is judgment, which settles the Opus-vs-Sonnet split raised last time. `readme.md` and `Dispatcher.js:1-11` name `page-mastermind` for the Dispatcher's row.
5. [note] Old wording remains on `michael/dev`: `roles.js:6,41,47` still say `task-mastermind`/"task mastermind" in comments (the diff's branch changes them, but it isn't merged), and about 40 doc lines under `Servex/agents/doc/` and `Servex/doc/` keep "task mastermind". The author has left those for the architect.
6. [note] `agent-rules.md`'s new section (diff line ~246) links `/Servex/agents/doc/names.md`, outside `public/`, so on the static site the link is dead. This was raised in both earlier reviews and is still open.

## Requirements
- 1 "Every task made in a session counts in that session's completion, and the session can check it" — no — the diff has no completion code, script or count; the Tasks tab elsewhere ("Done 7 of 39") is a separate task with its own folder
- 2 "Tasks are made quickly and reliably, and show on screen at once" — no — no timing, no delay named with file:line, in the diff or in this folder
- Step 1 measure (script, its output file, two numbers agree) — no — none exist
- Step 2 name the cause with file:line — no
- Step 3 `plan.md`, with one alternative — no — this folder has no `plan.md`
- Step 4 time the screen in both chat views — no
- Findings as `log` lines in `session.jsonl` — no — none for this task
- Class live-instances page — n/a
## Words
- Diff wording is plain and consistent: one `mastermind` role spawned at a path, named for its job, with old words listed as aliases — yes
- Docs say the same thing in both places (agent-rules.md, session-smart.md, roles.md table) — yes, apart from the unmerged comment leftovers in finding 5
