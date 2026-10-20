# Servex/Pool: stop the quick-fix pool leaking slots

Budget: $6. Sonnet, medium effort. Parent: mastermind-system-architect (tails your `session.jsonl`; log there with the `log` tool). Work in `C:\Code\lew42\worktrees\pool-leak` (branch `worktree/pool-leak`); commit there; do not merge, do not restart Servex.

## The ask (vscode-mastermind, 2026-10-20 16:45)

All three slots are held right now: qf-4 by fixer-1 (gone), qf-6 and qf-7 by landed, dormant minions. Fix it in `Servex/Pool.js` so a slot comes back when its holder is done, and test it with the existing pool tests.

## What the parent found (verify, then fix)

`.worktree-pool.json` (main tree): `qf-4 taken fixer-1 held_by fixer-1` · `qf-6 taken minion-session-record` · `qf-7 taken minion-tab-session-record`. Dirt in qf-6/qf-7: ~80 `files.jsonl`, one `page.jsonl` (already clean via `Pool.server_log`), and `public/framework/ai/board.jsonl`.

1. **`ai/board.jsonl` is server noise in a slot:** the lines are `health-watch` cards written by the slot's own page watcher (`health-supervisor.mjs`, see `watch()`), never an agent's work. Add it to `Pool.server_log` (so return treats it as clean and restores it from HEAD), and check `Server/` for any other file the slot's own server or watcher writes on its own.
2. **A landed holder is done:** `held()` keeps a `dormant` holder for `ORPHAN_HOURS` (12). A dormant holder whose task has LANDED (its task log, `row.task_dir` → `SessionRecord.log_file`, holds a `finish` line or an `assign` with `landed_at`) counts as done at once. Rules 2 and 3 in the `reclaim()` comment (no live worker or child in the slot; no own changes or unmerged commits) still protect any work.
3. **An explicit hold by an unknown or gone holder:** in `held()`, `slot.held_by` with no registry row at all keeps the slot forever (`away` needs a row). A `held_by` the registry does not know, held longer than `ORPHAN_HOURS` since `taken_at`, is released like the unknown-`taken_by` case below it.

## Done when

- [ ] `node Servex/Pool.test.mjs`, `pool-heal.test.mjs`, `pool-hold.test.mjs` pass, with one new case each for 1–3 (in the existing style).
- [ ] The rules comment above `reclaim()` and `Servex/doc/pool.md` (if it exists) say the new rules in one line each.
- [ ] Committed in the worktree; land with `finish-task` in your own `session.jsonl`. Touch only `Servex/Pool.js`, its tests, its doc.
