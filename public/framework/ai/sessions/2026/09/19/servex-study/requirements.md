# servex-study — what the Servex repo is, whether it works, and whether to move it in beside `Server/` or rewrite it small

Load the `minion` skill first. Then this brief. Model: Sonnet. **READ-ONLY study. Time box 30 minutes. One decision card back.** You edit nothing but your own task dir in THIS repo; you change nothing in the Servex repo.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (the decision first; the inventory only as far as the decision needs it).

## The owner's words (2026-09-19, through the assistant)

> launch a minion to study the Servex repo, somewhere in C:\Code. It is a server manager. Find how the repo is structured (maybe a git submodule for the server itself, probably stale, since the server now lives in this monorepo), what it does, and whether it would work. Judge moving its code into the monorepo beside Server/. Open questions: the CLI / path / env-var shape; global install vs local vs npx (I do not want a sophisticated API: start it and it runs on its own); it used PM2, maybe overkill but with useful features. I lean toward rewriting it ourselves with our own UI and config. Report as a short decision card.

## Where it is

`C:\Code\servex` — top level seen by the mastermind: `CLAUDE.md`, `README.md`, `Server/`, `Servex/`, `ecosystem.config.cjs` (PM2), `file-system.md`, `index.js`, `server.js`, `servex.md`, `servex-mvp.md`, `servex.ports.json`, `package.json`, `public/`. Read its `CLAUDE.md`, `README.md`, `servex.md` and `servex-mvp.md` first — they say what it was meant to be.

## Answer, with evidence (file and line, not impressions)

1. **What it is and does, in five sentences.** What it manages (processes? ports? sites?), how it starts them, what `servex.ports.json` and `ecosystem.config.cjs` hold, what UI it has (`public/`?).
2. **Structure.** Is `Server/` a git submodule (`.gitmodules`, `git submodule status`) or a copy? Diff it against THIS repo's `Server/` in one line per file that differs (this repo's is far ahead as of today: a supervisor with boot-test in `server.js`, `Server/run.js`, `MtimeFilter`, `hold.mjs`, `health.mjs`, plugins `Whisper.js`, `Assistant.js`, `AILogs.js`). How stale is it (last commit dates, `git log -3`)?
3. **Would it work today?** Do not run anything that binds a port or starts PM2. Say from reading: dependencies installed? PM2 present globally (`pm2 -v`, read-only)? Node version needs? What would happen on `node index.js` — trace it.
4. **What it overlaps with here.** This repo now has, as of today: a self-restarting supervisor (`server.js`), a reload hold, a page-health watcher, a whisper autostart plugin, private servers per port by env var (`PORT=81xx node server.js`), and agents that need "a server per worktree". Which Servex ideas are already covered, and which are genuinely missing (a registry of running servers and their ports? start-at-login? a UI listing what runs where? logs per process?).
5. **The decision, as `decision` lines with alternatives**, judged against the owner's own constraints (no build step, no new npm dependency without asking, "start it and it runs on its own", no sophisticated API): (a) rewrite small inside this repo — say exactly what the small thing is (a `Server/manage.mjs`? a `servers.json` registry + a dev-bar panel listing servers, ports, PIDs, uptime, with start/stop?), its CLI shape and env vars, and whether it is `node Server/manage.mjs`, a global link, or `npx`; (b) move Servex's code in beside `Server/` as it is; (c) keep it separate and point it at this repo. And PM2: name the two or three PM2 features actually worth having (restart on crash, start at login, log files?) and whether today's supervisor already gives them or a dozen lines would.
6. One screen: a `page.js` in your task dir — the decision first, then the five answers as cards. And ONE short card to the owner's log at landing: `node .claude/skills/assistant/say.mjs say "<about five words: the decision>" "<two sentences>" --as servex-study --id servex --status done --icon dns`.

## Rules

- `new-task` first (your dir: `ai/2026-09-19/servex-study/`); `finish-task`.
- **Read-only outside your task dir.** No `npm install`, no `git` command that writes, in either repo. Never start Servex, PM2 or anything that binds a port. Never kill or restart the dev servers (ports 80 and 8123). Never `find /`; search inside `C:\Code\servex` and this repo only. Write files with the Write or Edit tool. Do not write the owner's name anywhere (the Servex repo's own files may contain it — do not copy it).
- Landing `outcome`: one screen.
