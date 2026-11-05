verdict: pass
1. [note] The folder can now be continued from: `session.jsonl` has a diagnosis line (00:00:04) with the cause, the fix, the rejected alternative, the test results, what is left and what is still unproven live. That was the open fix in all three earlier reviews. The landing line still has to be written after `merge.mjs`.
2. [note] All four asks are met. Ask 1: the owner's claude.ai "Servex" connector reaches Servex through the remote door, which labels every call `voice-app` (`Servex/agents/Agents.js:1444`). Ask 2: `door()` blocks `mcp__claude_ai_Servex`, and `Servex/agents/tools.js:397` lets a tab's `session_id` win over `voice-app`. `spawn-parent.test.mjs` checks five parent cases and pins `REMOTE_CALLER` to `RemoteMCP.CALLER`. Ask 4: the rule is in `Servex/agents/readme.md:42`, links to `doc/architecture.md:95`, and is also in `Servex/ext/remote/readme.md:3`.
3. [note] The follow-up "policy.spawn / fork_self / start_job / follow from a tab via the connector" appears only inside the log line. File it as a task on the session (or as a line in `Servex/agents/readme.md`) so it isn't forgotten.
4. [note] `tools.js:342` still `export`s `tab_parent`, and nothing imports it (review 3, note 5). Drop the `export`, or leave it in as harmless.
5. [note] The connector block is still unproven live. After the Servex restart, one spawned agent should not list any `mcp__claude_ai_Servex__*` tools. The worktree `C:/Code/lew42/worktrees/spawn-parent` still has no `Servex/node_modules`, so only reviewer 3's throwaway worktree ran the tests.
6. [note] `night-2026-11-01/requirements.md:69-70` still lists this bug under "Found overnight (not yet fixed)". Link it to this task when it lands.

## Requirements
- 1 "Find how spawn_agent decides the parent and the from" — yes — `tools.js:397` chain `args.parent ?? tab ?? ctx.caller`; cause is in the diagnosis log line and `Agents.js:1444`
- 1b "Reproduce it with a private Servex or a unit test" — yes — `Servex/agents/spawn-parent.test.mjs`, 5 cases (the `voice-app` + `session_id` case is the bug)
- 2 "the parent is always the calling agent's own id (or session_id from a tab)… Add a test" — yes — connector blocked for agents; a tab's `session_id` outranks `voice-app`; tests in `spawn-parent.test.mjs` and `item-local.test.mjs`
- 3 "Worktree, then review.mjs, then merge.mjs" — in progress — branch `worktree/spawn-parent` at `3c3d76e48`, not yet merged
- 4 "Document the rule in Servex's readme, where spawning is described" — yes — `Servex/agents/readme.md:42` → `doc/architecture.md:95`; `Servex/ext/remote/readme.md:3`
- Class with live instances — n/a
## Words
- Readme and doc lines are plain, full sentences, and each one says what it is for — yes — `Servex/agents/readme.md:42`, `ext/remote/readme.md:3`
