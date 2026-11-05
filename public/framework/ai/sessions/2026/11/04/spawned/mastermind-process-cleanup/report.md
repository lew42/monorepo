# Why processes pile up, and how to close work out (read-only investigation, 2026-11-04)

Nothing was killed, stopped, deleted or changed. Every number below was read from the live machine tonight. The kill list needs the owner's yes.

## The short answer

- **The machine is not in trouble right now.** Windows commit is 42.7 GB of 61.2 GB (70%), down from the 94% snapshot in the brief. All processes together hold only 25.5 GB of private commit, so the other ~17 GB is the system itself (page cache, kernel, compressed memory). Cleanup will not change that part.
- **What we control is about 8–10 GB of commit**: 34 node.exe (3.4 GB), 12 claude.exe (2.6 GB), whisper-server (2.6 GB commit, 0 MB resident), python recite (2.1 GB commit, 30 MB resident).
- **Most node.exe are dev-server stacks of work that is finished.** Each stack is 2–3 node processes (a `server.js` wrapper, `Server/run.js`, sometimes a `health-supervisor.mjs`). They are started detached on purpose, so they outlive Servex and are adopted by the next one. The code that should close them is either exempted or not firing.

## 1. What each process is (deliverable 1)

| Group | Processes | What it belongs to | Verdict |
|---|---|---|---|
| Keeper + Servex | sustain 17936, Servex 33900, AIIndex 26660, gate 20544 | The always-on system | **Keep** |
| Main site | 52384 + 50436 | `monorepo.localhost` (this site) | **Keep** |
| Quick-fix slot qf-1 | server 43520, watcher 33200, port 55681 | The one slot in `.worktree-pool.json` (state `ready`) | **Keep**, idle-but-reusable |
| Orphan pool stacks qf-4 | 43972, 44944, 20888, 22820 | Slot not in the pool file; folder still on disk | **Zombie** |
| Orphan pool stacks qf-6 | 32604, 25488 | same | **Zombie** |
| Orphan pool stacks qf-7 | 38656, 38468 | same | **Zombie** |
| Orphan pool stacks qf-8 | 47596, 10916 | same | **Zombie** |
| `read-aloud-next` | wrapper 33232 (+ 46196, 19904), port 54439 | Worktree whose task has been silent 67 h | **Zombie** (reaper would close it) |
| `monorepo-wt-readme-roles` | 52852 + 35800, port 3119 | No owning task, running 53.6 h | **Zombie** (reaper would close it) |
| `s.mjs` | 29932, 26152 | Ad-hoc scripts started by hand on 10-22 | **Zombie** |
| Extra cloudflared stacks | 24012 / 27380 / 39768 and 50248 / 51292 / 12000 | Older tunnel launches, stale | **Zombie** |
| Live tunnel | 25772 / 42880 / 47812 / 3252 | The tunnel in use | **Keep** |
| claude.exe (12) | one per working or idle agent, plus the tabs | `list_agents` shows 1 working, 0 idle, 6 dormant | **Check**: 12 vs 1 working is more than expected. Dormant agents should hold none, so the extra ones are VS Code tabs plus leftovers. Needs one per-PID match (see §6). |
| python 33500 / 38972 | recite-server (text to speech) | Started at first use, never unloaded | **Idle-but-reusable** |
| whisper-server 42284 | transcription | Servex starts it, never unloads | **Idle-but-reusable** |

Kill list, if approved: the `qf-4/6/7/8` stacks, `read-aloud-next`, `monorepo-wt-readme-roles`, both `s.mjs`, the two stale cloudflared stacks, and the 3 orphaned Playwright chrome roots (7652, 34900, 48088) plus the 5 under qf-4 (they go with qf-4). That is about 24 node processes plus ~8 chrome. Estimated saving: 1.5–2 GB of commit.

## 2. Does the lifecycle close children? (deliverable 2)

- **Agents: yes.** A dormant or stopped agent holds no process, and the SDK `claude.exe` child dies with it. I found no per-agent MCP servers or shells left over.
- **Dev servers and worktree stacks: no, by design.** They are detached so a Servex restart does not take the site down (`Servex.js`, the comment above `reaper()`). Nothing ties them back to the agent that asked for them. The pieces that should clean up later:
  - `Servex/Lifecycle.js` `sweep()` (the reaper, every 5 min): closes a stack when its task landed, when the task has been silent 2 h, or when there is no owning task and it is older than 2 h.
  - `Servex/Worktrees.js` (every 10 min): stops the server of a FINISHED worktree, never a qf-* slot.
  - `Servex/Pool.js`: owns the `qf-N` slots, but only the ones in `.worktree-pool.json`.
  - `TaskLoop` calls `Server/worktree-down.mjs` for landed tasks.
