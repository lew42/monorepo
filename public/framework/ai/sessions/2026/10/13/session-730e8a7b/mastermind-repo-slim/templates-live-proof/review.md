verdict: fix
1. [fix] Deliverable 1 (the live proof) is missing: `public/framework/core/Task/tasks/templates-live-proof/` does not exist, and this dir's task.jsonl holds only the assign, one "skill: minion" log line and a commit. There are no timestamped observations and no approve→spawn seconds.
2. [fix] Deliverable 2 is half done. The two small fixes and their unit tests are in the diff, but task.jsonl has no `needs_restart` line and no note that the proof must be re-run after the restart. The diff is also not merged yet: Servex/TaskLoop.js:218 on the main tree still reads `approved_by: d.approved_by ?? null`.
3. [fix] Deliverable 3 is missing: core/Task/doc/templates.md has no "Proven live" line, and no `finish` line carries a measurement. If the proof cannot run before the restart, the doc line should wait, but the landing must say so.
4. [note] Servex/agents/page_tools.js:585 (turning a string approve/improve/reject into `{note}`) looks correct. Task.replay_line passes line[verb] as an object and would otherwise drop a bare string. Servex/agents/verb-note.test.mjs covers it.
5. [note] Simpler fix for approved_by: Servex/TaskLoop.js:218 falls back to the approve line's `by`, but Task.approve (core/Task/Task.js:251) still sets `approved_by: null` for every other reader, such as the browser card. Passing `line.by` into the verb args inside Task.replay_line would fix it once, for everyone (one of everything). That edit is outside this task's fence, so take it as a follow-up.
6. [note] The verb-note test writes a fixture under public/framework/ai/sessions/2026/10/16/ and cleans up in `finally`. That is fine, but a crash before `finally` (say, a failed import) would leave a dot-folder in the live tree. os.tmpdir() would be safer if run_item accepts paths outside the site.

## Requirements
- 1 "create one real task … approve it; show within two minutes that list_agents has the spawned agent …" — no — no proof task folder, no observations in task.jsonl
- 2 "If it does not fire: … fix the small cause in a worktree with a unit test, merge.mjs, log needs_restart" — partly — fixes and tests are in diff.patch; not merged, no needs_restart line
- 3 "templates.md gets a 'Proven live' line … Landing … checked with tail -1" — no — no doc line, no finish line
## Words
- n/a — the diff changes no page or prose. The code comments at page_tools.js:585 and TaskLoop-launch.test.mjs:60 are one line each and plain.
