# servex-health: state

Cluster: servex-infra-health in [asks.md](/framework/ai/doc/asks.md).

- Done: `reviewer`, `checker`, `voter` already have `skill:` rows in `Servex/agents/roles.js` (added by skill-usage-audit); nothing left.
- Done: `Server/branch-prune.mjs` (dry run by default, `salvage/<branch>` tag first, manifest in `Server/logs/branch-prune-run-*.json`). It pruned 89 merged `worktree/*` branches; undo is `git branch <name> salvage/<name>`. 81 remain (unmerged or checked out).
- Done: private Servex boot on port 18090 with current code answered `/agents`; `sustain.mjs --restart --dry-run` passed `node --check` and listed mid-turn agents that get revived.
- Done: one batched restart (also activates openrouter-gap's `Agents.js` change). After-rate: see the end of this file.
- Open, smallest next step: transcription crash cause is still unnamed (needs a reproduction with `server_logs` during a dictation); phantom process reap dry run (`Servex/orphan.mjs --dry`) has no owner yet.
