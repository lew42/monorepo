Budget: $5

# Servex: a restart brings back queued and working agents, not just one

After the Servex restart at ~21:35 on 2026-10-22, only mastermind-system-architect-2 was resumed. `mastermind-figma-cards`, `test` (queued) and `item` were marked `gone` and had to be revived by hand. Fix it so every agent that was working or queued at restart comes back.

- The code: `Servex/agents/Agents.js` around the restart sweep (`out = { revived, told, gone, legacy, skipped }`, ~line 390–460, and `revivable` ~570). Read the agents registry rows for those three ids (find where it lives from the code) and the Servex log for that restart to see which branch put each in `gone`.
- Fix the cause, not the symptom. A queued agent (never started) should start again; a working one should resume. Keep refusing for real reasons (cwd deleted, own `system` prompt, etc.), but log the reason on the row.
- Add a test that fakes a registry with one working and one queued row, runs the sweep, and expects both revived.
- Write the rule in one line in the Servex agents doc that covers restarts (grep "restart" under `Servex/` docs).

Work in your worktree, commit, do not merge. Final reply: why each of the three went gone, the commit, the test result.
