# Session map follow-ups 9–13 (2026-11-06, read-only)

Nothing was committed, discarded, deleted, pushed or killed. The one exception: my own test started WSL and I shut it down (see 13).

## 13. Git and memory (done first)

**Git**
- Branch `compliance/dev`, 23 commits ahead of `origin/compliance/dev`, 0 behind (21 log sweeps, 2 Figma doc commits). Last commit `b8e664939`, 2026-11-06 01:17.
- `compliance/dev` is 242 commits ahead of `main`; `main` equals `origin/main` (last 2026-11-03).
- Working tree: 12 modified, 1 untracked, 0 deleted. Every modified file is appended log lines (39 lines in total): 9 session `session.jsonl`/`page.jsonl` files, plus `public/files.jsonl`, `ai/usage.jsonl` and `public/page.jsonl`. Untracked: `public/live2/` (a readme and a `page.jsonl`, made 01:38, empty skeleton; its readme has the owner's name in it).
- No junk to gitignore right now (`.worktree-logs/` is already ignored).
- 55 stashes, almost all worktree dev-server noise (`files.jsonl`).
- 795 local branches, 399 not merged into `compliance/dev`. `.git` is 1.2 GB.
- Worktrees: `qf-2` (139 uncommitted files, 0 unmerged commits) and `qf-6` (38 uncommitted, 0 unmerged commits). `worktrees/qf-1` is a folder git no longer tracks. The uncommitted files in qf-2 and qf-6 need one look before those worktrees are removed.

**Why Servex `shell` fails on `git status`:** `Servex/files.js:52` spawns plain `"bash"`. On this PC the first `bash` on the PATH is `C:\Users\mike\AppData\Local\Microsoft\WindowsApps\bash.exe`, the WSL launcher, not Git Bash. So the tool starts the Ubuntu VM and hangs until the timeout, and you get a generic error. Proof: running the same `spawn("bash")` from node hung for 120 s and started `vmmemWSL` (1.5 GB). I then ran `wsl --shutdown`, since WSL wasn't running before my test. Fix: spawn `C:\Program Files\Git\bin\bash.exe` explicitly. That's one line, and it matches what the tool's own description already promises ("Git Bash, default").

**Memory:** the commit charge is 46–48 of 57 GB (81–84%). RAM: 31.7 GB, 8.5 GB free. Biggest: whisper-server 2.6 GB, recite python 2.2 GB (since 11-01), Figma app ~2.9 GB, Adobe Creative Cloud ~3 GB, VS Code 2.9 GB, user Chrome 1.5 GB.

**Zombies (not killed):**

| What | pids | Memory | Since | Why it is a zombie |
|---|---|---|---|---|
| grep over transcripts | 32532 | 1.2 GB | 11-06 01:38 | Its parent is dead: my own search agent, lost when I was restarted |
| qf-6 health checker stack | 45148 supervisor, 39536 health.mjs, 35940 Playwright Chrome | ~0.25 GB | 11-04 22:43 | Its parent is dead; it watches a finished worktree |
| qf-6 dev server | 41860, 52852 | ~0.35 GB | 11-04 22:43 | The worktree is finished |
| qf-2 dev server | 7768, 13016 | ~0.17 GB | 11-05 16:48 | The worktree has nothing unmerged |
| orphan bash shells | 30924, 34200, 2412/23424/38440, 56156 | ~35 MB | 10-25 to 11-02 | Their parents are dead (56156 is the parent of the live tunnel, so keep it) |

Live and fine: Servex 17192 (with sustain 17936 and gate 20544), main dev server 15424, AIIndex 34332, the cloudflared tunnel (25772 chain), 3 claude.exe agents (this one, the VS Code tab, and one more SDK agent), 13 Playwright Chrome processes (0.8 GB) under Servex's browser.

**Cleanup plan.** It works in the main tree, on `compliance/dev`, the branch the site runs from. If "main" literally means the `main` branch, that's a bigger move (242 commits) and gets its own step. Each item below waits for your go:
1. Kill grep 32532 and the qf-6 stacks (45148, 39536, 35940, 41860, 52852) and the qf-2 server (7768, 13016). Frees about 2 GB of commit charge.
2. Look at the uncommitted files in qf-2 and qf-6, then remove both worktrees through `Server/worktree-prune.mjs` (or `return_worktree`), and the stray `worktrees/qf-1` folder.
3. Commit 1, "Servex shell: spawn Git Bash, not the WSL launcher" (`Servex/files.js`). Then `sustain.mjs --restart`.
4. Commit 2, "log sweep": the 12 log files.
5. Commit 3: `public/live2/`, either remove it, or keep it with the owner's name taken out of the readme.
6. Push `compliance/dev` (23 or more commits).
7. Later, with a dry-run list first: drop the stashes that are only `files.jsonl` noise, and delete branches already merged.

## 9. Past-work search at spawn: real, but weak on common words

- **Real.** `Servex/agents/Agents.js:325` calls `PastWork.task` (`Server/PastWork.mjs`) at every spawn that has a titled brief, and writes `past-work.md` beside the brief. The prompt says "read it first" (`Agents.js:257`). There are 12 such files from Nov 4–6. A brief without a title gets none: it logs `past-work-skipped` instead.
- **How it searches:** word match (stop words, crude stemming) over task logs, the asks ledger, readmes and docs, the session digest tags, and `git log --grep`. It doesn't match by meaning.
- **Test "reduce Servex tool count":** weak. It took 26 s, and the top hits were unrelated tasks, because "tool" and "count" appear everywhere. Only the docs section found `ai/doc/tool-collapse.md`. It missed the actual asks of 10-15 and 10-16 and the item-tool work.
- **Test "ai2 cleanup":** good. It found the Nov 4 findings, the 10-09 merge, the cleanup doc, the retirement asks of 10-03 and 10-18, and two commits. It missed the final removal commit `5b40700a4`.
- **Also:** `ai/past-work-index.md` was last built 2026-10-14, so it's stale.

## 10. Tool cut-down asks: never done, so nothing was lost

The ask, in order:
- 09-19: 90 tools and a 41k-token prefix measured (model-latency).
- 10-01: the Tools-section ask.
- 10-15 (voice): the tool-collapse plan, [`ai/doc/tool-collapse.md`](/framework/ai/doc/tool-collapse.md) (81 tools, ~18k tokens a turn, 16 never called).
- 10-16 (voice): "pages are the unit, a four-tool surface" (accounting requirement 8). The owner said it repeated the ask of the day before. The direction: Servex as an Item, `Item.set` the one call.
- 10-19: `ai/doc/readme-system.md:61`, "fewer tools, one item tool".
- 10-27: the design decisions, "fold the ~60 tools into item".
- `system-map.md:249`, "too many tools".

What was built:
- The `item` tool (10-28 onward, generic over every class).
- The generic `call` door, on the remote voice route only (`Servex/ext/remote/RemoteMCP.js:41`).

What never happened:
- No tool was removed, hidden or scoped by role. Stage 2 of the plan, the role lists, was never done: `server()` in `Servex/agents/tools.js:597` still gets the full list.
- `page_add`, `page_call` and `page_log` were kept as aliases.

**Was anything lost?** Only one thing went backwards, and on purpose. On 10-15 the voice tunnel had a small tool set. The same day, owner decision 89b525b6 switched it to the full registry plus `ask_mastermind` (commit `d3ddfbf906`). Nothing was reverted by accident. The count only grew: 68, then 73, 81, 90, now 97 Servex tools.

**Why it stalled:** every tool-list change needs a Servex restart, which never happens during a voice call. Nobody tested whether agents can pick hidden tools from skill text. And the item tool was built next to the old tools, never in their place.

## 11. Cut list sketch: about 103 tools down to about 29

Today: 97 Servex tools, plus 6 local ones (`item`, `page_set`, `page_read`, `page_add`, `page_call`, `page_log`). The 12 `site` tools are separate.

**Keep, non-item (27):**
- files and shell: `read_file`, `write_file`, `edit_file`, `list_dir`, `glob`, `shell`
- agents: `spawn_agent`, `send_to_agent`, `stop_agent`, `interrupt_agent`, `list_agents`, `wait_for_agent`
- servers: `start_server`, `stop_server`, `restart_server`, `server_logs`, `list_servers`
- worktrees: `take_worktree`, `return_worktree`
- checks: `check_page`, `system_health`, `check_usage`
- owner and plumbing: `owner_note`, `updates`, `skill`, `register_session`, `restart_servex` (owner only)

**Keep, item (2):** `item` and `page_read` (a cheap read; it could fold into `item` later).

**Fold into `item` as class methods (51):**
- Card: `create_card`, `card_set`, `card_reply`, `card_ask`, `card_summary`, `read_card`, `list_cards`, `attach_card`
- Page: `page_set`, `page_add`, `page_call`, `page_log`, `page_note`, `page_reply`, `create_page`, `read_page`, `list_pages`
- Task: `add_item`, `close_task`, `reprioritise_task`, `snooze_task`, `kill_task`, `list_waiting`, `file_to_group`, `move_project`, `dated_create`, `dated_query`
- Session: `log_session`, `session_line`, `rename_session`, `session_summary`, `audit_session`, `inbox`
- Log: `log`, `append_log`, `dir_log`, `append_prompt_event`
- Chat: `say`, `retract_say`, `amend_bubble`, `refine_step`
- Follows and wakes: `follow`, `unfollow`, `list_follows`, `wake_me`, `cancel_wake`, `list_wakes`
- Claims: `claim_topic`, `release_topic`, `list_claims`
- `module_inbox`

**Unlist (23):** they still answer through `call`, so nothing old breaks.
- `nothing`, `clear`, `drop`, `place`, `set_focus`, `set_layout`
- `ask_directory`, `ask_manager`, `ask_module`, `load_module`, `readme_modules`, `ask_expert`, `list_experts`
- `quick_fix`, `quick_fix_landed`, `pause_dispatch`, `resume_dispatch`, `heartbeat_status`, `task_loop_status`
- `start_job`, `job_result`, `fork_self`, `compact_self`

**Order:**
1. Rerun `ToolCollapse.mjs` for fresh call counts, so nothing used daily gets unlisted.
2. Add `call` to the local door too.
3. Unlist the 23.
4. Fold group by group, each fold a class method plus an alias for a week.

There's one restart per step.

## 12. Search: exact grep plus a daily digest; half of it exists

- **Exists:** exact-word search, `Server/PastWork.mjs`, plus `session-query.mjs` and `session-summary.mjs` for cost and lookup.
- **Exists, but stopped:** `public/framework/ai/AISession/AISessionDigest.mjs` writes `digest.json` beside a session: its prompts and final result, tool calls stripped, plus procedural tags (`kind/`, `model/`, `task/`, `mod/`). It ran once, over Oct 12–16 (about 585 files). Nothing has been written since, because nothing calls it when a session closes. Only `PastWork.mjs` reads it.
- **Missing:**
  - a one-paragraph summary and meaning tags written by a cheap model;
  - a daily digest file that a Haiku worker can scan;
  - the hook at session close.

  The plan for the Haiku worker exists, unbuilt: [`ai/doc/past-work-haiku.md`](/framework/ai/doc/past-work-haiku.md).
- **Smallest next step:** run `AISessionDigest` from `Servex/LogSweeper.js` (which already commits `digest.json`) when a session goes idle. Add a Haiku summary of 2–3 sentences and 5 tags. Append one line per session to a day file. `PastWork` then reads that day file when the word match comes back weak.

## Improvements to file when allowed
- The Servex `shell` bash path (13).
- The leaked qf-6 health checker, and why closing a worktree doesn't stop it.
- Empty tab sessions.
- Child cost doesn't roll up to the tab parent by uuid.
- Two sessions share one record folder.
- A session with 0 tasks scores 100%.
- Voice and tab children land flat in `spawned/`.
- Past-work is weak on common words, and its index is stale.
- The digest isn't wired to session close.