- **Parent chain:** the process list shows no parent record; `lifecycle.jsonl` records `owner_task` and `owner_agent`, but for these stacks both are `null`. Whoever started them (`worktree-up.mjs` called by hand, or a tab) was not an agent Servex tracks, so nothing owns the close.

## 2b. Extra evidence from the VS Code mastermind (measured 22:20)

- **Chrome (17).** 9 are the owner's own Chrome in background mode (main 41268, `--no-startup-window`, started by the `GoogleChromeAutoLaunch` Run key). 8 are Playwright: 5 belong to `Server/health.mjs` of worktree qf-4 (main 16536, parent node 22820, since 11-03), so they go when the qf-4 stack goes; 3 are orphaned from dead parents (7652 since 10-20, 34900 since 10-24, 48088 since 11-02). Add the three orphans to the kill list. They sit under chrome.exe, so a node-tree kill (`taskkill /T`) never reaches them once the parent has died: the Playwright launcher has no child-reaping on a crash. Fix: the health script should launch the browser with a close-on-exit guard, and the reaper should list chrome.exe whose parent pid is gone.
- **The Claude desktop app counts as ours.** Servex labels it "Claude Code session (pid 43120)" (parent sihost.exe) and counts its 1.8 GB (10 processes) as ours: the `session 43120` group is the largest in procmon. Not a leak, but it hides what Servex really holds; procmon's `ours` number is about 1.8 GB too high.
- **The Code.exe "doubling" is real, not a monitor artifact.** `processes.jsonl` (one sample a minute) shows Code.exe jump at :57 on 17:57 (3.6 to 6.1 GB), 20:57 (1.5 to 4.1 GB) and a small one at 18:57; the process count stays 15, so nothing is counted twice. The machine's `used_mb` rises by the same ~2 GB for that one minute and falls back the next, and `free_mb` drops by the same amount. So a Code.exe process really touched ~2.5 GB of memory for about a minute, and then it was trimmed. It does not happen every hour (not at 19:57, 21:57, 22:57), so it is not a fixed timer. Separately, `used_mb` rises ~1 GB at :01 every hour with Code unchanged, a second hourly job that is not VS Code. Cause not named: the sampler reads working set (resident), and Windows trims and refaults it, so a one-minute scan (an extension or file indexer, or Defender) fits. A 3-line follow-up would name it: on the next spike, sample `Get-Process Code` by pid every 5 s and note which pid grows. This is a transient working-set spike, not commit, so it does not matter for the commit wall.

## 3. Root causes, found in the code

