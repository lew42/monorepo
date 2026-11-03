verdict: fix
1. [fix] Ask 1 is only partly written: of the 102 verdicts in verdicts.json, 26 are "assign", and none of those 26 is on the record. 21 of them are still `waiting` (waiting on the owner) and 4 are still `idle` in ../../session.jsonl (folded by a script on 2026-10-24). That is the exact follow-up gap the brief was written to close. closeout.md:3 says these writes are "held until the fast-write fix lands", but the brief asks for them to be written now with the item tool. Start each one with `{"tasks":{"<id>":{"start":{},"path":…,"agent":…}}}`, or queue it.
2. [fix] Four open tasks have no verdict at all, so they are missing from closeout.md: session-is-a-task-tasks-as-buckets-child, ai-sessions-page-one-slim-sticky-toolbar, dictation-a-debug-tab-that-shows-each-la (all idle) and this-session-s-tasks-every-one-closed-wi (this task itself). The brief says every open task gets one line.
3. [fix] closeout.md has no closing `show:` line with the counts before and after (brief, Do 2). Compute the counts from the record with a script; don't type them by hand. Today the record holds 209 tasks: complete 101, stopped 78, waiting 21, idle 8, running 1.
4. [fix] `handled()` in Server/PromptRecords.mjs (diff line 33) checks the state on the task's `add` line only, not its current state. Now that every task starts `idle`, it will also complete a task a tab has already started (running), or one that is already complete, as "routed to …". That breaks the doc's own rule: "the ask is not complete until the work is" (prompt-tasks.md, One writer, step 2). The simpler fix is to reuse the new `tasks()` fold and complete only the tasks it reports as idle or waiting.
5. [note] `tasks()` (diff lines 43–52) folds only `tasks.{id}.{verb}` lines. It ignores `{"decide":…}` lines, so an older proposal that was approved or rejected keeps showing its stale `waiting` state.
6. [note] Ask 3, second bullet (check-in prompts are never split): the diff doesn't touch it. The existing `turnOrigin` filter already covers it (prompt-tasks.md step 2), but closeout.md doesn't name that as the evidence.
7. [note] Ask 3, third bullet (the tab attaches to the splitter's task) rests on a rule in Servex/agents/roles/vscode-mastermind.md:20. That change is uncommitted and not in this diff, and it doesn't point to the `PromptRecords --tasks` command. Commit it with this diff and link the command, or a tab will keep filing its own task for each ask.
8. [note] The splitter change needs a Servex restart before it does anything (prompt-tasks.md, Watch out). Until then, new asks are still filed waiting on the owner, so the task isn't done until the restart has happened and has been checked.

## Requirements
- 1 "Close out every open task" — no — 26 assign verdicts not written (21 waiting, 4 idle on the record), and 4 open tasks have no verdict
- 2 "closeout.md … one line per task … a show: line with counts before and after" — partly — 102 task lines are there, but there is no show: line
- 3a "an owner's ask is filed as open work, not waiting_on: owner" — yes — PromptRecords.mjs diff line 18, and the test change at prompt-tasks.test.mjs:80
- 3b "the tab's own check-in prompts are never split" — yes — already covered by the turnOrigin filter (prompt-tasks.md step 2); not changed here
- 3c "the tab attaches to the splitter's task instead of making a second one" — partly — a `--tasks` lookup plus a doc rule; the role-readme rule is uncommitted
- Class check — n/a (no class added)

## Words
- Plain, full sentences — yes — the One writer section in prompt-tasks.md reads clearly
- Evidence named per line — yes — most closeout.md lines cite a commit or a path
