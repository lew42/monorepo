# Resource management: plan (mastermind-resources, 2026-11-06)

The brief: [session.jsonl line 1](session.jsonl). The Nov 4 investigation: [report.md](../../../04/spawned/mastermind-process-cleanup/report.md). Since then much landed ([Servex/doc/processes.md](/Servex/doc/processes.md): closeout, sweep log line, commit gate, Crumbs fix).

## What was found tonight (21:20, commit 35.8 of 57 GB = 63%)

- **The idle fixer burning a core (item 4) is a pool race, not the CLI.** At boot (20:17:00) `Fixer.take_slot()` took qf-2 with `Pool.take_sync()` while `Pool.adopt()` (started in the Pool constructor, `Servex/Pool.js:59`) was still looping over the slots. `adopt()` read `slot.state === "ready"` for qf-2, then awaited `answers(slot.url)`; the server was not up yet, so it called `remove(slot)` on the slot the fixer now held (`Servex/Pool.js:590`, no re-check after the await). `worktree-down` deleted every file and failed on the folder itself ("Permission denied": the fixer's claude.exe has its cwd there). The fixer sat in an empty folder and its claude.exe ran at ~105% of a core from 20:17 (only it; the other 10 claude.exe were at 0–2%). The same thing happened to qf-1 at 15:43 (fixer-1 then reported "my worktree is an empty folder").
- Relief taken: fixer-1 stopped at 21:21 (our agent, no use in a gutted folder). `Fixer.ensure()` starts it again on the next quick fix, still pointing at the gutted qf-2 until the fix lands.

## Decisions

- **Two builders, two worktrees, Sonnet high**, fenced by file: [queue-pids/requirements.md](queue-pids/requirements.md) (items 1 and 3) and [relief/requirements.md](relief/requirements.md) (items 2 and 4). Both touch `Servex/Servex.js` in different methods; git merges that. I review each diff and merge; neither merges itself. Alternative: one builder for all four (fewer collisions, but serial and a bigger context).
- **No Servex restart by us.** After merging, voice-app is told a restart is needed.
- **Item 5 is a proposal** to the owner (owner_note), not built: gate 85/95, and what a 48 GB page file changes.