1. **`Lifecycle.kept()` exempts every path matching `worktrees/qf-<N>`** ("a pool slot, Pool.js looks after it"). Only qf-1 is in the pool. qf-4/6/7/8 were once slots, left the pool file, and now nobody looks after them. The exemption is too wide: it should check the pool file, not the path.
2. **The live sweep does not close what its own dry run says it would.** `node Servex/Lifecycle.js --dry` says it would close `read-aloud-next` and `monorepo-wt-readme-roles`. The last server/health reap in `lifecycle.jsonl` is 2026-11-02 16:41, and the last `lifecycle:` line in `servex.jsonl` is 2026-11-03 22:29. A sweep that closes nothing logs nothing, so I cannot tell from the logs whether it runs. The wrapper (`Servex.js` `reaper()`) hangs on `heartbeat.tick`, and the heartbeat is ticking now, so I expect the wiring is fine and `kept()` or the owner lookup differs inside Servex. **Open question, 10 minutes to settle:** run one live sweep with `SERVEX_REAPER_DRY=1` and read the message.
3. **A retry loop that never succeeds.** `merge-staged` (pid 51472) gets a `worktree-down` end event written every ~4–5 minutes (3,000 recent log lines contain hundreds). `Server/worktree-down.mjs` writes that line, kills the pid, and later refuses (a dirty or unreadable worktree), leaving the registry entry in `.worktrees.json`. The next sweep tries again. Nothing counts failures or backs off.
4. **No idle timeout for things that are fine to restart.** A `ready` pool slot, the recite python and whisper-server stay until Servex stops. They are "reusable", but unused for days they cost commit, not RAM.
5. **Hand-started jobs have no owner record.** `s.mjs`, tunnels and `worktree-up.mjs` runs from a terminal have `owner_task: null`, so the reaper can only judge them by age, and the qf-N path exemption hides some even from that.
6. **Nothing asks a job to say it is finished.** Agents land a task, but there is no step that stops what the task started (dev server, worktree, tunnel, background job) and reports it.
7. **Disk clutter, not memory:** about 80 folders in `C:\Code\lew42\worktrees\` are unregistered with git (13 are registered). Harmless to RAM, but the reaper cannot see them.

## 4. Closing a task by program (deliverable 3)

It exists and is enough: `close_task({dir, why})` (TaskLoop), `kill_task`, `snooze_task`, `reprioritise_task`; `Asks.js` wraps `close_task` so closing lands the asks the agent owned; `on-landing.mjs` calls `Lifecycle.reap`. What is missing is a **safe automatic trigger**. Proposal, and it must not fire early:

- Close automatically only when **all** hold: `landed_at` is set, the branch is merged (`git log compliance/dev..<branch>` empty), no `wait` line is open on the task, no child task is open, no agent of the task is `working`, and the last log line is older than 30 minutes. A review or follow-up always writes a log line or a child, so it resets the clock.
- Anything that fails one of these stays open; a task silent 24 h is flagged to its parent, never closed.
- Closing = `close_task` plus `Lifecycle.reap(dir)` (stack and worktree down), and one `closed` line in the task log naming what was stopped.

## 5. Close-out rule for the mastermind skill (deliverable 4)

Proposed text, for the "Each cycle" section of the mastermind role (not applied: the role is owner-owned config):

> **Every job ends with a close-out.** Before a task counts as done, its owner (1) stops what it started: dev servers, worktrees (`return_worktree`), tunnels, background jobs, minions (`stop_agent`); (2) writes one `closeout` log line: `{did, still_open, cleaned_up}`; (3) sends that line to its parent as its landed message. A mastermind reads its children's close-outs before it closes its own, and passes its own up. A job the owner started themselves comes back to the owner in the Inbox as one `decision`-kind note with the same three fields. A job with nothing started says so in one line.

Cheap mechanical support (computed, not recalled; law 7): `finish-task` should list what `lifecycle.jsonl` shows as started by this task and not ended, and refuse to land with an open entry unless the task says why.

## 6. RAM strategy (deliverable 5)

- **Gate on commit, not free RAM.** `system_health` flags only below 1.5 GB free; commit is the wall. Procmon already samples `commit_mb` and `commit_limit_mb`. Proposal for the spawn gate (`SERVEX_WORKING_CAP` is the other gate): below 80% hold nothing; 80–90% only spawn for high-priority tasks and start the idle-stop pass; above 90% no new spawns or servers, and the lowest-priority background session is wound down per the mastermind role. Today (70%) nothing would trip.
- **Idle timeouts**, all restartable on first use:
  - dormant agents: already hold no process, no change;
  - `ready` pool slot with no use for 2 h: stop its server and watcher, keep the worktree;
  - dev server of a landed or silent task: the existing 2 h rule, applied to qf-N slots that are not in the pool file;
  - whisper-server and recite python: stop after 30 min unused, start on the next request;
  - tunnels: only the newest per name.
- **Always log the sweep** (one `sweep` line with counts), so a stall is visible in the log.

## 7. Proposed changes, in priority order

1. **Settle the live sweep question** (§3.2), then narrow `kept()` to check `.worktree-pool.json`, so qf-4/6/7/8 stop being exempt. Small code change, biggest effect.
2. **Back off the `worktree-down` retry** (§3.3): after 3 failures, stop retrying and send one `risk` note.
3. **Add the sweep log line and the commit-based spawn gate** (§6).
4. **Idle timeout for ready slots, whisper and recite** (§6).
5. **Close-out rule in the mastermind role, and the `finish-task` check** (§5, §4).
6. **Owner record for hand-started servers**: have `worktree-up.mjs` and `start_server` always record `owner_agent` (or `owner`), so the reaper can judge them.

Nothing is applied. After approval I can do 1–3 in a worktree (a few dollars, one reviewer), then 4–6.
