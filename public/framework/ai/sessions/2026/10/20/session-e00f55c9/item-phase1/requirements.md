# Item/List: finish Phase 1 (you are a mastermind, on Opus, high effort)

**Why Opus:** it's the save and stream backbone every session, task and chat record stands on; a mistake here loses data silently.

**The owner (2026-11-01, about 21:45, [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), point 9):** the Item/List system was a multi-phase plan with only about half done; continue it, and make sure its tests exist and run.

**Where it stands:** [core/doc/status.md](/framework/core/doc/status.md). Phase 0 is done (2026-11-01). Phase 1 is "about half". Its "Next steps", item 4, lists what's left:
- the `unset` verb;
- a warning for unknown bare keys;
- the `source` tag and `batch()` (one line per action);
- `reset`/`epoch` and the gap check (recovery after a file is rewritten);
- merging keystrokes while typing.

The design: [design/phase-1.md](/framework/research/2026/10/29/persistence-sync/design/phase-1.md). The owner's open calls are in [item-mvp/plan.md](/framework/ai/sessions/2026/10/31/session-e3fd9043/item-mvp/plan.md); read them, and don't decide the ones marked as the owner's.

## Do (worktree; one merge per item; a failing test first for each)
1. **`unset`:** remove a key, replayed exactly. Test it with snapshot plus tail.
2. **The unknown-bare-key warning:** a warning only, never a refusal.
3. **`source` + `batch()`:** one saved line per user action. Show that the line count drops on a real flow (a page edit).
4. **`reset`/`epoch` + the gap check:** a reader that sees a file rewritten under it recovers without double-applying or losing lines. Test it against `Server/SessionConsolidate.mjs`-style rewrites.
5. **Merging keystrokes while typing:** coalesce rapid `set`s on one key into one saved line, flushed on blur, a pause or before any other line.
6. **Before every merge:** run `node Server/ReplayCompare.mjs <checkout of the previous michael/dev>`. All 3,931+ records must give identical state, title and children; any difference is explained, or the merge doesn't happen. Then run `node public/framework/core/Test/run-all.mjs`.
7. **Update `core/doc/status.md`** and the Item/List readmes as each item lands (Law 9).

**Fences:**
- worktree only;
- `node Server/review.mjs <this dir> <worktree>`, then `node Server/merge.mjs`, for EVERY landing. Never commit code straight to `michael/dev`; if a hook blocks you, stop and report it to vscode-mastermind;
- **don't turn on `Item.Store.marked_lines`** (that's the owner's step);
- don't change what's on disk (no migrations);
- commit by path; no `python -`;
- Servex restarts only when no voice call is live.

**Budget:** about $30. Report each merge to vscode-mastermind in 2 lines.
