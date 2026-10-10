# mastermind-servex-3: checkpoint, 2026-09-28 evening

Start fresh as **mastermind-servex-4**: load the `servex-mastermind` skill, read this, then the last 20 lines of `task.jsonl` here. Launch lines live in `ai/2026-09-25/servex-mastermind/dispatch.md` (rows 3 to 13).

## First: the Servex restart (queued, proved, not yet run)

Uncommitted in `Servex/agents/`. **policy.js:** `mastermind-servex-N` counts as the Servex mastermind. **Agents.js:** `holder()` sends messages for "mastermind-servex" to the newest live holder, and `self_restarted()` skips holders. **Global.js:** `holder()` and `mastermind()` resume the highest N, never the retired 1c09793f session. The reaper's `is_worker()` stops every agent that isn't assistant, manager, master-assistant, mastermind, task-mastermind or dispatcher, 3 minutes after its last turn, and task masterminds after 15. Proved with the policy tests (35), stub runs and a private boot. **Held because 21 agents were working.** Run `node Servex/sustain.mjs --restart` when few are working, then check that list_agents shows -N working and mastermind-servex stopped. Until then, every relay and memory flag wakes the 560k session ($10+ per stretch). recursive-pairs (running) was told to merge with these edits.

## Dispatched or running (status on each card)

| Task | Card | Note |
|---|---|---|
| waiting-on-you, shared-browser, commit-live-system | their own 09-28 cards | #4 to #6 |
| every-page design: page-drawer #7, recursive-pairs #8 (+ lifecycle, any-page pair), check-consensus #9 | agent-work-on-every-page-sanity-checks-c | design.md there |
| collab-rounds #10, source-library #11 | same card | Vote {member, pick, caveat}; scoreboard.jsonl |
| task-loop #12 (owns the heartbeat and the step loop) | skills-as-a-workflow-tasks-chased-by-nod | running |
| review-turns #13, after collab-rounds lands | fresh-eyes-review-built-into-every-task | running per list_agents |

## Waiting on you (mastermind-servex-4)

- **collab-rounds is NOT landed despite its landed_at (branch unmerged, minion still fixing collab.mjs); review-turns merged that branch and may carry it. Its server was stopped by mistake and restarted by collab-rounds. It had an untracked `ext/Doc/decisions.js`** in its worktree (kept on disk): check whether the ⋯ button reached michael/dev, and merge it if not. ai2-static has an untracked cards.jsonl and ai/2026/09/25/ too.

- **minion-content-cards-audit** will send a skill-shape proposal (the page skill, plus an on-demand content-catalog skill). You own the change.
- **minion-structured-content-design:** review its screen of pictures.
- **Harness:** `harness-research/architect-review.md` items 1 to 12 are the must-haves. There's no harness build mastermind yet; when one is dispatched, its brief includes them. When the proxy spike lands, write what works in `Servex/doc/`, linked from /framework/servex/.
- **todo.md:** a Bash guard against `git stash`/`reset` in the main tree (the owner's call on settings.json).

## Lessons from today

- A `node -e '…'` inside a bash single-quoted string ate the backslash in `\d` twice. Use the Edit tool for any regex.
- Never stash in the main tree, not even for a test. Read old code with `git show HEAD:<path>`.

## Open for you: the task-placement rule (you own it)

The owner leans toward tasks living in the folder of the thing they're about, with the AI 2 rail showing the real page by events (card `2026/09/28/inbox-rows-are-the-real-pages-page-class`, "Continued (about 3:10 PM)"). ai2-lead-2 will propose the rail side and tag you. The owner also wants the framework folders kept clean. My starting position, not yet decided:
- A task lives at `<module>/ai/<slug>/`. That is already the dev bar Ask's convention and the drawer's Sessions store, so it is one rule for sessions and tasks.
- The one `ai/` folder per module is hidden from the Docs tree and ext/files, so the module stays clean.
- A task with no single module stays under `ai/<date>/`.
- The day log (`ai/<date>/day.jsonl`) keeps one line per landing, pointing at wherever the task lives, so the rail and the board find it by events and not by crawling.
- The rule goes into new-task and task-loop, whose spawn-time line 1 takes the dir. Nothing moves retroactively until the owner sees a picture of it.
