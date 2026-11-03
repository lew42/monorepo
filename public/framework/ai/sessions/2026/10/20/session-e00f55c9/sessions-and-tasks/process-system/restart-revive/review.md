verdict: fix
1. [fix] A never-started agent that has no task folder is restarted with no instructions. Servex/agents/Agents.js:437-445 reopens it fresh (`session_id: undefined`), but the registry keeps the spawn spec *minus the prompt* (Servex/agents/Registry.js:42). The only thing the agent then receives is "Start now, from the prompt you were given", and it never saw that prompt. Fix: store the first prompt on the row at spawn time and replay it here, or bury the agent with that reason when there is no task folder.
2. [note] Skipping the landing check at boot (Agents.js:431, `landed: false`) applies to every agent, not only long-lived masterminds. An idle minion whose task already landed (and that nobody stopped) is now resumed at each restart and told to "answer in one line", which costs one turn per minion. The brief asks only for working and queued agents, so a narrower rule, such as `row.state === "working"` or the mastermind roles, would match it more closely.
3. [note] Servex.js:1261 (`landed: !spec.resume`) widens the same exception to every held resume in the gate queue, not just the boot sweep. Neither the commit nor restart.md mentions this.
4. [note] The reason is written onto the row by a second read-modify-write after `reg.bury` (Agents.js:471-475). Passing a per-id reason into `bury()` would do it in one write and keep one place that sets `ended`.
5. [note] The requirements also ask why `item` went gone. The doc line (Servex/doc/restart.md:50) names only mastermind-figma-cards and mastermind-test. The diff never says which branch buried `item`, so the brief's "why each of the three" is only answered in chat, if at all.
6. [note] The test (Servex/agents/revive-sweep.test.mjs) replaces `reopen` with a stub, so it checks that both rows are reopened but not that the queued row is started fresh while the working row is resumed. It could assert `r.session_id === undefined` for `queued`. Run in the worktree: "revive-sweep: 2 checks passed"; revive-skip.test.mjs still passes (6 checks).

## Requirements
- 1 "Read the registry rows and the Servex log … see which branch put each in gone" — partly — the doc and comments name the `landed` refusal for figma-cards and test; `item` is not explained in any file.
- 2 "Fix the cause, not the symptom" — yes — the landing check is skipped at boot (Agents.js:431, :606) instead of special-casing ids.
- 3 "A queued agent (never started) should start again" — partly — it is restarted fresh (Agents.js:437), but without its original prompt unless it has a task folder (finding 1).
- 4 "A working one should resume" — yes — it now passes `blocked` and reaches `reopen(row)`.
- 5 "Keep refusing for real reasons … but log the reason on the row" — yes — a deleted cwd and `stopped_by` still refuse; `ended` carries "servex restarted; not revived: …" (Agents.js:473).
- 6 "Add a test … one working and one queued row … expects both revived" — yes — revive-sweep.test.mjs passes, and it also checks that a stopped row stays down.
- 7 "Write the rule in one line in the Servex agents doc that covers restarts" — yes — Servex/doc/restart.md, its new last section (one sentence, under a heading).
- 8 "Work in your worktree, commit, do not merge" — yes — ab48dc942 on task/restart-revive, not merged.
## Words
- The doc line is one long sentence that packs four clauses together. It is readable, but it would scan better as "Rule:" followed by two short sentences.
