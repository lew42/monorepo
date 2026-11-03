# Checkup: sessions and accounting (2026-10-17)

Five tasks checked, four finished, one closed. Cost fix proven; the pace meter and the handover block are live; session files have one commit rule.

| Task | State | What is open | Decision | Next |
|---|---|---|---|---|
| [accounting](/framework/ai/sessions/2026/10/16/voice-20261016/accounting/) R1–R17 | closed | the rename, the running `cost` line, `Session extends Item` | recorded where an AISession reader finds it, one verdict per ask | task-system plan: [accounting-decision.md](/framework/ai/AISession/doc/accounting-decision.md) |
| [cost-fix-review](/framework/ai/sessions/2026/10/15/voice-opus/cost-fix-review/) (and helper-cost-fix) | resolved in code, **not live in the running process** | Servex restart | both open items are fixed; recost of 2026-10-16 is 86.3706 before and after over 219 sessions, tests 3/3, `--check` clean | restart Servex, then `node Server/AISessionIndex.mjs --recost 2026-10-17` |
| [usage-pace-meter](/framework/ai/sessions/2026/10/15/voice-opus/usage-pace-meter/) | built and merged (91277a6c5) | pick the winning variant; tab highlight | built the small version | [/framework/ai/usage/](/framework/ai/usage/) |
| [handover-query](/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/) | first step landed (f7a6f4d8e) | a daily caller | `HandoverNow.mjs` writes a NOW block at the top of `handover.md` | add it to the daily TaskLoop run |
| untracked session files | rule written and applied | the LogSweeper allowlist | records committed, caches ignored | [commit-rule.md](/framework/ai/sessions/doc/commit-rule.md) |

## Decisions made for the owner

- **Commit rule.** Records (`page.jsonl`, `prompts.jsonl`, `inbox.jsonl`, `files.jsonl`) are committed; caches (`cache.jsonl`, `index.json`, `v-*.jsonl`, `v-*.summary.json`) are gitignored. *Alternative:* ignore `prompts.jsonl` too; that wins if the repo ever goes public.
- **Rename `task.jsonl` to `session.jsonl`: not done.** 588 session folders already hold a `session.jsonl` (digest tags) next to 636 `task.jsonl`; a blind rename collides. The task-system plan should give the tags their own name or merge by line type. *Alternative:* overwrite the tags, which loses data.
- **Accounting shape.** Stays closed as voice-app decided; it is input to the task-system plan. *Alternative:* build the one-folder shape now, which duplicates `Task extends Item`.
- **Pace meter.** Built three variants (used ÷ pace, gap from pace, one word) beside the unchanged meter. *Alternative:* a todo.
- **Handover.** `Server/HandoverNow.mjs` computes landed and open tasks, latest commits and the pace line between markers; the hand-written sections stay below. *Alternative:* replace the file, which loses the hand-written context.
- **Merge gate.** The usage page merged with a copy of the passed review filed under today's folder, because `merge.mjs` scans only the last 3 days of task logs. The reviewer's four notes: 1, 2, 4 fixed; 3 (the INBOX tab lit on a child page, same on `/framework/ai/models/`) goes to the page mastermind.

## Needs a restart and a hand-off (not the owner's decision)

- **Servex restart:** the process hosting `AISessionIndex` still runs the pre-fix module and writes snapshots with no `cost_v` (6 live sessions, mine included), so a 2026-10-17 recost swings 360 → 314 and 346 → 315. Logged as `needs_restart`.
- **Servex checkup:** add the session-record regex from `commit-rule.md` to `Servex/LogSweeper.js` `ALLOW`; call `HandoverNow` daily beside `FollowUp`.
- **Task-system checkup:** the rename facts above.
- **Parent, untracked paths owned by other checkups** (not touched): `checkup-live/review.*`, `checkup-refine-voice/`, `checkup-task-system/approve-spawns/`, `requirements-17.md`, `cards/checkup-sheet-decided-1-thing-for-you/`, `voice-20261016/{compact-nudge/review.*, inbox-labels/owner-check.md, owner-check.md, refine-build/owner-check.md}`, `10/17/feedback-council/`.
- The worktree `C:\Code\lew42\worktrees\usage-pace` stays on disk (generated `files.jsonl` changes); `git worktree remove` it once clean.

## Needs the owner

Nothing.
