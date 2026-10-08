# mastermind-servex-6: checkpoint, 2026-09-29 about 19:15

Start as **mastermind-servex-7**: load the `servex-mastermind` skill, read this, then the last 15 lines of `task.jsonl` here. First, tell every running task mastermind your id (follow, voice-sessions, lifecycle, page-system-2, audio, mobile-nav), then stop mastermind-servex-6. Use `send_to_agent` with the field **`text`**; a wrong field name delivers "undefined".

## Launching
The dispatch table is `ai/2026-09-25/servex-mastermind/dispatch.md` (see **ORDER NOW (19:15)**). The cap is 5 working until lifecycle lands, then 8, and more than 4 GB free. `gate.mjs` here waits for that (CAP env, default 5); run it with Bash `run_in_background`. A gate run from -6 may still be waiting.

## Running now
| Task | State | Owed |
|---|---|---|
| **voice-sessions** (row 34) | QUEUED for memory (position 3), no id yet | The owner is testing on the phone: the first slice is the per-session fast and smart pair in the ✦ sheet. Design: ai/2026-09-29/voice-sessions/design.md |
| **follow** (row 39) | built in qf-7 (28988707), not merged; its docs check is queued for memory | merge, then a Servex restart |
| lifecycle (row 37) | fixing 4 review findings (incl. browser.mjs); reaper ran live | lands → cap goes to 8. It is back under its original id `task-mastermind-lifecycle`; its minions' parent ids confuse Servex, so relay for it |
| page-system-2 | phase 2 in two worktrees | merges, then restarts Servex itself |
| audio | builds ext/Chat ChatPanel (reads design.md's chat line plus the old shape; `place` key) | — |
| mobile-nav | merged 35db508c; adding the "session" label and a New session button in the sheet | land |

Landed under -6: nested-tasks (7067adee), file-system (0001a763), page-files-log (2b566fc1, b3fd6bd6).

## Designs written today (the owner's voice-session dictation, 6:30 to 7:10 PM)
- `voice-sessions/design.md`: one picture and one "what goes where" table. Also `requirements.md` (items 1 to 16; the table wins where they differ) and `refine*/coverage.md` (every sentence traced, 0 dropped).
- `servex-mastermind/project-aware.md`: what is per project in Servex and what is wired to the monorepo; key by Host; one Servex for now; a new-site checklist. Card `2026/09/29/is-servex-project-aware`.
- `follow/requirements.md`.

## System fixes today
- The build order (build → docs → a fresh mastermind reads the docs → review → merge) is in sub-mastermind, minion, documentation and finish-task (0be53aa7).
- A brief-only folder gets a queued `task.jsonl` line 1 (dc75fd34, in my skill).
- slow-card-fix's orphaned compress.js was committed (e646b081).
- **node-reliability's brief (row 32) holds most of today's bugs**: a queued spawn returns no id, so review.mjs and clarity.mjs lose the agent (5 look-ai2 clarity runs, 3 mobile-nav reviewers); the queue holds duplicates; a restart revives stopped agents; parenthood follows the row id instead of the session. It is the most valuable launch after readme-system; consider moving it first.
- tooling-gaps (row 15) got page-files-log's four gaps and the duplicate-key check for merge.mjs.

## Lessons
- **Python text mode on Windows writes CRLF.** Two SKILL.md files lost their descriptions in the skill listing. Use `newline=''` or sed.
- **The monitor keeps flagging idle clarity and reviewer agents.** Stop them after checking their output file is written; each holds about 300 MB.
- `system_health low_ram_gb` is set to 2.5 until the next Servex restart. The spawn gate is a separate 4096 MB.
- The owner's Chrome tab pid 5656 was using a full core at 18:25. It isn't ours; mention it if the fans come up.
- The main tree has about 324 uncommitted files, so merges keep falling back to a working-tree merge. Worth an audit minion when memory allows.

## Update 19:35
- **voice-sessions is running**, not queued: slice 1 merged (e71b7905) and live. The per-session pair answers: fast in 1.1 s, smart (Opus) in 4.0 s. Slice 2 minions are queued for memory.
- **A second "mastermind servex-6" is queued at Servex's spawn gate** (position 4, since 19:32:49, after a restart). If it starts, stop it at once, and stop mastermind-servex-6 too. Only servex-7 should run.
- **A restart drops the spawn queue** (follow found this: `admission()` in Servex.js keeps it in memory only). Anything queued before a restart must be re-spawned by its owner. This goes to node-reliability.
- **Fans:** two of the owner's own Chrome renderers use a full core each (pids 5412 and 5656, 1 GB each). Not ours; tell the owner which tabs if the fans come up.
