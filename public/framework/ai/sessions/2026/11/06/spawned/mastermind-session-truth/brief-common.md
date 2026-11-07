# Every brief of this job (read it with your own brief)

- Load the `minion` skill first. Read `public/framework/ai/sessions/doc/finding.md`, `public/framework/ai/sessions/doc/one-folder.md` and `public/framework/core/Session/readme.md` (sections "Completion reads", "Does the task system work?", "Open question") before you design anything.
- The owner's words: the parent task is `session.jsonl` in this folder (line 1). The point of the whole job: the session/task/completion system is true, ENFORCED BY CODE, not by agents' habits (CLAUDE.md laws 5, 7, 10).
- Work in your own worktree (`node Server/worktree-up.mjs <slug>` or `take_worktree`); commit after each working step, never in the main tree. Do not merge: report "ready", and the mastermind reviews and merges.
- Never kill or restart the dev server or Servex, never drive the owner's tabs, never stash (diff, don't stash). If a change needs a Servex restart to go live, say so in your report; do not restart.
- Every class or script you touch gets a lean `X.test.mjs` (core/Test) that passes. `node --check` every file you edit.
- Docs current in the same commit: the readme or doc your change makes stale (`documentation` skill). No dated logs in readmes.
- Findings and decisions are `log` / `decision` lines in YOUR task log (the item tool on your task dir), never a findings.md. Before building, write a short `plan.md` beside your brief (current structure with file:line, the change, the test) and log one line; then build without waiting for a reply.
- Report back in one screen: what is ready (branch, commits), the test output line, what is left and why, whether a Servex restart is needed.
