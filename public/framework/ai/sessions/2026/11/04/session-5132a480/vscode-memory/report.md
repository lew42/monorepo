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

409 paths on `compliance/dev`, none of them modified code. `main` itself was not inspected for dirt; it is not checked out here.

- **Modified (159):** 137 JSONL logs. `LogSweeper.ALLOW` had no rule for task records in module homes (`<module>/tasks/`, since 10-16). Added, along with module `ai/log.jsonl`, `improvements.jsonl` and `asks.jsonl`; live after a Servex restart, as is the stale guard inside Servex. A few logs outside `public/` stay dirty (`.claude/skills/clarity/flags.jsonl`, `Server/console-allow.jsonl`, `Servex/agents/inbox.jsonl`).
- **Untracked (234):** task folders' `page.js`, briefs, reviews and PNGs that no agent committed.
- **Deleted (16):** voice logs under `<module>/ai/`, left for a person by design.
- **Junk:** six `Temp_*.mjs` files in the repo root from 10-24.
- **Unpushed:** the sweeper commits but does not push, so sweeps wait for the next `merge.mjs` (52 waiting tonight).
