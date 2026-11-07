# Log commits to the committing session

Budget: $12

Read `../brief-common.md` first.

## The ask (deliverable 2 of the parent task)

A git post-commit hook writes `{"commit": "<hash>", "files": […], "branch": "…", "worktree": "…"}` to the committing session's record (its `session.jsonl`), and every commit carries a `Session: <uuid>` trailer (a prepare-commit-msg or commit-msg hook). Measured today: only 240 of 1,321 sessions record any commit; only 12 of 126 commits to `Servex/agents/page_tools.js` name a session.

Notes from mastermind-resources, who had this before:
- Find the session from `CLAUDE_CODE_SESSION_ID` (check it is really set in an agent's Bash and PowerShell env, for a Servex agent and for a VS Code tab), else the worktree path matched against `.worktrees.json`, then that worktree's task dir. A hook sees no other agent context.
- Reuse `Servex/SpawnLog.js` `file_of()` / `dir_for()` (on branch `worktree/resources-queue-pids`, merging tonight: merge it into your branch, or build against compliance/dev once it lands) and `Server/SessionRecord.mjs` `log_file(dir)`, so the commit line lands in the same file the pid lines do.
- No `core.hooksPath` is set today. Versioned hooks (a `.githooks/` folder plus repo-local `git config core.hooksPath`) work in every worktree; say which you chose. Repo-local git config is fine; never touch the owner's global git config. Setting it on the main checkout is the mastermind's step at merge time: say the exact command in your report.
- The hook must never block or fail a commit (exit 0 always, a time limit), and must not loop (writing session.jsonl dirties the tree; that is expected, the next commit carries it). Write through Servex / the item tool when it is up, so Servex stays the one writer; append directly only as a fallback, newline-safe.
- An unknown session writes one line to a failures log, never a guess.
- Test: commit in a scratch repo with the env var set, and one commit line lands in that session's record with the right hash and files, and the trailer is in the message; with no session, no line, one failure line, and the commit still succeeds.
