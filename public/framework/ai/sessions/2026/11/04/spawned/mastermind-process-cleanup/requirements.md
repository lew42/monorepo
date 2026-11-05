# Process cleanup: closing a task leaves nothing running

Owner's words: "every mastermind who spawns anything leaves zero footprint, and zombies get closed automatically, with the cause fixed so nobody has to ask again." Investigation: [report.md](report.md) (section 7 is the approved list). The approval and the node-driven requirement came from `vscode-5132a480`.

## Deliverables

Status: built, reviewed and merged into compliance/dev (merge c3a59f3ba, 2026-11-04). Ticked = built, unticked = not built.

- [x] 1. `Lifecycle.kept()` checks the pool file, not the `qf-N` path. The live sweep runs and now logs every pass; an empty process list is retried twice and reported as `left` with its cause (the cause of "it closed nothing").
- [x] 2. `worktree-down` retries back off (doubling, cap 6 h, one `risk` note on the 5th failure).
- [x] 3. Every sweep is logged. New spawns are gated on commit charge (`SERVEX_COMMIT_HIGH_PCT` 80, `SERVEX_COMMIT_FULL_PCT` 90).
- [x] 4. A ready pool slot holds no browser; the claim state file in `Tunnel.mjs` stops a second tunnel. 
  - [ ] Not built, recorded in [improvements](/Servex/improvements.jsonl): idle unload of whisper-server and recite python (needs start-on-demand in their clients), keeping only the newest tunnel per name.
- [x] 5. Close-out rule in `Servex/agents/roles/mastermind.md` and `finish-task`.
- [x] 6. `worktree-up.mjs` records the owner of a hand-started server.
  - [ ] Not built: `start_server` cannot carry the caller (recorded in improvements).
- [x] 7. Extras: a leftover folder is not a project; a merged clean worktree is removed from git and disk by `Lifecycle.closeout` and `merge.mjs` (never while an agent or the calling process works inside it); every Playwright launcher's browser is closed by `Server/browser-watchdog.mjs`, and closing a browser also ends its launcher script (not the main checkout's own).

- [x] 8. Follow-up 2026-11-05 (`mastermind-completion-truth` reported `close_task` returning "process list could not be read" twice): the list now retries three times, a failure names its cause (PowerShell or netstat error), the sweep writes no `found gone` line from an unreadable list, and a worktree is kept while the list is unreadable. Check 12 covers it. Merged d0ce91844. Real cause, found after that merge: `Servex/Crumbs.js` wrapped `child_process` and lost `util.promisify.custom`, so `promisify(execFile)` resolved a bare string and the process list was empty inside every live Servex (sweep, close, `found gone` lines), though fine in a plain script. Fixed in `Crumbs.js` (merge recorded in the task log), proof `node Servex/Crumbs.test.mjs`, rule in `Servex/doc/restart.md` and `processes.md`.

## The proof

`node Servex/closeout.test.mjs` (1 to 2 minutes, temp `SERVEX_HOME`, port 18999): 12 checks on real servers, browsers and worktrees, asserting from the OS process list, `git worktree list` and the disk. Rule set and decisions: [Servex/doc/processes.md](/Servex/doc/processes.md).

## Decisions

- A close that leaves something does not undo a landing (the merge is already done); it is logged as `LEFT: ...` and the sweep keeps retrying.
- whisper/recite are not unloaded: a 14 s cold start would break dictation without a client-side start-on-demand.
