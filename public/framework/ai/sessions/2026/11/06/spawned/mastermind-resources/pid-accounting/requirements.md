# pid-accounting: is every process we start logged, attributed and ended?

Budget: $3 (Sonnet, medium). Load the `minion` skill first. Parent: mastermind-resources. Asked by voice-app for the owner
(record: /framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/). The owner's words (2026-11-06): "Every time any process ID is
created, we need to log it." and "I don't want you to kill Chrome processes unless you're sure they're playwright instances."

**Read first:** `Servex/doc/processes.md`, sections "Who started this pid", "Sampled children", "Leaks: a start with no end".
The code: `Servex/SpawnLog.js` (Servex's own spawns, exact start + exit), `Servex/Lineage.js` (10 s sample of claude.exe's children,
`"seen":"sample"`), `Servex/leaks.mjs` (pairs starts with ends; `--json` gave starts 2850 / ends 2806 / gone 38 / working 6, all time).

## Deliverables (measure first; numbers from a script, never by hand)

1. **Coverage, last 24 h**, by process kind (claude.exe, node, git, powershell/bash, chrome from Playwright, other).
   Write `Servex/pid-coverage.mjs` (read-only; reuse `pair()` and the reader from `leaks.mjs`, do not copy them) that prints one row per
   kind: starts, with-end %, with agent+session %. Two numbers that must agree: the row totals equal the start-line count of the window.
2. **Short-lived misses.** A child under 10 s is never sampled. Estimate how many: count the agents' Bash/PowerShell tool calls in the
   last 24 h (from transcripts `~/.claude/projects/C--Code-lew42-monorepo/*.jsonl` or the session logs, whichever is cheaper, by script)
   against the sampled shell starts. Say the ratio and how you got it.
3. **The CLI-minion bypass.** On 2026-11-07 page-design launched "CLI minions" (`claude -p`, outside Servex) when the pool had no worktree:
   sessions 73e88e75, d2507b09, 00c47a44, maybe session-truth's 1acd3902. Find (git grep the session logs for the ids) whether their
   claude.exe pids have start and end lines and an agent/session. Are any still running? Find WHERE the launch happens (which skill or
   script told the agent to fall back to `claude -p`).
4. **Smallest fix**, only if small (under ~40 lines), in a worktree (`node Server/worktree-up.mjs pid-accounting`), with a test beside it:
   either log the launch (a start line from the launcher) or remove the fallback and queue instead. Pick one, say the alternative.
   Update `Servex/doc/processes.md` in the same commit. Commit by exact path in the worktree. Do NOT merge; the parent merges.
5. **Still running with no owner:** list them (pid, name, cmd, started). List only. **Never kill anything.**

Report: log lines in this folder's task (the parent filed it on its session as `pid-accounting`), then one screen in
`pid-accounting/report.md` here: the table (kind → starts · end % · attributed %), the miss estimate, the bypass answer, the fix's
commit, the unowned list. Commit the report and `pid-coverage.mjs` output file by exact path.

## Never

Never kill or restart any process, the dev server or Servex. Never drive the owner's tabs. Never `git stash`. Never push. Use `git grep`
(rg is not installed). No `find /`. Don't write the owner's name into anything.
