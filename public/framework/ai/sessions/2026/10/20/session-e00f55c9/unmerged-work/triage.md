# Triage of unmerged `worktree/*` branches, 2026-11-03

Computed by `node Server/unmerged.mjs` (full table: [unmerged-2026-11-03.json](unmerged-2026-11-03.json)): **136 branches** have commits not on `michael/dev`. The brief said 40; those were the branches from the last ~2 days (the 14 recent ones below plus older ones noticed by hand): the tool counts every `worktree/*` branch, 136, most of them weeks old. Owners in this file were first matched by name; the tool now uses each log's own `branch` field, so a few task folders named here may show `unowned` or another task in the tool (89 of 137 own one). Branch work lives in worktree `C:/Code/lew42/worktrees/unmerged-work` (this task's code). Nothing was deleted or merged by this triage; the owning mastermind (the task folder in the table) or the owner decides. "Same files" = the branch's files are byte-identical on `michael/dev` today, a hint that the work landed under other commits.

Counts: **merge 7 · check 8 · superseded 17 · abandoned 15 (logs only) · older, presumed abandoned 89** (probes 12, tasks complete 53, tasks still open 24).

## Merge (real code, recent, tests/reviews done: the owning mastermind should merge, resolving conflicts, since `michael/dev` moved on)
- `worktree/session-twins-fix` (8 commits, 20 files, task `session-e00f55c9/session-twins-fix`): SessionFolders claim rule, twin check, one-folder doc. Conflicts in 2 files. Owner: that task's mastermind.
- `worktree/voice-bridge` (6, 7 files, `session-e00f55c9/voice-bridge`): remote.fallback turn counting, voice-agents doc. 1 conflict.
- `worktree/read-aloud-next` (6, 9 files, `dictation-v3/read-aloud-next`): Recite highlight-dropout fixes. 6 conflicts; the Recite owner (mastermind of dictation-v3) should rebase.
- `worktree/dictate-plugins` (3, 13 files, `session-e00f55c9/chat-settings-per-session`): VoiceChat plugin registry, Features panel, readme. 8 conflicts; finished and tested, 23 h old.
- `worktree/chatv3-title-dedupe` (2, 4 files, `session-00f6d159/mastermind-chatv3-title-dedupe`): small, task marked complete but never merged. Merge first.
- `worktree/dictation-perf` (10, 12 files, 7 d, task open): 5 of 12 files same; the dictation-v3 mastermind should check what is left and merge.
- `worktree/v1-switch-prep` (4, 8 files, task complete): 6 of 8 files same; two files left over, then supersede.

## Check (7-10 days, task still open; the owning mastermind says merge or abandon)
`dictation-docs`, `dictation-wake`, `chunk-ack`, `min-free-2560`, `chat-roles`, `prompt-per-smart` (no task found), `legacy-sweep`, `compact-nudge`.

## Superseded (already on `michael/dev`, or replaced)
- `drawer-close`, `layout-check`, `page-inbox`, `property-of-serve`, `part-link-run`, `cost-fix`, `pool-fix`: every patch is already on `michael/dev` under another commit (`git cherry`).
- `dictate-plugins-test`: its two commits are the first two of `dictate-plugins`.
- `dictation-bucket`, `ai-system-page`, `architecture-md-4`, `one-store`, `refine-build`, `refine-confidence`, `refine-mic`, `sessions-layout2`, `undone-to-tasks`: at least 80% of their files are identical on `michael/dev`.

## Abandoned: logs only (the only commit is "worktree closed: N leftover files saved", jsonl logs and shots, no code)
`prompts-live`, `refine-demo`, `relay-2`, `voice-asks-2`, `voice-verify`, `test-smoke`, `voice-sessions`, `roles-class`, `default-view`, `backbone`, `class-docs`, `v1-order`, `replay-bubbles`, `voice-session-mixup`, `playback-stutter` (its one code file is a stray test page). If the task logs matter, the leftovers are in each branch; otherwise nobody needs them.

## Older than 10 days: presumed abandoned, not verified one by one
- **Probes (12)**: `probe-p*`, throwaway test branches with no task.
- **Task complete (53)**, for example `nav-model`, `session-record`, `architecture-md`, `local-ai`, `page-extends-item`, `review-turns`, `quickfix-worktrees`, `chat-v2*`, `dictation-solid`. The task finished and `michael/dev` moved on for 10+ days, so the code was most likely rebuilt or landed differently. A mastermind who wants one back runs `git diff michael/dev...<branch> --stat`.
- **Task still open (24)**: `ai2-*`, `ui-system-land2/3`, `ui-system-clean-land`, `data-grid`, `framework-home`, `file-system`, `grip-everywhere`, `follow-tail`, `proposal-flow`, `waiting-on-you`, `check-consensus`, `layout-gate`, `fix-label`, `dictate-onewidget`, `onewidget-serve`, `dictate-marks`, `mentions`, `claude-md-consolidate`, `wl-proof`, `refine-audit`. Open tasks nobody has touched for a month: close the task as abandoned, or merge.

The earlier [salvage audit](../voice-20261016/salvage/audit.md) found the same shape (183 ahead, most noise); the difference now is that [In-flight](/framework/core/Session/doc/in-flight.md) shows a session its own unmerged branches.

## Outcome of the merge-backlog run (2026-11-03, [task](../merge-backlog/session.jsonl))
- `worktree/session-twins-fix`: **merged** as 342b6462d (via `worktree/mb-twins`, reviewed, 5 findings answered). Two merge-time fixes: dev already had `DatedFiles.folders()`, so the branch's finder accessor became `session_folders()`; the `TaskLoop-steps` fixture now marks the new daily twins check done so no child holds the temp dir.
- `worktree/voice-bridge`: **merged** as 3cee562ef (via `worktree/mb-voice`, review: pass). The one conflict, `Servex/ext/remote/readme.md`, kept both sides.
- `worktree/chatv3-title-dedupe`: **superseded**, already on `michael/dev` as 50b14ab9f; its one conflict resolved to dev's text and nothing was left to land.
- `worktree/v1-switch-prep`: **superseded**, the two leftover files (`core/Session/Chat/doc/pseudo-properties.md`, `core/Session/Chat/readme.md`) are older than dev's versions.
- Note for the next merger: `merge.mjs` finds a review in a session older than 4 days only with `--review-dir <task dir>`.
