# Findings: AI system docs (2026-10-08)

## Changed
- `/framework/ai/system/` now opens on 12 class cards of Servex (icon, gist, core API, source link), then the live agents from the running Servex, then six "where it lives" cards. The old concept cards moved one click down, under "Concepts". Code: `ai/system-classes.js`, `ai/overview.js`.
- New: `Servex/doc/sdk.md` (how an agent is started, tools, session files, `sdk-ts` vs `claude-vscode`, verified against real session files), `Servex/doc/architecture.md`, `ai/doc/architecture.md`; linked from `ai/readme.md` and `Servex/readme.md`.
- `ai/concepts.js` minions line no longer says "Opus judges" and now says the mastermind/minion line is not a fence.

## Stale or missing
- `Servex/readme.md` is 388 lines, far over the ~100 target. Not cut now (non-destructive); a Haiku pass should split it into a short index plus `doc/` files.
- `ai/readme.md` is 71 lines but still lists AI 2 / `ai2/` as live in places the root readme calls retired.
- The concept pages (`/framework/ai/<slug>/`) were not individually re-read; the `minions` line was the only one fixed. A Haiku audit per page is the next step.
- `ai/sessions/` readme and architecture belong to minion-session-class; not touched. Its `doc/decisions.md` can serve as its architecture.md.
- The class cards' API lists are hand-picked from source. They go stale silently; a node script could check each listed member still exists (law 7).
- No dedicated page yet per Servex class; card links go to the nearest existing doc.

## Not yet classes (should be)
- `Servex/agents/policy.js`, `jobs.js`, `hitl.js`, `inbox.js`, `directory.js`, `experts.js`, `claims.js`, `page_tools.js`: module-level functions with state.
- `ai/skills.mjs` and the task-log writers (`new-task`/`finish-task` logic): scripts, not an `AITask` object everywhere.
- `Heartbeat`/`TaskLoop`/`Budget` are classes but take `(...args)` with no shared base; a common base would help the card view.

## Note: owner
Note: the Servex pool failed to produce a worktree (log event `pool`); I made one by hand with `Server/worktree-up.mjs`. Worth a look.
Reused: docs-vs-code-audit (heartbeat name clash is still open), task-audit, token-accounting.
