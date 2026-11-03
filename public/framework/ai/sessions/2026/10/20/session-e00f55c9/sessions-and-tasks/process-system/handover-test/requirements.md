Budget: $4

# Prove two flows end to end with tests: handover by task, and one simple process

The written flow: `public/framework/ai/sessions/doc/session-record.md`, section "Session → task → child session". Process: `public/framework/core/Task/Process.js`, `Servex/ProcessRunner.js`, names in `core/Task/doc/process-names.md`.

1. **Handover by task.** `spawn_agent` with `task: {from, id}` moves a subtask from the parent's record into the child's folder (`page_tools.js` `move_item`). Write one test, with a temp store, that checks:
   - the subtask leaves the parent record and lands in the child folder with the same id and its history;
   - the parent's log gets exactly ONE reference line to the child (no duplicate when `SessionRecord.link_parent` runs again, or the daily `--links` backfill runs; the `as` reference and the move reference must not both appear);
   - the child's completion rolls up to the parent (the parent's record shows it complete).
   Find bugs, fix them, small and in place.
2. **One simple process.** A test that runs the smallest real process (two steps, e.g. build → review, through `ProcessRunner`) on a temp task: each step starts, completes with evidence (the new rule: `complete` needs `{outcome, evidence}`), and the task completes when the last step does. If one exists already, extend it rather than add a second.
3. Put one line per flow in `session-record.md` saying which test proves it.

Commit in your worktree; do not merge. Final reply: commits, what broke, pass counts.
