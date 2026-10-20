# Brief: class Project extends Task (a play class, nothing wired in)

Branch `task/project-class` in your own worktree (take_worktree). Read `public/framework/core/Task/readme.md` and `Task.js`, and `public/framework/ai/doc/sessions-and-tasks.md`.

Build `core/Task/Project.js` (`class Project extends Task`): stages requirements, investigation, plan, approval, work, landed; subtasks; a `completed` value 0 to 1 computed from its subtasks (code, not recalled); start/complete times. Add `Project.test.mjs` beside it in the style of `Task.test.mjs`. Do not wire it into State, Servex or any page, and do not touch other files except a line in `core/Task/readme.md`. Commit on the branch, then merge with `node Server/merge.mjs <worktree> --skip-smoke` only if the review passes. Report in two sentences on your task log.
