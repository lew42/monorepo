# server-spin — name the flood that pins the dev server at 130%, and fix the cause (Opus)

Three laws: less is more; clear beats brief; prioritize. Length budget: the report is 8 plain lines with the numbers; the doc is one screen.

Read first: `Server/doc/spin.md` (what is known: the two chokidar watchers are flooded by raw `fs.watch` events — main thread in `handleEvent`, threadpool in `readdir`; the flood's SOURCE is the open question; it returns every few days); `Server/server.js`, `server.js` at the root, and the plugins that watch (`Server/plugins/Directory.js`, `Server/plugins/DevSocket/`, `Server/plugins/AILogs.js`, anything else that calls `chokidar` or `fs.watch` — grep); `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `server`), `code`, `finish-task`.

## The fact, right now

Five private dev servers started by minions this morning each sit at 130–145% CPU from the moment they start (pids 17304 11132 9604 20492 16664, ports 8094–8099). **They belong to other minions — never touch them.** A fresh server of your own will show the same spin, which is what you want: the defect reproduces on demand today.

## The work

1. Start your own: `PORT=8092 node server.js` from the repo root; sample its CPU for 10 s (`Get-Process -Id <pid>` twice, or the sampler in `C:/Users/mike/.claude/skills/fans/SKILL.md` §1). Log the number.
2. Name the flood: `node C:/Users/mike/.claude/skills/fans/watchspy.mjs 10` from the repo root (events per second and the top paths), and `node C:/Users/mike/.claude/skills/fans/profile.mjs <your pid> 5` from the scratchpad (hottest frames; the `.cpuprofile` stays in the scratchpad). Paste both into your log. Say in one sentence what the paths have in common — a directory that is written constantly (`ai/*.jsonl`? the scratchpad? `node_modules`? screenshots landing in `public/`?), a watcher with no `ignored`, a watcher that re-reads a whole tree on every event, an `atime` read storm (the doc notes a stale-atime read fires two change events on this box).
3. Fix the cause in `Server/` — the smallest change that makes a fresh server idle at under 5% while still doing its job: live reload on a real edit under `public/`, `directory.json` regenerated when a dir appears, the AI log streams. Typical shapes: an `ignored` list on the watcher (the `ai/` jsonl streams and any screenshot dirs, if they are the flood), `awaitWriteFinish`, `usePolling: false`, one watcher instead of two, debouncing the handler. Not acceptable: turning the watcher off, or polling at a long interval that makes reload feel dead.
4. Prove it: the same 10 s CPU sample on a restarted server of yours (before / after, two numbers); then edit a file under `public/` and show the socket sent a reload within a second; create a dir and show `directory.json` updated; append a line to an `ai/…/task.jsonl` and show the stream delivered it. All four still work, in your log.
5. `Server/doc/spin.md`: replace the open question with the answer — one screen: the cause, the fix, the before/after numbers, the date.

## Rules

Never kill a node process you did not start; the five listed above and pid 24284 (`platform-browser.mjs`, the owner's browser bridge) are off limits. Never port 80 (it is free right now — leave it free; the owner starts that one in their own terminal). Never the owner's browser tabs. Never `find /`; never spawn agents; never `git stash`/commit. Write `Server/**` and this task dir only; the fix takes effect on the owner's server only when they restart it — say so in the report.

## Budget and report

~200k tokens. ≤ 8 plain lines: the cause in one sentence with its number (events/s, top path), the fix in one sentence, CPU before → after, the four things that still work, what the owner must do (restart).
