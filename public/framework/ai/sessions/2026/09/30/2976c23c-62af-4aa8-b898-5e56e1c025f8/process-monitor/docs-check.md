# Docs check: process monitor, orphan reaper, worktree clean-up

Read only `Servex/readme.md` and `Servex/doc/processes.md` (load_module tool was
denied permission, so read directly).

**Clear:** the group table (task/front desk/Servex/session/dev servers/orphans/other),
PID-tracked agents going "lost", orphan flag + reap rules with their env-var
overrides, the five worktree states and the five-step removal, the Git-Bash-lies-
about-parents fix (with its proof link), and the cost line. Someone could watch
CPU/RAM sort itself into groups and understand why an orphan or worktree would
or wouldn't get cleaned up.

Gaps, most important first:

1. No on-demand trigger. Both loops are timer-only (10 s / 10 min) — nothing here
   says how to force one cycle now to check a specific process or worktree.
2. `GET /api/processes`'s response shape is never shown — no example JSON, so a
   caller doesn't know the field names (`reaped`, `worktrees`, per-group lists…).
3. The `processes` log's path isn't stated. The readme's "Where things live"
   gives the generic `logs/<name>.jsonl` pattern but never confirms this log
   uses it or shows how to tail it.
4. "in use" worktree state says "git touched it in the last 2 hours" without
   saying which git operations count — any command, or only ones that change refs?
5. No failure path for worktree removal step 1: what happens if
   `junction-check.mjs` fails — retried, flagged, or silently skipped?
6. Not stated whether `system_health` / `GET /api/processes` are reachable from
   a worktree's own Servex-connected session, or only the main instance.
