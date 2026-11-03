# Chat v2: a completed task shows checked

Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db: "this is basic, why isn't it working". Allowed in planning mode as a named bug.

**The bug.** The test task "Test task: show the life cycle" (`t-test-lifecycle`, under prompt `p-1792962657411` in `/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl`) was started and completed in the file, but Chat v2 drew it unchecked.

**The cause.** The item tool writes a change to a child through its parent: `{"p-…":{"t-test-lifecycle":{"complete":{…}}}}`. `ChatV2Model.edit()` had no branch for a key that names a child, so it stored the change as a stray field on the prompt.

**The fix (branch `worktree/fix-v2-nested-state`).** `edit()` hands a key that names one of the node's children to that child. `ChatV2.test.mjs` has a case for the nested form; `readme.md` lists it.

**Proof.** Folding the real session: before, the task is `idle`; after, `complete`. Headless on the worktree, the task draws `is-complete`. `ChatV2.test.mjs`: 44 passed, 0 failed.

`first-review/` holds a first review that was pointed at the parent folder by mistake and judged this diff against another brief.
