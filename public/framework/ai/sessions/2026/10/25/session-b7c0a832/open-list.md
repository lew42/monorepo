# ai-system-mastermind: open list (2026-10-25, before going dormant for dictation)

Done and merged this session: spawn-gate unblock (Pool: phantom slots dropped, moved-aside empty folders, salvage on stdin), compaction hang (10-minute timeout, auto-compact at 95%), `give_back` refuses a slot another live agent works in. All need one Servex restart to be live (`restart_servex`).

Answered: prompt-breakdown item 14, in [prompt-refinement-map.md](/framework/ai/doc/prompt-refinement-map.md) ("Can the hook's refiner and dictation's Refine become one system?"): the record file is already one; the two briefs differ; smallest step = one brief file plus a final dictation calling the `live` process.

Next, in order:
1. agent-base item 15 (legacy sweep: OpenRouter-only directive, fold task-mastermind into mastermind), asked by vscode-mastermind.
2. Three minions share worktree `qf-8` (`minion-context-alerts`, `minion-mastermind-path`, `minion-prompt-grouping`); branch `worktree/qf-8` mixes commits 56e6182ae (context-alerts) with 34efefc58, 6edea540d, 1e1df1970, 884207928 (prompt-grouping). Each must cherry-pick only its own commits onto a clean branch; prompt-grouping needs another `node Server/review.mjs`. Then I read each diff, `Server/merge.mjs`, restart Servex.
3. Restart Servex once so the Pool and Agents fixes are live (pending dictation's RAM need; not done now).
4. Outcome lines for inbox items on pool names and `i-mvnb0hn1cif`; items for others: `i-mvn5jp23ahw` (item tool page.jsonl/task.jsonl split), `i-mvndoowl03x` (session-identity), backup push (owner approves).
5. `node Server/usage-now.mjs` and `node Server/role-spend.mjs ai-system-mastermind` at the next wake; update the Now column of `ai/priority.md`.

**Update (01:40):** Servex restarted (Pool, compaction and give_back fixes live). The qf-8 branch (context alerts + prompt grouping) was reviewed, tested and merged. qf-8 slot still held by minion-prompt-grouping (give_back guard refused it, correctly). Still open: minion-mastermind-path (qf-3) merge; one more restart for context alerts; items 15, 4, 5 above.
