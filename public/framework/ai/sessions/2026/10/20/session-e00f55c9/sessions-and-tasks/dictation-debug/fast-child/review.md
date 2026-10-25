verdict: fix
1. [fix] The live proof can't be seen outside the worktree: `shots/` is gitignored (`.gitignore:210`, `**/shots/`), so `shots/v2-400.png` and `shots/v2-1920.png`, which the closing log line in `session.jsonl` cites, never reach the repo. A fresh agent starting from this folder has no proof to open. Move the two pngs to a tracked name (for example `proof/`, as the voice-sessions task did) and point the log line at it.
2. [note] Deliverable 2 holds: `page_tools.js:772` `nest_agents` puts a `session-fast`/`voice-assistant` row under the `session-smart` row that has the same `parent_session`, and `parent: "sessions"` stays on all three seats (`Sessions.js:1209/1221/1229`). `seat-cost.test.mjs` passes ("4 passed", re-run here), and the log names `cost_parent` as the alternative.
3. [note] Few people will see this change. The voice session's total already summed both seats (log line 3: `AISession.js:609`), and `nest_agents` only runs for registry rows that have no Session entry (the `unlinked` list at `page_tools.js:820`). If both seats get Session entries, `entry_children` keeps them as siblings and the smart seat's own total still leaves out the fast seat. Worth checking on one live voice session after the Servex restart.
4. [note] The test calls `nest_agents` on hand-made rows. Nothing tests the real path where `agents_under` (`Agents.js:768`) now returns `parent_session`. One assertion on that row shape would protect the link the fix depends on.
5. [note] The live proof shows that at 1920 the desktop drawer has no v2 chip, so Chat v2 only appears on the sheet (log line 2). That is a real gap for the parent brief's Part 8 ("seen in Chat v2"). Record it as an open item on the parent task, not only here.
6. [note] Docs: the sentence went into `Servex/readme.md` (agents/ row) rather than `Servex/agents/session-fast.md`. Commit 5b76baa99 explains why: session-fast.md is the seat's prompt. The new test is indexed there too. Nothing else is stale.
7. [note] Sessions.test.mjs and session-entries did not run (no node_modules in the worktree, per the log). Only seat-cost (4) and session-state (13) have pass counts, so run the rest after the merge.

## Requirements
- 1 "Answer first, one log line: where cost rolls up" — yes — session.jsonl line 4, with file:line for each claim (it was logged after the change, not first)
- 2 "smallest change that makes the smart seat's cost include its fast sibling" — yes — page_tools.js:772–779, Agents.js:768; parent "sessions" kept
- 2 "a unit test" — yes — Servex/agents/seat-cost.test.mjs, 4 passed
- 2 "Doc: one sentence" — yes — Servex/readme.md agents/ row
- 3 "One live proof only if Servex restarted" — yes, done — v-uw6epgr, 2 Prompts at 400; but the shots are gitignored (finding 1)
- Done line: "commit hashes" — yes — 6e241de74 logged; 5b76baa99 is not in the log
- New class? — n/a
## Words
- Log lines are plain and name files — yes — session.jsonl
