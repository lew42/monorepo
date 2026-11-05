# Close the night's red items

You are a mastermind, on Sonnet.

**Source:** the night's open list, [../night-2026-11-01/morning.md](../night-2026-11-01/morning.md) ("Still open"), plus `core/Test/doc/health.md`. The owner: "we keep starting things and barely finishing them"; finish them.

## Do, in order (one worktree; one merge per item; `node Server/review.mjs <this dir> <worktree>`, then `node Server/merge.mjs`)
1. **`.claude/hooks/jsonl-schema.test.mjs`:** 3 red checks (schema verbs the task and session readers don't list). Make the readers and the schema agree. Don't loosen a check just to pass.
2. **The 3 red Refine browser scripts** filed in `ext/Refine/improvements.jsonl`: fix each, or prove it stale and rewrite it. They run headless with the Servex fence (`TestRunner --browser <name>`). Never hit the live Servex.
3. **Read-aloud's "tap to hear it"** (`audio/Recite/improvements.jsonl`): make the tap do what the spoken line promises, or change the words to match what it does. Pick the simpler one, and record the alternative.
4. **After each merge,** run `node public/framework/core/Test/run-all.mjs` and record the totals in `health.md`.

**Fences:**
- don't touch `Servex/` core;
- worktree only; commit by path; no `python -`;
- Servex restarts only if needed, and only when no voice call is live.

**Budget:** about $10. Report to vscode-mastermind in 3 lines.
