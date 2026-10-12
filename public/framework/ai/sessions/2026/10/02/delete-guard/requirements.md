Budget: $8

# Delete guard: a recursive delete in the main checkout is refused

**Why (the owner, 2026-10-02):** at 22:36 on 2026-10-01, `task-mastermind-ai2-inbox-read` ran `rm -rf` over every path `git status` listed as untracked in `C:/Code/lew42/monorepo` — 601 paths, 595 gone (`ai/2026-10-01/recover-main-untracked/requirements.md`, `deleted-paths.txt`). `.claude/hooks/git-guard.mjs` blocks `git clean/reset/stash/checkout` in main but **not** `rm -r`, `rm -rf`, `Remove-Item -Recurse`, or `del /s`. It can happen again today. Untracked files in main belong to other agents (CLAUDE.md "Traps"; rule 27eea46d).

Law 6: **extend `git-guard.mjs`**, don't write a second guard — it already knows MAIN, the worktree pattern, the quoted-text strip, the fail-open shape and the cwd rule. Keep its header comment current.

## What to add

1. **Recursive deletes aimed inside main are refused.** Patterns (on the quote-stripped command, same as today): `rm` with any flag group containing `r` or `R` (`-r`, `-rf`, `-fr`, `-Rf`, `--recursive`); `Remove-Item`/`rm`/`ri`/`del`/`erase`/`rmdir` with `-Recurse` or `/s` or `/q`; `rd /s`. Resolve each path argument against the hook's `cwd` (and honour a leading `cd <dir> &&` / `-C`/`Set-Location` the way the existing WORKTREE test does — read the real cwd first, then the command). **Refuse** when a target resolves to MAIN or under it. **Allow** when every target is in a worktree (`worktrees/`, `.claude/worktrees/`), the scratchpad (`%LOCALAPPDATA%/Temp/claude/`), `%TEMP%`/`%TMP%`, or `/tmp`. A bare recursive delete with no path argument in main cwd is refused too (its target is the cwd).
2. **Any delete fed by git's file listing is refused, anywhere in main:** a command that pipes or loops `git status`, `git ls-files --others`/`-o`, `git ls-files -i`, `git clean -n` output into `rm`/`Remove-Item`/`del`/`xargs rm` — `xargs`, `| ForEach-Object { Remove-Item … }`, `for f in $(git …)`, `while read`. Match on "git listing + delete verb in the same command", not on exact syntax.
3. **The message** names what was blocked and the way through: do it in your own worktree, or delete one file by its exact path (a non-recursive `rm <file>` stays allowed everywhere), or ask the pool owner. One sentence on why: untracked files in main are other agents' work.
4. **Tests** in `.claude/hooks/git-guard.test.mjs` (create it if there is none — mirror `jsonl-guard.test.mjs`'s shape, feeding stdin JSON and checking the exit code): the incident's exact command shape (find it in `ai/2026-10-01/ai2-inbox-read/task.jsonl` or the recovery brief; if the literal line is gone, use `git status --porcelain | grep '^??' | awk '{print $2}' | xargs rm -rf` and `Remove-Item -Recurse -Force (git ls-files --others --exclude-standard)`) → blocked; `rm -rf public/x` with cwd main → blocked; `rm -rf C:/Code/lew42/monorepo/public/x` from a worktree cwd → blocked (the target decides); `rm -rf .` with cwd `C:/Code/lew42/worktrees/qf-6` → allowed; `rm public/framework/ai/2026-10-02/x/tmp.json` in main → allowed; `rm -rf $TEMP/foo` and a scratchpad path → allowed; `git commit -m "removed rm -rf"` → allowed (quoted text); malformed hook input → allowed (fails open). Every existing git-guard behaviour still passes.
5. **Hook wiring stays as is** — it already runs on `Bash|PowerShell` in `.claude/settings.json`; nothing to add there.

## Fence

`.claude/hooks/git-guard.mjs`, `.claude/hooks/git-guard.test.mjs`, `.claude/hooks/readme.md` (one line naming the new block), this task dir. Nothing else.

## Land

Worktree; `node Server/merge.mjs` (no page touched — say so in the landing line). Report on the card in four plain lines: what is now refused, what stays allowed, the test count, and that the hook is live for every session's next command once merged (hooks are read per command; no restart).
