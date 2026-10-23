# Review fixes for four branches

vscode-mastermind reviewed four branches. Fix or answer every finding, branch by branch, **in merge order**:

1. task-chase
2. test-temp-store
3. handover-test
4. cracks-inbox-wait

`P` below means `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system`, in the main checkout `C:/Code/lew42/monorepo`.

| Branch | Worktree | Review |
|---|---|---|
| task/task-chase | C:/Code/lew42/worktrees/task-chase | P/task-chase/review.md |
| task/test-temp-store | C:/Code/lew42/worktrees/test-temp-store | P/test-temp-store/review.md |
| task/handover-test | C:/Code/lew42/worktrees/handover-test | P/handover-test/review.md (verdict pass; answer its notes) |
| task/cracks-inbox-wait | C:/Code/lew42/worktrees/cracks-inbox-wait | P/cracks-inbox-wait/review.md |

## For each branch

1. Read its review.md.
2. Fix every `[fix]` finding in that worktree, with a test where one fits.
3. For each `[note]`, fix it if the fix is small and safe. Otherwise decline or note it, giving the reason in one sentence.
4. Commit in the worktree.
5. Answer every finding, numbered as in review.md. Each answer is one line in `P/<branch>/session.jsonl`, appended with `node .claude/hooks/append.mjs <file> <array.json>`; the file must hold a JSON array:
   `{"review":{"answer":{"n":N,"reply":"fixed: …"}}}`, or `"declined: …"`, or `"noted: …"`
6. Run `node Server/review.mjs --status P/<branch>` from the main checkout. It must say it passes.
   - If it does not pass, read `Server/review.mjs` around `status()` to see what it wants.
   - Do not hand-write a review verdict.
7. Commit the answer lines in the main checkout. Only commit files under P.

## Specifics

- **cracks-inbox-wait contains the task-chase and test-temp-store commits.** After fixing those two, merge both branches into task/cracks-inbox-wait, then fix its own findings.
- **cracks-inbox-wait finding 1:** `awaken-race.test.mjs` calls `escalate`, which no longer exists.
  - Fix it, then run that test in the worktree.
  - Run `npm ci` in `Servex/` first if `node_modules` is missing. Never junction it.
- **task-chase finding 1:** `log.heartbeat` lines reset the ask count. Add the check it asks for to `TaskLoop-chase.test.mjs`.
- **test-temp-store finding 1:** `clean()` must only delete a dir that `test-store.mjs` itself created.
- **TaskLoop-steps.test EPERM:** this crash also happens on michael/dev. Leave it.

## Rules

- Never `git stash`, `git checkout --` or `git reset` in the main tree. Never `rm -r`. Put temp files in `C:/tmp/rv`.
- Do not merge into michael/dev; vscode-mastermind does that.

## Done

Report one line per branch: the commit, what was fixed or declined, and the `--status` output.
