# whisper-autostart — the dev server starts whisper-server by itself, so dictation just works

Load the `minion` skill first. Then this brief. Model: Sonnet. Small: one plugin, one line, one doc paragraph.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (it starts, it stops, it never takes the dev server down).

## Why

`ai/2026-09-19/whisper-local/` landed today: whisper.cpp (CUDA build) and `ggml-large-v3-turbo.bin` live at `%LOCALAPPDATA%\lew42\whisper\`, and `ux/Dictate` talks to `http://127.0.0.1:8178` directly (10 s of speech in under 100 ms). Today someone has to start `whisper-server` by hand (the command is in `public/framework/ux/Dictate/readme.md`; a copy is running now as Windows PID 35172 — **leave that one alone**). Its `doc/decisions.md` lists three ways to start it; the mastermind chose (a): the dev server starts it. `Server/**` is free now (`ai/2026-09-19/server-self/` landed: `node server.js` is a supervisor over `Server/run.js`, and restarts its child when `Server/` really changes — read `Server/doc/watch.md` first).

## Build

- `Server/plugins/Whisper.js`, registered in `Server/run.js` like its siblings. On boot: if the install is not there (`%LOCALAPPDATA%\lew42\whisper\bin\…\whisper-server.exe` and the model — find the real paths in the whisper-local task log), log ONE plain line and do nothing. If `127.0.0.1:8178` already answers, log one line ("already running") and adopt nothing. Otherwise spawn it (`--host 127.0.0.1 --port 8178 -m <model>`, the same flags the readme uses), `windowsHide: true`, its output prefixed `[whisper]` and kept to the first lines plus errors (it is chatty).
- **Lifecycle, the part that matters:** the child dies with the dev server's child process (on exit, SIGINT, SIGTERM — and on the supervisor's restart, where the old `run.js` is killed and a new one boots: the new one must find the port either free or answering, never crash on it). A `whisper-server` that dies is restarted at most three times, then one plain line and silence. **No failure here may ever take the dev server down** — everything in a try, every spawn error handled.
- Opt out with `NO_WHISPER=1`. Only the supervised owner-facing server should start it: a private server on another port (`PORT` set and not 80) does **not** start whisper (it would fight over 8178) — it logs nothing about it.
- Update `public/framework/ux/Dictate/readme.md` (the start-by-hand lines become the fallback) and its `doc/decisions.md` (the decision is made; (b) and (c) stay as the alternatives), and one line in `Server/README.md`.

## Prove

On a private server you start as `PORT=8138 WHISPER_TEST=1 node server.js` (add that env var as the test-only override of the "port 80 only" rule, pointing the plugin at port **8179** so it never touches the running 8178): it spawns, `curl http://127.0.0.1:8179/` answers, killing the private server's child (by its real Windows PID) takes whisper on 8179 down with it, touching a `Server/` file restarts both cleanly (one whisper, not two — count processes), and with the install path renamed in the env (a fake path) the server boots with one plain line. Kill everything you started by real PID at landing; confirm 8178 (PID 35172) is still up.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/whisper-autostart/`); `code`, `documentation`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `Server/plugins/Whisper.js` (new), `Server/run.js` (the one registration line), `Server/README.md` (one line), `public/framework/ux/Dictate/readme.md` and `doc/decisions.md`, your task dir.
- A hook checks every `.js` write parses and stops you if it does not — fix at once. ⚠ The owner's live server on port 80 is still the OLD unsupervised code until they restart it, so your `Server/` edits cannot reach it; the mastermind's server on 8123 IS supervised and WILL restart when you save a `Server/` file — that is expected; make every save a parseable, bootable file.
- **Never kill or restart the owner's dev server (port 80, PID 31028) or the mastermind's (8123), never stop the running whisper-server (PID 35172), never drive the owner's tabs.** Never `git stash`, never `find /`. Write files with the Write or Edit tool, never a bash heredoc. Do not write the owner's name anywhere.
- Landing `outcome`: one screen — what happens on boot in each of the four cases, the proofs as numbers, what was left and why.
