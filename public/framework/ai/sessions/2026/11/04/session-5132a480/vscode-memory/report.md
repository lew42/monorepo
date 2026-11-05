# VS Code memory, the usage reading and the dirty tree (2026-11-04)

Three things measured in one evening. Process cleanup has its own report: [report.md](../../spawned/mastermind-process-cleanup/report.md).

## VS Code does not grow; about 3 GB is its normal size in this repo

`processes.jsonl` (one sample a minute, Code.exe working set):

- 15 days without a restart (10-20 to 11-04): flat, median 3.0 to 3.6 GB a day.
- Just before the 11-04 restart: 2.5 GB. Ten minutes after it: 3.0 GB.
- The long sidebar session's `claude.exe` is a separate process under VS Code. The largest group that fits it (`session 42428`, 10-25 to 11-04) was 1.1 to 3.0 GB. The match is by lifetime and size, not proven by pid. The new tab's `claude.exe` started near 0.6 GB.

So the 4 GB seen was probably VS Code's normal 2.5 to 3.5 GB plus that session. Its transcript is 148 MB.

Fresh window, private MB: extension host 650, window 443, GPU 260, second renderer 231, built-in chat host 177 plus `copilot-runtime.exe` 92 (Copilot is switched off in settings, but this still runs), two TypeScript servers 226 (each allowed up to 3 GB). What fills the extension host was not measured.

## The usage guard reported a stale number for 12 hours

- **Last real reading before the reset:** 75% at 08:54 on 11-04. The window reset at 21:00 local. The real final figure is unknown.
- **Why:** from 09:09 the live fetch failed ("no access token found"), so `claude-usage.py` fell back to an 11-day-old cache: 27%. `usage-now.mjs` printed "OK to spawn", reporting the file's age and not the data's.
- **Fixed:** `Server/UsagePace.mjs` treats a cached reading over 60 minutes old, or one whose reset time has passed, as stale. The report says UNKNOWN and `usage-now.mjs` exits 2. `Usage.over_pace()` also reads true while stale, which moves the voice smart seat off its top model until a live reading returns.
- **Not fixed:** why the access token went missing. It came back when VS Code restarted at 22:10.

## The dirty tree: records, not code

409 paths on `compliance/dev`, none of them code (`main` was not inspected).

```
409 dirty paths
├── modified 159   137 JSONL logs: LogSweeper.ALLOW lacked <module>/tasks/ rules (now added; live after a Servex restart)
├── untracked 234  task page.js, briefs, reviews, PNGs no agent committed
├── deleted 16     voice logs, left for a person by design
└── junk 6         Temp_*.mjs in the repo root (10-24)
```

A few logs outside `public/` stay dirty (`.claude/skills/clarity/flags.jsonl`, `Server/console-allow.jsonl`, `Servex/agents/inbox.jsonl`). The sweeper commits but does not push, so 52 sweeps wait for the next `merge.mjs`. The usage-guard fix also needs a Servex restart.

## Page file: the limit is commit, not the file

Read 2026-11-04 with `Win32_PageFileUsage` and `Win32_OperatingSystem`. The page file is system-managed: 25.9 GB allocated, 3.8 GB in use, 9.1 GB peak since the 10-20 boot. Commit was 42.6 of 57.0 GB. The "64" is the commit limit (RAM plus page file), so the file itself was never close to full. No Resource-Exhaustion events were found in 30 days. Free RAM did fall to 209 MB (10-25) and 231 MB (11-02), which more page file does not help.

Recommendation: a custom size of 64 GB initial and 96 GB maximum on C: (732 GB free). It costs disk only and stops out-of-memory failures at the commit limit; it makes nothing faster.

## Main as staging: the order of steps

Measured 2026-11-04: the repo is public, and `lew42.com`, `monorepo.lew42.workers.dev` and `production-monorepo.lew42.workers.dev` all answer without a login and serve the same files, including `handover.md` and `asks.jsonl`. `main` and `production` are the same commit (b816f9f27), and the last tab's notes say `lew42.com` follows `main`. `Server/publish.json` keeps publishing off.

1. Give `lew42.com` its own Worker that follows `production`, and leave `monorepo` on `main`. On one Worker, setting the production branch to `production` moves the clean address to production and staging to `main-monorepo.lew42.workers.dev` ([doc/git.md](/framework/doc/git.md)).
2. On GitHub, remove "Require a pull request" from Rule 1 and keep the force-push and deletion blocks. A bypass entry would skip those blocks too.
3. Turn `main` on in `Server/publish.json`.
