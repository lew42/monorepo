# mastermind — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

- **PROPOSAL, owner's call to promote:** 2026-09-04 · the owner: the mastermind should not
  execute skills or hands-on edits itself, only relay to a minion — its own tool calls bury its
  answers in the sidebar chat. Proposed for Each-cycle: the mastermind's own calls are ledger,
  usage, dispatch, harvest; everything else is a minion.
- **PROPOSAL, needs settings.json (the owner's) — now FOUR incidents:** 2026-09-04 · a third
  minion ran `find /` despite the written rule (paging-scout; three orphans reaped by the
  mastermind). **2026-09-20: a FOURTH — the `ai-padding` minion launched `find / -maxdepth 6`
  while checking for a global Playwright install and it burned a full core for ~30 minutes**; it
  found and killed its own, and disclosed it unprompted. Four agents in seventeen days, each
  having read the rule. The rule alone does not hold; a PreToolUse hook refusing `find /` /
  `find C:/` would. The fix is written and costs the owner one settings entry.
- **PROPOSAL, adds a required step:** 2026-09-19 · the mastermind writes `note` and in-flight
  `agent` lines so the v2 board stays live with no reload (ai-v2 leaned on this). Proposed: keep
  doing both on every run the v2 board is meant to show.


- **Never delete anything in the main tree** (2026-10-01, 22:36): a task-mastermind ran `rm -rf` over every `git status` untracked path in C:/Code/lew42/monorepo to "clean up" before a merge — 601 paths, every October card, 15 live task folders and a skill folder, all other agents' uncommitted work. Untracked files in main are never yours. Cleanup happens only in your own worktree, only on files you made; `git clean`, `rm -rf` of a listed set, `checkout --` and `reset` in main are forbidden for every role.
- **Coordination between masterminds** (2026-10-17, checkup-servex): added the "propose, then agree, never edit in the other's directory" paragraph to SKILL.md, from the owner's 2026-10-16 voice dictation (handover 2026-10-17 00:30, item 5), where it was recorded only in the voice agent's memory. Also: an agent past about $100 is read (its files, its task.jsonl), not woken, unless you are handing it a decision it waits on (Servex/doc/dormant.md).

- 2026-10-17 (mastermind-repo-slim): three helpers in one morning ended with a `{"finish":{}}` line and a merged branch but no `assign.landed_at`; each chase to add the old landing line cost a turn. The harvest rule should accept `finish` (or `complete`) plus a merge as landed, since `Task.replay` already does; the Stop hook and `LandingCheck` should accept it too. Evidence: `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/{undone-asks,voice-assistant-plan/swallow,tasks-wide}/task.jsonl`.
- 2026-10-17 23:17 (mastermind 730e8a7b): a helper that ends with a `finish` line and no `assign.landed_at` is chased by the Servex heartbeat for ever (Agents.js landed() reads only landed_at/closed_by): six such helpers cost $270 in wake-ups today, one $194. Until Servex counts finish lines, `stop_agent` every helper the moment its work is merged and logged; "stopped chasing the landing line" (10-17 14:00) was the wrong half of the fix.
- 2026-10-18 10:31 (mastermind 730e8a7b): a Haiku scout asked to rank todo items returned counts (25 done / 23 valid / 25 unclear) but no per-line verdict list, so the done lines could not be struck. A scout brief should ask for the verdict list as a file (`verdicts.jsonl`, one line per item with line number and verdict), never only counts.
- 2026-10-19 13:12 (mastermind 730e8a7b): a change to the task rules (core/Session/Day.js, core/Task/Task.js, Server/State.mjs, Server/TaskState.mjs) is not live on the tasks dashboard until Servex restarts: its task-state watcher child keeps the old modules in memory and rewrites ai/state.json every tick, overwriting a fresh `node Server/State.mjs` within seconds (the Day.of fix read 8 of 10 landed for twenty minutes). After merging such a change, restart Servex before trusting the count.
- 2026-10-23 (mastermind-page): spawn_agent for a minion that already has its own worktree must pass `cwd` = that worktree. Otherwise Agents.js:166 moves it into a pool slot, and when the pool is full it waits ("waits for a pool worktree"). Fail-safe fix: in Spawning, say "a minion's cwd is its worktree; its task-dir paths are absolute to the main tree".
- 2026-10-24 (mastermind-page): read a folder's improvements list before adding to it (`item({path: "<folder url>/improvements.jsonl"})`). I filed two duplicates into `/framework/servex/` in one night (WorktreeWatch empty share; return_worktree on a removed worktree) and had to stop both. The role text says how to add an improvement and how to read the list back, but not to read it first. Fail-safe fix: in "Improvements, one list per folder", add "read the list first; a match gets your evidence, not a new item".
