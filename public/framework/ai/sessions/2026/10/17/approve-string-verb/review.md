verdict: pass
1. [note] Simpler, wider fix: `Task.replay_line` (public/framework/core/Task/Task.js:356) only takes a verb when it is an object, while `approve()`/`verdict()` (Task.js:241, 252) already accept a bare string. Letting replay take a string too would cover every writer (the browser Store, hand-written lines, the line already sitting in the templates-live-proof log). Right now only the item tool is fixed.
2. [note] The string-to-{note} step (Servex/agents/page_tools.js:586) only looks at top-level keys. A verb sent to a subtask by its id (`{"k2":{"approve":"ok"}}`) is still written as a string and still ignored on replay. Fixing replay (finding 1) would cover this case too.
3. [note] The `approved_by` fallback (Servex/TaskLoop.js:218) takes the `by` of the last `approve` line, even when Task refused that approve (e.g. the task was not waiting). It also ignores a `{"verdict":{"is":"approve"}}` line. This is harmless in practice, but `d.approved_by` and the fallback can name different people.
4. [note] Servex/agents/verb-note.test.mjs:9 writes its fixture under public/framework/ai/sessions/2026/10/16/, which the live site watches. The folder is removed afterwards, but a scratch dir outside public/ would avoid a stray reload.

## Requirements
- 1 "bare-string approve/improve/reject becomes {note} in the item tool": yes. page_tools.js:586 does it, and verb-note.test.mjs passes in the worktree (approve "looks good", state goes waiting -> running).
- 2 "TaskLoop.read_task falls back to the approve line's own by": yes. TaskLoop.js:218, and TaskLoop-launch.test.mjs passes (approved_by "voice-app"); its spawn counts were updated correctly for the new task e.
- 3 "Tests: verb-note.test.mjs, TaskLoop-launch.test.mjs": yes. Both print "all checks passed" on worktree/approve-string-verb.

## Words
- The comments are one line each and say why (replay reads verbs as objects): yes.
- No page changed, so there are no shots and no widths to report.
