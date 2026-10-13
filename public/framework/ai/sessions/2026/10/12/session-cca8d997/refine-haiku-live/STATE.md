# refine-haiku-live — state

Worktree `C:/Code/lew42/wt-refine-haiku-live`, branch `worktree/refine-haiku-live`.

- ✅ **1. Haiku by default** — `RefineCall.model()` is the one switch (Haiku; luna only when `session-backend.txt` says `openrouter`); voice assistants' "auto" now means Claude. Commit 503beb09a (worktree). Doc: `ai/doc/models.md`.
- ✅ **Design** — `ext/Refine/doc/live-refine-2026-10-12.md`; contract `contract.md`.
- ✅ **3. LiveRefine** — one Haiku call per batch, paced 3 sentences or 6 s; ~9 s per sentence (measure/summary.md).
- ✅ **2+3. One chat input** — composer() everywhere, mic refines live; proof shots in one-input/proof/.
- ✅ Merged into michael/dev (14e4afd80), landed. ⬜ Servex restart makes /api/refine/live and the Haiku default live.

Spawn note: Servex refused `spawn_agent` minions outside its worktree pool, so the builders run as in-process Sonnet agents in this worktree.
Session detail chat belongs to @mastermind-sessions-detail; told by page note to use composer().
