# Helper fixes — the fast assistant

The first test of a task mastermind started from a VS Code tab through Servex. Prove three
things: a worktree, a commit on its own branch, and a report on the board.

From [handoff2.md](../../handoff2.md), items 2 and 3:

1. **The fast assistant stops contradicting itself.** On card `topic-mufuomsy` it said "a helper
   is looking", then one second later "helpers are paused". Find the real cause and fix it so it
   never promises a helper it has not started.
2. **Helpers report back to the assistant.** Start each helper with the fast assistant as its
   parent, so Servex wakes the assistant with the helper's answer as well as posting it on the
   card. The assistant must not repeat the answer to the owner twice.

Fence: code edits only inside the worktree `../worktrees/helper-fixes` (branch
`worktree/helper-fixes`). Commit there. No merge into michael/dev, no Servex restart.
