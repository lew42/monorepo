# CommitLog — every commit is recorded in the session that made it

**What:** two versioned git hooks in `.githooks/` call `Server/CommitLog.mjs`.

- `commit-msg` adds a `Session: <uuid>` trailer to the message.
- `post-commit` appends `{"commit":"<full hash>","files":[…],"branch":"…","worktree":"…"}` to that session's record (`session.jsonl`, or `task.jsonl` in an old folder). Over 200 files, `files` is cut and `files_total` says how many.

**Which session:** `CLAUDE_CODE_SESSION_ID` (set in a Servex agent's and a VS Code tab's shell). Else a `session` field on the worktree's row in `.worktrees.json` (none writes it yet). Else nothing is guessed: one line goes to `public/framework/ai/sessions/failures.jsonl` (`{"failure":{at,module:"CommitLog",why,…}}`) and the commit goes on.

**Where it lands:** always the MAIN checkout's store, found from `git rev-parse --git-common-dir`, so a commit in a worktree writes the record Servex reads. The folder comes from `SessionFolders.record_of(id)` and the file from `SessionRecord.log_file(dir)` (the same file `SpawnLog.file_of` uses for pid lines). The write is `RecordWriter.write`: posted to Servex, the one writer, and appended once (newline-safe) only if Servex is down.

**Never blocks:** the hooks end `|| true; exit 0`, and the script exits 0 after 8 seconds at most. The line dirties the record file; the next commit carries it (no loop, the hook does not commit).

**Switch it on (once per clone, repo-local, shared by every worktree):** `git config core.hooksPath .githooks`. Relative, so each worktree runs its own checked-out hooks. A branch without `.githooks/` runs none. Never use `--global`.

**Test:** `node Server/CommitLog.test.mjs` (a scratch repo; `COMMITLOG_ROOT` points the store there, `RECORD_ENTRY` at a dead port forces the file append).
