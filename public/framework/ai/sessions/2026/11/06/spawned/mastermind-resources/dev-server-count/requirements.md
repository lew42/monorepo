# Dev servers: count only real servers, and check idle worktrees really stop theirs

Budget: $5 (Sonnet, medium). Load the `minion` skill first.

## Why

`system_health` says 67 "dev servers" (2.4 GB). Measured 2026-11-09 18:52 (`../session.jsonl`, the "dev servers measured" log line): only **10** are real servers (the main site's `Server/run.js`, 480 MB, and 9 worktree servers, about 1.4 GB together; each one is also a `cmd` plus a `server.js` gate). The other ~57 are shells, `conhost`, `Tunnel.mjs`/`cloudflared`, `whisper-server` and Playwright `chromium`, filed under "dev servers" only because their command line points at the repo and their parent is gone. voice-app asked (2026-11-10 00:40 UTC): "worktrees that aren't working shouldn't keep a server. Measure and propose, small fix if obvious."

## What exists (read these, nothing else first)

- `Servex/Processes.js:217-230` (`group()`, steps 4 and 5): step 4 claims the detached servers Servex started (`this.detached()`, from `procs/*.json`). Step 5 puts **every** other process of ours whose parent is gone into "dev servers" unless it is a waiter. That is the mislabel.
- `Servex/Worktrees.js:178-230` (`idle_enough`, `stop_idle`): this already stops a non-pool worktree's server when its task is paused, landed, or its agent has stopped, or after `quiet_hours` (2 h, `SERVEX_WORKTREE_QUIET_HOURS`) of no git use. It skips `qf-*` pool slots and LAN previews. Doc: `Servex/doc/processes.md`, "Stopping an idle worktree's SERVERS".
- `Servex/Pool.js:28, 535, 615-625`: a READY pool slot keeps its server warm on purpose (about 15 MB) and is removed after 6 h idle.
- `Servex/processes.test.mjs`: the fake-process-table test.

## Deliverables

1. **An honest count.** In `Processes.group()` step 5, a parent-gone process of ours that is not a waiter goes to "dev servers" only when it is a real server: a `node.exe` running `Server/run.js`, `server.js` or the gate (`gate.mjs`), and that node's own children. Everything else gets its own group, labelled by kind: "Tunnel" (`Tunnel.mjs`, `cloudflared`), "Whisper" (`whisper-server`), "Browsers (Playwright)" (a chromium/chrome whose command line has `ms-playwright` or a Playwright `--user-data-dir`), "Leftover shells" (`cmd`, `bash`, `powershell`, `conhost` that are not waiters), and "Other of ours" for the rest. Labels and kinds only: nothing new is killed. `system_health`'s dev-server line then reads the real number.
2. **Measure, with two numbers that must agree.** Write `dev-server-count/measure.json`: for each live dev server, its project name, port, MB, the worktree it serves, whether a live agent works there, and what `Worktrees.idle_enough()` returns for it right now (the reason, or null). Also the count of real servers from your new grouping and from `list_servers`/`procs/*.json` (these two must be equal; if they are not, say why). Use a node script that reads the real state (the `/api/processes` endpoint on `http://127.0.0.1:8090` and the files), never a count by hand.
3. **A small fix only if the measurement shows one.** If a worktree with a paused, landed or stopped task still has its server up after a worktree pass, find out why `stop_idle` skipped it and fix that cause, with a test. Do not lower `quiet_hours` and do not stop pool slots' servers. If nothing is wrong, write so in the log: that is a fine outcome.
4. **Tests and docs, in the same commit:** cases in `processes.test.mjs` (a parent-gone `cloudflared`, chromium, `whisper-server` and `cmd` each land in their own group, not "dev servers"; a `Server/run.js` node still does). Run `node Servex/processes.test.mjs` and `node --check` on each edited file. Update the `Processes.js` header (lines 28-45, the group list) and the groups section of `Servex/doc/processes.md`.

## Where and how

- Worktree: take one with `node Server/worktree-up.mjs dev-server-count` from the main tree (branch `worktree/dev-server-count`). Edit only there. Commit by exact path after each working step.
- Task log: `public/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/dev-server-count/session.jsonl` (append with `node .claude/hooks/append.mjs <file> <json-array-file>`; hand writes to .jsonl are blocked). Findings go there as `log` lines.
- Never kill or restart the dev server or Servex, never stop any server yourself (the measurement only reads), never drive the owner's tabs, never `git stash`, never push. Search with `git grep -n <pattern> -- <folder>`; an unscoped recursive grep or find is refused.
- When done, reply to mastermind-resources with: the commit sha, the test result, the two counts from deliverable 2, and one line per deliverable. Then stop.
