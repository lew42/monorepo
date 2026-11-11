# Runaway search: scope every search, end a search that burns CPU after its parent is gone

Budget: $6 (Sonnet, medium). Load the `minion` skill first.

## Why

A recursive search started by an agent kept running after the agent's shell was gone and spun the owner's fans (relayed by voice-app, 2026-11-09). Seen live at 18:42: an orphan `grep.exe -rln DayPromptsRefine .` with no parent. Root scans have burned a core for hours before (`Servex/agents/roles/minion.md:88`); a sentence in a role was not enough, so this becomes two checks.

## What exists (read these, nothing else first)

- `Servex/Processes.js:340-358` `reap()`: ends an orphan only if it is a waiter (`WAITERS`), its command line is ours (`ours_cmd`), and it has been **idle** 10 min. A **busy** orphan is never ended. The class header (lines 28-37) describes the groups.
- `Servex/processes.test.mjs`: its test.
- `.claude/hooks/server-guard.mjs` + `server-guard.test.mjs`: a wired PreToolUse hook on Bash and PowerShell that refuses commands which leak resources (hand-started servers). Wired hooks are listed in `.claude/settings.json`; do NOT edit settings.json (the owner's config); put the new check inside server-guard.mjs.

## Deliverables

1. **A burning orphan is ended and logged.** In `Processes.reap()`: an orphan whose parent is gone, whose command line is ours, of a search kind (grep, egrep, fgrep, find, rg, du, xargs, ls; git only when its command is `git grep`/`git log -S`-style read; never node, never an app), that has averaged at least 25% of one core over the last 2 minutes (use the 10-second samples the class already keeps), is killed. One `{type:"reaped", why:"burning", cpu_avg, ...}` line on the processes log, the same shape as today's entry plus `why`. The idle rule stays as it is (`why:"idle"`). Thresholds as env-overridable numbers next to `reap_after_ms`.
2. **An unscoped recursive search is refused before it starts.** In server-guard.mjs: refuse `grep -r/-R/--recursive`, `find`, and `rg` when the search root is `/`, a drive root (`C:\`, `/c`, `C:/`), `~`/`$HOME`, `..`, or the repo root (`.` or no path while the cwd is the main checkout or a worktree root, or the absolute repo/worktree root path). The message says what to do: `git grep -n <pattern> -- <folder>` or name the folder (`grep -rn X Servex/`). Allowed: a named subfolder, a single file, `git grep` anywhere, `grep` without -r. Fail open on any error, like the rest of the hook.
3. **Tests:** cases for both in `processes.test.mjs` and `server-guard.test.mjs` (a burning orphan is reaped with why burning; a busy orphan under 2 min is kept; a node orphan is never reaped; each refused and each allowed search form). Run both test files and `node --check` on both edited files.
4. **Docs in the same commit:** the `Servex/Processes.js` header, the reaping section of `Servex/doc/processes.md`, the server-guard header comment, and `.claude/hooks/readme.md` say what is now true.

## Where and how

- Worktree: `C:/Code/lew42/worktrees/runaway-search` (branch `worktree/runaway-search`). Edit only there. Commit by exact path after each working step.
- Task log: `public/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/runaway-search/session.jsonl` (append with `node .claude/hooks/append.mjs <file> <json-array-file>`; hand writes to .jsonl are blocked).
- Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, never push, never search outside the folder you are about (use `git grep`). Do not kill any real process while testing: tests use fake process tables.
- When done: reply to mastermind-resources with the commit sha, the two test results, and one line per deliverable. Then stop.
