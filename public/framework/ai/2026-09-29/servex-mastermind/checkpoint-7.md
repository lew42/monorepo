# mastermind-servex-7: checkpoint, 2026-09-29 about 20:45

Start as **mastermind-servex-8**: load the `servex-mastermind` skill, read this, then the last 15 lines of `task.jsonl` here. Tell every running task mastermind your id (list below), then stop -7. Messages for a retired mastermind-servex-N now reach the highest N by themselves (33bbef55).

## What changed tonight (live on Servex since 20:31)
- **Revive guard** (482ee7f2): Servex never wakes an agent that was stopped on purpose, whose task has landed, or whose cwd is gone. To wake one anyway, pass `revive: true`.
- **Persistent queue** (33bbef55): the spawn queue survives a restart (spawn-queue.json). A queued spawn returns its id at once. Duplicate spawns are merged. Reviewers and clarity checks go first and stop themselves after their one turn.
- **follow(path)** (47dd915a): one message per burst of changes. Its tail bug (a burst's last line waits for the next write) is being fixed by minion-follow-tail.
- **Voice sessions slice 1 + no leaks** (e71b7905, ced6b950): /api/session/new, /say and /nav. The pair spawns on the first sentence, stops after 5 idle minutes, and at most 2 pairs run. Fast reply 3.6 s cold, 1.7 s warm.
- Decided by default (decide.mjs, and undoable taps), /ask/turn console error (fb7aa793), readme-chain, audio (b1b82d33): all landed.

## Running now
| Task | State | Next |
|---|---|---|
| voice-sessions | slice 2 (0ac19ab2) + ask_directory on qf-9, not merged; minion-voice-fixes queued | merge, then a restart (batch it) |
| minion-voice-on-panel (mine) | rebasing the ✦ sheet onto ChatPanel: start on the first sentence, a guarded resume line, nav, say | review, merge, land; then tell chat-hitl that ChatPanel is free |
| clean-transcription (row 41) | minion-clean-mode (the phone composer) + minion-structure-2 (refine.mjs headings) | when clean-mode is done, ChatPanel is free for chat-hitl |
| chat-hitl (row 40) | slice 1: /api/hitl + ux/Understand + ux/Rename, standalone | slice 2 waits for ChatPanel (see above); the restart is mine to batch |
| node-reliability (row 32) | next, in order: merge.mjs never overwrites a live jsonl, budgets in code, pool cleanup + prune (take_worktree fails), peer messages, idle-release of masterminds | ask me for restarts |
| follow | landing after minion-follow-tail | restart batch |
| page-system-3-3 | inventory audit, then land; its brief has the owner's card-without-folder decision | — |

**Pending restart list:** follow-tail, voice-sessions slice 2, chat-hitl slice 1. Restart only when the owner isn't dictating: nvidia-smi GPU under 20% for 2 minutes (whisper uses the GPU).

## Dispatch (ai/2026-09-25/servex-mastermind/dispatch.md)
ORDER NOW: 42 cards-and-logs (brief ends with the owner's card-without-folder rule) → 31 readme-system → 33 → 15 → 16 task-placement (now also the system-prompt injection of ai/log.jsonl, and the AI tab) → 27. Cap 5 working.

## Lessons
- **An agent can't tell which id it runs under.** follow-2 and page-system-3-3 each asked me to stop "the duplicate", which was themselves. Check the `from:` of the message before you stop anything.
- **Memory:** idle task masterminds hold the memory their own queued minions wait for. Idle-release is in node-reliability's brief. Until it lands, sweep idle leaves (finished minions, reviewers, clarity checks, master-assistant with 0 turns) with list_agents, filtered through node (the raw output is 1 MB).
- **Two Chrome tabs (pids 5412, 5656)** have each used a full core and about 1.1 GB all evening. They're the owner's; mention them if memory or fans come up.
- The owner's per-folder `ai/log.jsonl` rule is in the minion and sub-mastermind skills (153c8764).
