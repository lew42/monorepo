# mastermind-servex-7: checkpoint, 2026-09-29 about 21:50

Start as **mastermind-servex-8** (on Fable, the owner's wish when usage allows): load the `servex-mastermind` skill, read this, then the last 15 lines of `task.jsonl` here. Tell every running task mastermind your id (list below). Messages for a retired mastermind-servex-N now reach the highest N by themselves.

## Your new role: skills architect (the owner, 2026-09-30)
Other masterminds no longer edit shared skills. They send you recommendations, and they append lines to a skill's improvements.md. You review both and apply them across the system. The rule is written into the minion, sub-mastermind and servex-mastermind skills. The owner's words: ai/2026-09-30/page-audit/owner-words.md (the end). **First job:** sweep `.claude/skills/*/improvements.md` for lines added since 2026-09-29, and apply the ones that hold.

## What went live tonight
- **Servex:** the revive guard (482ee7f2), the persistent spawn queue with ids, dedupe, finishing roles first and one-pass self-stop (33bbef55), follow(path) with its tail fix (47dd915a, 3191026c), and /api/hitl (chat-hitl). A restart no longer drops queued spawns, but it still interrupts working minions, so batch restarts.
- **The owner's voice path:** voice sessions with no leaks and the fast reply first (e71b7905, ced6b950). The ✦ sheet runs real sessions on ChatPanel (71933e2a), with a height grip on its top edge (3b8362d8). Clean mode in the AI 2 composer, the floor/cues contract, and the Assistant holding its reply while the owner speaks (46a74467). The Whisper label is gone (2c21d458).
- **Landed:** follow, clean-transcription, grip-everywhere, decided-default, ask-turn-quiet, readme-chain, audio, voice-on-panel.

## Running now
| Task | State | Next |
|---|---|---|
| voice-sessions | slice 2 (0ac19ab2) + ask_directory + fixes on qf-9. minion-voice-fixes is running: the review fixes, the floor rule, sessions keyed by project (phone = PC), and in ext/drawer/rail.js floor/cues through say() plus the resume line (its proof also checks grip-everywhere's hand-merged rail.js) | merge, then **the one pending Servex restart** (only when nvidia-smi shows the GPU under 20% for a minute: the owner dictates on whisper) |
| chat-hitl (row 40) | slice 1 merged (ux/Understand, ux/Rename). Slice 2 (ChatPanel marks, rename, revision pairs) is in a $3 fix round; its task is capped at $20 | review, merge, land |
| node-reliability (row 32) | next, in order: merge.mjs never overwrites a live jsonl, budgets enforced by the heartbeat, pool cleanup and prune (take_worktree fails, and there are 65 worktrees), peer messages, idle-release of masterminds, worktree posts stamped via:worktree | ask you for restarts |
| page-system-3-3 | inventory audit, then land; its brief has the owner's card-without-folder rule | — |

## Dispatch (ai/2026-09-25/servex-mastermind/dispatch.md)
ORDER NOW: 43 drill-in ($10, after chat-hitl lands) → 42 cards-and-logs → 31 readme-system → 33 → 15 → 16 task-placement (the system-prompt injection of ai/log.jsonl, and the AI tab) → 27. Cap 5 working.

## Lessons from tonight
- **Before you stop an agent, check the message's `from:`.** follow-2 and page-system-3-3 each asked to stop "the duplicate", and the duplicate was themselves.
- **A proof never posts as the owner.** A worktree server forwards posts into the main tree's live logs, so the POST must be stubbed (now minion #8 and in ui-test).
- **Work orphaned when you stop a parent sits uncommitted in the main tree.** Example: the Whisper label edit, found hours later.
- **Memory:** idle task masterminds hold the memory their own queued minions wait for. Until idle-release lands, sweep idle leaves: list_agents is about 1 MB, so filter it through node.
- **Two of the owner's Chrome tabs (pids 5412, 5656)** use a full core and about 1.1 GB each, all evening.
