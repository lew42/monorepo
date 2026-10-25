# Voice sessions: filed in the dated session store, indexed, costed; the smart agent upgraded to Opus

Sonnet, high effort. Work in a worktree and land ready to merge. **The owner approved the merge and a Servex restart for this:** merge through `Server/merge.mjs`, then restart Servex (`restart_servex`) once no agent is mid-write. Say when it's live.

## The owner (2026-10-25)

1. **Voice sessions from the dictate widget get filed properly.**
   - Today `Servex/agents/Sessions.js:705` makes a `v-…` id and writes its record at `Sessions.session_path(home, id)`, under the page it was opened on. That's outside the dated session store, so the sessions page never shows it.
   - Fix: a voice session gets its folder in `ai/sessions/YYYY/MM/DD/<folder>/` like every other session, with its `session.jsonl` line 1 (kind `voice`, id, the page it was opened on). It's added to the per-level index files, so it shows on the sessions list with its cost.
   - Its fast and smart agents are its child sessions, entered as tasks in its record (the same rule as session-is-a-task, items 24 and 31). Agree the shape with `task-mastermind-session-entries-2`; don't build a second linking system.
   - **Backfill:** move the existing `v-…` records into the store by a script with a manifest, so nothing is lost.
2. **The voice session's smart agent defaults to Opus 5.5, medium effort, with mastermind permissions,** so the owner can dictate to it directly and it can act: spawn, use the item tool, and so on. That's the `session-smart` row in `Servex/agents/roles.js`, plus its brief (`session-smart.md`). Check what "mastermind permissions" means there (allowed tools and the permission mode), and say it in one line.
3. **Proof:** open the dictate widget, say one sentence, and see the session on `/framework/ai/sessions/` (today's list) with its cost and its child agents. Shot at 1920.
