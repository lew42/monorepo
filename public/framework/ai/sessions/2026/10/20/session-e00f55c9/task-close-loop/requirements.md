# Tasks: an agent that finishes its work also closes its task

*Run as a mastermind, on Sonnet, high effort.*

**Why:** [the task audit](../task-system-audit/findings.md) measured it.
- **Only 39% of 2,114 tasks ever landed.**
- **Minions do the work but never mark their task complete.** 255 of their tasks were closed as "abandoned" by `StaleClose`, and 224 of those had real work in them.
- **This is the main reason sessions sit at about 30–35% instead of 100%.**

The owner's primary objective (2026-11-02, [agent-rules.md](/framework/ai/doc/agent-rules.md)): create the proper tasks, complete them properly, and bring every session to 100%.

## Do (worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Close the loop where the agent stops (audit fix 1).** When a Servex agent's turn ends, or the agent is stopped, and its task is still open:
   - **If the work is clearly finished,** the harness completes the task with the agent's final message as the outcome. "Clearly finished" means the agent ended cleanly and its log has an outcome, a landing line or a commit.
   - **Otherwise,** it wakes the agent once: "your task is still open: complete it with an outcome, or say why it stays open."
   - **`StaleClose` never marks real work "abandoned".** Work with log lines that was never completed reads `unclosed`, a state that shows up in a sweep, so it can be finished.

   Find where turns end and agents stop (`Servex/agents/Agents.js` and its `landing_nagged` path), and where `StaleClose` lives. The minion skill's last step says "complete your own task" in one line.
2. **Fix `Server/PromptAudit.mjs` (audit fix 3).** It crashes on a transcript over 512 MB (`readFileSync`, line 93). Stream it line by line. Run `--days 7` and save the output to this folder.
3. **Re-close history, by script, non-destructively.** A dry-run script lists the 224 "abandoned" tasks that did real work. With `--apply`, it appends one line to each that turns it into `unclosed`. It never rewrites a line, and it writes a manifest of what it touched. Then rerun `../task-system-audit/census.mjs` and put the before and after numbers in the outcome.
4. **Tests:**
   - an agent ends cleanly with an open task, and the task is completed;
   - an agent ends without an outcome, and it is woken once, never in a loop;
   - `StaleClose` on worked tasks gives `unclosed`.

   Use the TestRunner Servex fence; never touch the live Servex.
5. **Document it** in `core/Task/readme.md` (task states) and `Servex/agents/readme.md` (what happens when an agent stops).

**Fences:**
- Commit by path; no `python -`.
- Don't restart the live Servex: vscode-mastermind does that when no voice call is live. Say in the report that a restart is needed.
- The other audit fixes (2, 4–7) are already child tasks of the audit; don't do them here.

**Budget:** about $10. Report to vscode-mastermind in 3 lines.
